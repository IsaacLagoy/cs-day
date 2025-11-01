// src/routes/host/host.logic.ts
import { connect } from '$lib/realtime';
import { disconnectAll, type WebSocketConnection } from '$lib/realtime';
import type { ButtonConfig } from '$lib/types';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

const NUM_SCENES = 25;

export class HostLogic {
  ws: WebSocketConnection | undefined;
  buttonConfig: Writable<ButtonConfig[]>;
  private lastProcessedRequestCount: number = 0;
  private unsubscribeMessages: (() => void) | undefined;

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

      // Send initial button config once after connection is established
      // Use a timeout to ensure the WebSocket channel is fully subscribed
      setTimeout(() => {
        if (this.ws) {
          // Get current config value without subscribing
          let currentConfig: ButtonConfig[] = [];
          const unsubscribe = this.buttonConfig.subscribe(config => {
            currentConfig = config;
          });
          unsubscribe(); // Immediately unsubscribe
          
          console.log('[HostLogic] Sending initial button config:', currentConfig);
          this.ws.sendButtonConfig(currentConfig);
        }
      }, 500);

      // Listen for button config requests from new controllers
      this.setupConfigRequestListener();
    }
  }

  private setupConfigRequestListener(): void {
    // Import messages store to listen for requests
    import('$lib/realtime').then(({ messages }) => {
      messages.subscribe($messages => {
        // Look for buttonConfigRequest messages
        const requests = $messages.filter(msg => msg.type === 'buttonConfigRequest');
        
        // If we have any requests, send current config
        if (requests.length > 0 && this.ws) {
          // Get current config
          let currentConfig: ButtonConfig[] = [];
          const unsubscribe = this.buttonConfig.subscribe(config => {
            currentConfig = config;
          });
          unsubscribe();
          
          console.log('[HostLogic] Received button config request, sending current config:', currentConfig);
          this.ws.sendButtonConfig(currentConfig);
        }
      });
    });
  }

  toggleButton(buttonName: string): void {
    console.log('[HostLogic] Toggling button:', buttonName);
    this.buttonConfig.update(config => {
      const updated = config.map(btn => 
        btn.name === buttonName 
          ? { ...btn, enabled: !btn.enabled }
          : btn
      );
      
      console.log('[HostLogic] New config after toggle:', updated);
      
      // Broadcast the updated config
      if (this.ws) {
        this.ws.sendButtonConfig(updated);
      } else {
        console.warn('[HostLogic] Cannot send config - WebSocket not connected');
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