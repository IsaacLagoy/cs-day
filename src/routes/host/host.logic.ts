// src/routes/host/host.logic.ts
import { connect } from '$lib/realtime';
import type { WebSocketConnection } from '$lib/realtime';

export class HostLogic {
  ws: WebSocketConnection | undefined;

  connect(): void {
    if (!this.ws) {
      this.ws = connect('host');
    }
  }

  startGame(): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.ws.send({ started: true });
  }

  setFlag(name: string, value: boolean): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.ws.send({ [name]: value });
  }

  sendGameState(gameState: Record<string, any>): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.ws.send(gameState);
  }

  destroy(): void {
    if (this.ws) {
      this.ws.disconnect();
      this.ws = undefined;
    }
  }
}