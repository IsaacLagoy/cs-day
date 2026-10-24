import type { IncomingMessage, Server } from 'node:http';
import type { Duplex } from 'node:stream';
import { WebSocket, WebSocketServer } from 'ws';
import type { ButtonConfig, ConnectedClient } from '../src/lib/types';
import { getSessionInfo, setPublicBaseUrl } from './session-state';

type Role = 'host' | 'view' | 'controller' | string;

type Client = {
	ws: WebSocket;
	clientId: string;
	role: Role;
};

const clients = new Map<string, Client>();
const attachedServers = new WeakSet<Server>();

let lastButtonConfig: ButtonConfig[] = [
	{ name: 'left', enabled: true },
	{ name: 'right', enabled: true },
	{ name: 'jump', enabled: false }
];

// Latest scene style from the host, replayed to controllers that join later
let lastSceneStyle: string = 'default';

function requestOrigin(req: IncomingMessage): string | null {
	const host = req.headers.host;
	if (!host) return null;
	const proto = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
	return `${proto}://${host}`;
}

function isLocalAddress(addr: string | undefined): boolean {
	if (!addr) return false;
	return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

function sendJson(ws: WebSocket, payload: unknown): void {
	if (ws.readyState !== WebSocket.OPEN) return;
	ws.send(JSON.stringify(payload));
}

function roster(): ConnectedClient[] {
	return [...clients.values()].map(({ clientId, role }) => ({ clientId, role }));
}

function broadcastPresence(): void {
	const payload = { type: 'presence', clients: roster() };
	for (const client of clients.values()) {
		if (client.role === 'host' || client.role === 'view') {
			sendJson(client.ws, payload);
		}
	}
}

function clientsWithRole(role: Role): Client[] {
	return [...clients.values()].filter((c) => c.role === role);
}

function handleMessage(from: Client, raw: string): void {
	let msg: { type?: string } & Record<string, unknown>;
	try {
		msg = JSON.parse(raw);
	} catch {
		return;
	}

	if (!msg || typeof msg.type !== 'string') return;

	if (msg.type === 'ping') {
		sendJson(from.ws, { type: 'pong' });
		return;
	}

	const tagged = { ...msg, clientId: from.clientId, role: from.role };

	if (msg.type === 'playerInput' || msg.type === 'gameUpdate') {
		for (const client of clientsWithRole('view')) {
			sendJson(client.ws, tagged);
		}
		return;
	}

	if (msg.type === 'buttonConfig') {
		if (Array.isArray(msg.buttons)) {
			lastButtonConfig = msg.buttons as ButtonConfig[];
		}
		for (const client of clientsWithRole('controller')) {
			sendJson(client.ws, tagged);
		}
		return;
	}

	if (msg.type === 'sceneStyle') {
		if (typeof msg.style === 'string') {
			lastSceneStyle = msg.style;
		}
		for (const client of clientsWithRole('controller')) {
			sendJson(client.ws, tagged);
		}
		return;
	}

	if (msg.type === 'buttonConfigRequest') {
		for (const client of clientsWithRole('host')) {
			sendJson(client.ws, tagged);
		}
		if (lastButtonConfig.length > 0) {
			sendJson(from.ws, {
				type: 'buttonConfig',
				clientId: 'server',
				role: 'host',
				buttons: lastButtonConfig
			});
		}
	}
}

function onSocket(ws: WebSocket): void {
	let registered: Client | null = null;

	ws.on('message', (data) => {
		const text = typeof data === 'string' ? data : data.toString();
		if (!registered) {
			try {
				const hello = JSON.parse(text) as { type?: string; clientId?: string; role?: string };
				if (hello.type !== 'hello' || !hello.clientId || !hello.role) return;
				const existing = clients.get(hello.clientId);
				if (existing && existing.ws !== ws) {
					try {
						existing.ws.close();
					} catch {
						/* ignore */
					}
				}
				registered = { ws, clientId: hello.clientId, role: hello.role };
				clients.set(hello.clientId, registered);
				sendJson(ws, { type: 'welcome', clientId: hello.clientId });
				if (hello.role === 'controller' && lastButtonConfig.length > 0) {
					sendJson(ws, {
						type: 'buttonConfig',
						clientId: 'server',
						role: 'host',
						buttons: lastButtonConfig
					});
				}
				if (hello.role === 'controller') {
					sendJson(ws, { type: 'sceneStyle', clientId: 'server', role: 'host', style: lastSceneStyle });
				}
				broadcastPresence();
			} catch {
				/* ignore */
			}
			return;
		}
		handleMessage(registered, text);
	});

	const cleanup = () => {
		if (!registered) return;
		if (clients.get(registered.clientId)?.ws === ws) {
			clients.delete(registered.clientId);
			broadcastPresence();
		}
		registered = null;
	};

	ws.on('close', cleanup);
	ws.on('error', cleanup);
}

function sessionHandler(req: IncomingMessage, res: import('node:http').ServerResponse, next: () => void): void {
	const url = req.url?.split('?')[0] ?? '';
	if (url !== '/api/session') {
		next();
		return;
	}

	res.setHeader('Cache-Control', 'no-store');
	res.setHeader('Content-Type', 'application/json');

	if (req.method === 'GET') {
		res.end(JSON.stringify(getSessionInfo(requestOrigin(req))));
		return;
	}

	if (req.method === 'POST') {
		if (!isLocalAddress(req.socket.remoteAddress)) {
			res.statusCode = 403;
			res.end(JSON.stringify({ error: 'local only' }));
			return;
		}
		const chunks: Buffer[] = [];
		req.on('data', (chunk) => chunks.push(chunk as Buffer));
		req.on('end', () => {
			try {
				const body = JSON.parse(Buffer.concat(chunks).toString() || '{}') as {
					publicBaseUrl?: string | null;
				};
				setPublicBaseUrl(body.publicBaseUrl ?? null);
				res.end(JSON.stringify(getSessionInfo(requestOrigin(req))));
			} catch {
				res.statusCode = 400;
				res.end(JSON.stringify({ error: 'invalid json' }));
			}
		});
		return;
	}

	res.statusCode = 405;
	res.end(JSON.stringify({ error: 'method not allowed' }));
}

export function attachSessionMiddleware(middlewares: {
	use: (fn: (req: IncomingMessage, res: import('node:http').ServerResponse, next: () => void) => void) => void;
}): void {
	middlewares.use(sessionHandler);
}

export function attachWebSocket(httpServer: Server): void {
	if (attachedServers.has(httpServer)) return;
	attachedServers.add(httpServer);

	const wss = new WebSocketServer({ noServer: true });
	wss.on('connection', onSocket);

	httpServer.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
		const path = req.url?.split('?')[0] ?? '';
		if (path !== '/ws') return;
		wss.handleUpgrade(req, socket, head, (ws) => {
			wss.emit('connection', ws, req);
		});
	});
}

