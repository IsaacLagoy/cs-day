// src/lib/realtime.js
import { writable } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const SUPABASE_URL = PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = PUBLIC_SUPABASE_ANON_KEY;

export const messages = writable([]);
export const clientId = writable(null);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function connect(role) {
  const channel = supabase.channel('game');

  // Save a simple client ID
  const id = crypto.randomUUID();
  clientId.set(id);

  // Listen for messages from all clients
  channel.on('broadcast', { event: 'message' }, (payload) => {
    // payload.payload is the object sent by send()
    messages.update((m) => [...m, payload.payload]);
    console.log('Received message:', payload.payload);
  });

  channel.subscribe((status) => {
    console.log(`Supabase channel status: ${status}`);
    if (status === 'SUBSCRIBED') {
      console.log(`Connected to Supabase Realtime as ${role}`);
    }
  });

  // Send a message
  function send(gameStateUpdate) {
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { clientId: id, role, gameState: gameStateUpdate }
    });
  }

  return { send };
}
