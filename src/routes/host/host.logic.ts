// src/routes/host/host.logic.ts
import { connect } from '$lib/realtime';
import type { WebSocketConnection } from '$lib/realtime';

export class HostLogic {
  ws: WebSocketConnection | undefined;

  level: number = 0;
  slide: number = 0;
  mode: string = 'none';

  connect(): void {
    if (!this.ws) {
      this.ws = connect('host');
    }
  }

  setFlag(name: string, value: any): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.ws.send({ [name]: value });
  }

  incLevel(): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.level++;
    this.setFlag('level', this.level);
  }

  decLevel(): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.level--;
    this.setFlag('level', this.level);
  }

  incSlide(): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.slide++;
    this.setFlag('slide', this.slide);
  }

  decSlide(): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.slide--;
    this.setFlag('slide', this.slide);
  }

  setMode(mode: string): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.mode = mode;
    this.setFlag('mode', this.mode);
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