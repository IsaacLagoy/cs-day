// src/lib/realtime.ts
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { ConnectedClient, ButtonConfig, Message } from '$lib/types';

export interface WebSocketConnection {
  send: (gameStateUpdate: Record<string, any>) => void;
  sendInput: (button: string, pressed: boolean) => void;
  sendButtonConfig: (buttons: ButtonConfig[]) => void;
  requestButtonConfig: () => void;
  clientId: string;
  disconnect: () => Promise<void>;
}

// Stores
export const messages: Writable<Message[]> = writable([]);
export const clientId: Writable<string | null> = writable(null);
export const connectedClients: Writable<ConnectedClient[]> = writable([]);

// Periodically clean up old messages to prevent memory bloat
if (typeof window !== 'undefined') {
  setInterval(() => {
    messages.update(msgs => {
      if (msgs.length > 100) {
        console.log('[Realtime] Cleaning message store, had', msgs.length, 'messages');
        // Keep only the last 50 messages
        return msgs.slice(-50);
      }
      return msgs;
    });
  }, 30000); // Every 30 seconds
}

// Single shared Supabase client
const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// Track active realtime channels
const activeChannels = new Map<string, RealtimeChannel>();

// Completely remove all realtime channels and force socket close
export async function disconnectAll(): Promise<void> {
  try {
    console.log('[Realtime] Disconnecting all channels');
    await supabase.removeAllChannels();

    // Force close the underlying realtime websocket (safe internal call)
    const rt: any = (supabase as any).realtime;
    if (rt && typeof rt.disconnect === 'function') {
      await rt.disconnect();
    }
  } catch (err) {
    console.warn('Error cleaning up Supabase connections:', err);
  }
}

// Primary connect function
export function connect(role: string, existingId?: string): WebSocketConnection {
  const id: string = existingId || crypto.randomUUID();

  // Clean up any existing channel with same id
  if (activeChannels.has(id)) {
    console.log('[Realtime] Cleaning up existing connection for', id);
    const oldChannel = activeChannels.get(id);
    oldChannel?.unsubscribe();
    activeChannels.delete(id);
  }

  clientId.set(id);

  // Persist ID for reconnects
  if (!existingId && typeof window !== 'undefined') {
    localStorage.setItem('clientId', id);
  }

  const channel: RealtimeChannel = supabase.channel('game', {
    config: { presence: { key: id } },
  });

  activeChannels.set(id, channel);

  // ---- Presence handling ----
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    const clients: ConnectedClient[] = [];
    for (const [presenceId, presences] of Object.entries(state)) {
      const presence = presences[0] as any;
      if (presence) {
        clients.push({ clientId: presence.clientId, role: presence.role });
      }
    }
    console.log('[Realtime] Connected clients:', clients);
    connectedClients.set(clients);
  });

  channel.on('presence', { event: 'join' }, ({ newPresences }) => {
    console.log('[Realtime] Client joined:', newPresences);
  });

  channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
    console.log('[Realtime] Client left:', leftPresences);
  });

  // ---- Broadcast handling ----
  channel.on('broadcast', { event: 'message' }, (payload: { payload: Message }) => {
    const msg: Message = payload.payload;
    console.log('[Realtime] Received message:', msg.type, msg);
    messages.update((m) => [...m, msg]);
    
    if (msg.type === 'buttonConfigRequest' && role === 'host') {
      console.log('[Realtime] ⚠️ Button config request from', msg.clientId, '- Host should respond!');
    }
    
    if (msg.type === 'buttonConfig') {
      console.log('[Realtime] 🎮 Button config received:', msg);
    }
  });

  // ---- Subscribe and track presence ----
  let isSubscribed = false;
  channel.subscribe(async (status: string) => {
    console.log('[Realtime] Subscription status:', status);
    if (status === 'SUBSCRIBED' && !isSubscribed) {
      isSubscribed = true;
      console.log(`[Realtime] ✅ Connected as ${role} with ID ${id}`);
      await channel.track({
        clientId: id,
        role,
        online_at: new Date().toISOString(),
      });
    }
  });

  // ---- Safe disconnect ----
  let isDisconnecting = false;

  async function disconnect(): Promise<void> {
    if (isDisconnecting) return;
    isDisconnecting = true;

    console.log('[Realtime] Disconnecting client', id);
    try {
      await Promise.allSettled([channel.untrack(), channel.unsubscribe()]);
    } finally {
      activeChannels.delete(id);
      if (activeChannels.size === 0) {
        await disconnectAll();
      }
      isDisconnecting = false;
    }
  }

  // ---- Cleanup on tab close ----
  if (typeof window !== 'undefined') {
    const cleanup = async () => {
      await disconnectAll();
    };

    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
    window.addEventListener('unload', cleanup);
  }


  // ---- Send helpers ----
  function send(gameStateUpdate: Record<string, any>): void {
    console.log('[Realtime] Sending game update:', gameStateUpdate);
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { type: 'gameUpdate', clientId: id, role, gameState: gameStateUpdate },
    });
  }

  function sendInput(button: string, pressed: boolean): void {
    console.log('[Realtime] Sending input:', button, pressed);
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { type: 'playerInput', clientId: id, role, input: { button, pressed } },
    });
  }

  function sendButtonConfig(buttons: ButtonConfig[]): void {
    console.log('[Realtime] 📤 Sending button config:', buttons);
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { type: 'buttonConfig', clientId: id, role, buttons },
    });
  }

  function requestButtonConfig(): void {
    console.log('[Realtime] 📥 Requesting button config from host');
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { type: 'buttonConfigRequest', clientId: id, role },
    });
  }

  return { send, sendInput, sendButtonConfig, requestButtonConfig, clientId: id, disconnect };
}