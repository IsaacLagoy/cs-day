// src/lib/realtime.js
import { writable } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const messages = writable([]);
export const clientId = writable(null);
export const connectedClients = writable([]); // all connected clients

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export function connect(role, existingId = null) {
  const channel = supabase.channel('game');

  const id = existingId || crypto.randomUUID();
  clientId.set(id);

  // Persist if it’s new
  if (!existingId && typeof window !== 'undefined') {
    localStorage.setItem('clientId', id);
  }

  // Broadcast join message
  function announceJoin() {
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { type: 'clientJoined', clientId: id, role }
    });
  }

  // Broadcast leave on unload
  function announceLeave() {
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { type: 'clientLeft', clientId: id }
    });
  }

  // Listen for messages
  channel.on('broadcast', { event: 'message' }, (payload) => {
    const msg = payload.payload;

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

  channel.subscribe((status) => {
    console.log('Supabase channel status:', status);
    if (status === 'SUBSCRIBED') {
      console.log(`Connected to Supabase Realtime as ${role}`);
      announceJoin(); // announce join once subscribed
    }
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => announceLeave());
  }

  function send(gameStateUpdate) {
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { type: 'gameUpdate', clientId: id, role, gameState: gameStateUpdate }
    });
  }

  return { send, clientId: id };
}
