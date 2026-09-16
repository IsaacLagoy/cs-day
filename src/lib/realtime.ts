import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { ButtonConfig, ConnectedClient, Message } from '$lib/types';

export interface WebSocketConnection {
  send: (gameStateUpdate: Record<string, any>) => void;
  sendInput: (button: string, pressed: boolean) => void;
  sendButtonConfig: (buttons: ButtonConfig[]) => void;
  requestButtonConfig: () => void;
  clientId: string;
  disconnect: () => Promise<void>;
}

export const messages: Writable<Message[]> = writable([]);
export const clientId: Writable<string | null> = writable(null);
export const connectedClients: Writable<ConnectedClient[]> = writable([]);

const HEARTBEAT_MS = 20_000;
const RECONNECT_MS = 750;

type ActiveConn = {
  ws: WebSocket;
  id: string;
  role: string;
  intentional: boolean;
};

const active = new Map<string, ActiveConn>();

if (typeof window !== 'undefined') {
  setInterval(() => {
    messages.update((msgs) => (msgs.length > 100 ? msgs.slice(-50) : msgs));
  }, 30_000);
}

function wsUrl(): string {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws`;
}

function pushMessage(msg: Message): void {
  messages.update((m) => [...m, msg]);
}

export async function disconnectAll(): Promise<void> {
  for (const conn of active.values()) {
    conn.intentional = true;
    try {
      conn.ws.close();
    } catch {
      /* ignore */
    }
  }
  active.clear();
}

export function connect(role: string, existingId?: string): WebSocketConnection {
  const id: string = existingId || crypto.randomUUID();
  clientId.set(id);

  if (typeof window !== 'undefined') {
    localStorage.setItem('clientId', id);
  }

  const prev = active.get(id);
  if (prev) {
    prev.intentional = true;
    try {
      prev.ws.close();
    } catch {
      /* ignore */
    }
    active.delete(id);
  }

  let socket: WebSocket | null = null;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let closed = false;

  const stopHeartbeat = () => {
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = undefined;
    }
  };

  const sendRaw = (payload: unknown) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  };

  const open = () => {
    if (closed) return;
    stopHeartbeat();
    socket = new WebSocket(wsUrl());
    const conn: ActiveConn = { ws: socket, id, role, intentional: false };
    active.set(id, conn);

    socket.addEventListener('open', () => {
      console.log(`[Realtime] Connected as ${role} with ID ${id}`);
      sendRaw({ type: 'hello', clientId: id, role });
      stopHeartbeat();
      heartbeat = setInterval(() => sendRaw({ type: 'ping' }), HEARTBEAT_MS);
    });

    socket.addEventListener('message', (event) => {
      let msg: { type?: string; clients?: ConnectedClient[] };
      try {
        msg = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (!msg || typeof msg.type !== 'string') return;
      if (msg.type === 'pong' || msg.type === 'welcome') return;
      if (msg.type === 'presence' && Array.isArray(msg.clients)) {
        connectedClients.set(msg.clients);
        return;
      }
      console.log('[Realtime] Received message:', msg.type, msg);
      pushMessage(msg as Message);
    });

    socket.addEventListener('close', () => {
      stopHeartbeat();
      if (active.get(id)?.ws === conn.ws) {
        active.delete(id);
      }
      if (closed || conn.intentional) return;
      console.warn('[Realtime] Socket closed, reconnecting…');
      reconnectTimer = setTimeout(open, RECONNECT_MS);
    });

    socket.addEventListener('error', () => {
      /* close handler reconnects */
    });
  };

  open();

  if (typeof window !== 'undefined') {
    const cleanup = () => {
      closed = true;
      void disconnectAll();
    };
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
  }

  async function disconnect(): Promise<void> {
    closed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    stopHeartbeat();
    const conn = active.get(id);
    if (conn) {
      conn.intentional = true;
      try {
        conn.ws.close();
      } catch {
        /* ignore */
      }
      active.delete(id);
    }
  }

  function send(gameStateUpdate: Record<string, any>): void {
    sendRaw({ type: 'gameUpdate', clientId: id, role, gameState: gameStateUpdate });
  }

  function sendInput(button: string, pressed: boolean): void {
    sendRaw({ type: 'playerInput', clientId: id, role, input: { button, pressed } });
  }

  function sendButtonConfig(buttons: ButtonConfig[]): void {
    sendRaw({ type: 'buttonConfig', clientId: id, role, buttons });
  }

  function requestButtonConfig(): void {
    sendRaw({ type: 'buttonConfigRequest', clientId: id, role });
  }

  return { send, sendInput, sendButtonConfig, requestButtonConfig, clientId: id, disconnect };
}
