// src/routes/host/host.logic.ts
import { connect } from '$lib/realtime';
import { disconnectAll, type WebSocketConnection } from '$lib/realtime';
import type { ButtonConfig } from '$lib/types';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

const NUM_SCENES = 19;

export class HostLogic {
  ws: WebSocketConnection | undefined;
  buttonConfig: Writable<ButtonConfig[]>;

  level: number = 0;
  slide: number = 0;
  mode: string = 'none';
  scene: number = 0;

  constructor() {
        // Initialize default button configuration
        this.buttonConfig = writable([
            { name: 'left', enabled: true },
            { name: 'right', enabled: true },
            { name: 'jump', enabled: true },
            { name: 'a', enabled: true },
            { name: 'b', enabled: true }
        ]);
  }

  connect(): void {
    if (!this.ws) {
      this.ws = connect('host');

      // Send initial button config when connected
      this.buttonConfig.subscribe(config => {
        if (this.ws) {
          this.ws.sendButtonConfig(config);
        }
      });
    }
  }

  toggleButton(buttonName: string): void {
    this.buttonConfig.update(config => {
      const updated = config.map(btn => 
        btn.name === buttonName 
          ? { ...btn, enabled: !btn.enabled }
          : btn
      );
      
      // Broadcast the updated config
      if (this.ws) {
        this.ws.sendButtonConfig(updated);
      }
      
      return updated;
    });
  }

  setFlag(name: string, value: any): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.ws.send({ [name]: value });
  }

  resetLevel(): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.level = 0;
    this.setFlag('level', this.level);
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

  resetScene(): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.scene = 0;
    this.setFlag('scene', this.scene);
  }

  incScene(): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.scene = Math.min(this.scene + 1, NUM_SCENES - 1);
    this.setFlag('scene', this.scene);
  }

  decScene(): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.scene = Math.max(this.scene - 1, 0);
    this.setFlag('scene', this.scene);
  }

  resetSlide(): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }
    this.slide = 0;
    this.setFlag('slide', this.slide);
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