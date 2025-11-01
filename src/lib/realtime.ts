import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Type definitions
export interface ConnectedClient {
  clientId: string;
  role: string;
}

export interface BaseMessage {
  type: string;
  clientId: string;
  role?: string;
}

export interface ClientJoinedMessage extends BaseMessage {
  type: 'clientJoined';
  role: string;
}

export interface ClientLeftMessage extends BaseMessage {
  type: 'clientLeft';
}

export interface GameUpdateMessage extends BaseMessage {
  type: 'gameUpdate';
  gameState: Record<string, any>;
}

export type Message = ClientJoinedMessage | ClientLeftMessage | GameUpdateMessage;

export interface WebSocketConnection {
  send: (gameStateUpdate: Record<string, any>) => void;
  clientId: string;
}

// Stores
export const messages: Writable<Message[]> = writable([]);
export const clientId: Writable<string | null> = writable(null);
export const connectedClients: Writable<ConnectedClient[]> = writable([]);

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export function connect(role: string, existingId?: string): WebSocketConnection {
  const channel: RealtimeChannel = supabase.channel('game');

  const id: string = existingId || crypto.randomUUID();
  clientId.set(id);

  // Persist if it's new
  if (!existingId && typeof window !== 'undefined') {
    localStorage.setItem('clientId', id);
  }

  // Broadcast join message
  function announceJoin(): void {
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { type: 'clientJoined', clientId: id, role }
    });
  }

  // Broadcast leave on unload
  function announceLeave(): void {
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { type: 'clientLeft', clientId: id }
    });
  }

  // Listen for messages
  channel.on('broadcast', { event: 'message' }, (payload: { payload: Message }) => {
    const msg: Message = payload.payload;

    console.log('Received broadcast:', msg); // debug log

    // Update general message store
    messages.update((m) => [...m, msg]);

    // Handle join
    if (msg.type === 'clientJoined') {
      connectedClients.update((c) => {
        if (!c.find((x) => x.clientId === msg.clientId))
          return [...c, { clientId: msg.clientId, role: msg.role }];
        return c;
      });
    }

    // Handle leave
    if (msg.type === 'clientLeft') {
      connectedClients.update((c) =>
        c.filter((x) => x.clientId !== msg.clientId)
      );
    }
  });

  channel.subscribe((status: string) => {
    console.log('Supabase channel status:', status);
    if (status === 'SUBSCRIBED') {
      console.log(`Connected to Supabase Realtime as ${role}`);
      announceJoin(); // announce join once subscribed
    }
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => announceLeave());
  }

  function send(gameStateUpdate: Record<string, any>): void {
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { type: 'gameUpdate', clientId: id, role, gameState: gameStateUpdate }
    });
  }

  return { send, clientId: id };
}