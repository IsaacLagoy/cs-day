import type { Plugin, PreviewServer, ViteDevServer } from 'vite';
import { attachSessionMiddleware, attachWebSocket } from './game-server';

function bind(server: ViteDevServer | PreviewServer): void {
	attachSessionMiddleware(server.middlewares);

	const setupWs = () => {
		if (!server.httpServer) return;
		attachWebSocket(server.httpServer as import('node:http').Server);
	};

	setupWs();
	server.httpServer?.once('listening', setupWs);
}

export function gameServerPlugin(): Plugin {
	return {
		name: 'cs-day-game-server',
		configureServer(server) {
			bind(server);
		},
		configurePreviewServer(server) {
			bind(server);
		}
	};
}
