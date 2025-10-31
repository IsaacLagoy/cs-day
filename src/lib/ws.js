import { writable } from 'svelte/store';

// create empty stores
export const connection = writable(null);
export const clientId = writable(null);
export const messages = writable([]);

// hydrate clientId safely in browser
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('clientId');
  if (saved) clientId.set(saved);
}

export function connect(role) {
  // ✅ use secure WebSocket protocol
  const socket = new WebSocket('wss://cs-day-server.onrender.com');
  connection.set(socket);

  socket.onopen = () => {
    console.log('Connected to WebSocket');
    socket.send(JSON.stringify({ type: 'register', role }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'init') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('clientId', data.clientId);
      }
      clientId.set(data.clientId);
    }
    messages.update((m) => [...m, data]);
  };

  return socket;
}

export function send(socket, type, payload) {
  socket.send(JSON.stringify({ type, payload }));
}
