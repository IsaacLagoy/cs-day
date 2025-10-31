import { writable } from 'svelte/store';

export const connection = writable(null);
export const clientId = writable(localStorage.getItem('clientId') || null);
export const messages = writable([]);

export function connect(role) {
  const socket = new WebSocket('https://cs-day-server.onrender.com'); // <— your Render URL
  connection.set(socket);

  socket.onopen = () => {
    console.log('Connected to WebSocket');
    socket.send(JSON.stringify({ type: 'register', role }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'init') {
      localStorage.setItem('clientId', data.clientId);
      clientId.set(data.clientId);
    }
    messages.update((m) => [...m, data]);
  };

  return socket;
}

export function send(socket, type, payload) {
  socket.send(JSON.stringify({ type, payload }));
}
