// src/routes/controller/controller.logic.ts
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { connect, messages } from '$lib/realtime';
import type { WebSocketConnection } from '$lib/realtime';
import type { ButtonConfig, ButtonConfigMessage } from '$lib/types';

export type ButtonName = 'jump' | 'left' | 'right' | 'a' | 'b';

export class ControllerLogic {
  ws: WebSocketConnection | undefined;
  buttonStates: Writable<Record<ButtonName, boolean>>;
  buttonConfig: Writable<ButtonConfig[]>;

  constructor() {
    this.buttonStates = writable({
      jump: false,
      left: false,
      right: false,
      a: false,
      b: false
    });

    // Initialize with all buttons enabled by default
    this.buttonConfig = writable([
      { name: 'left', enabled: true },
      { name: 'right', enabled: true },
      { name: 'jump', enabled: true },
      { name: 'a', enabled: true },
      { name: 'b', enabled: true }
    ]);
  }

  connect(savedId?: string): void {
    if (!this.ws) {
      this.ws = connect('controller', savedId);
      
      // Request current button configuration when connecting
      this.ws.requestButtonConfig();
      
      // Listen for button configuration updates
      messages.subscribe($messages => {
        const configMessages = $messages.filter(
          (msg): msg is ButtonConfigMessage => msg.type === 'buttonConfig'
        );
        
        if (configMessages.length > 0) {
          const latestConfig = configMessages[configMessages.length - 1];
          this.buttonConfig.set(latestConfig.buttons);
        }
      });
    }
  }

  handleButtonDown(button: ButtonName): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }

    this.buttonStates.update(states => {
      if (!states[button]) {
        states[button] = true;
        this.ws!.sendInput(button, true);
      }
      return { ...states };
    });
  }

  handleButtonUp(button: ButtonName): void {
    if (!this.ws) {
      console.warn('WebSocket not connected');
      return;
    }

    this.buttonStates.update(states => {
      if (states[button]) {
        states[button] = false;
        this.ws!.sendInput(button, false);
      }
      return { ...states };
    });
  }

  isButtonPressed(button: ButtonName): boolean {
    let pressed = false;
    this.buttonStates.subscribe(states => {
      pressed = states[button];
    })();
    return pressed;
  }

  destroy(): void {
    if (this.ws) {
      this.ws.disconnect();
      this.ws = undefined;
    }
  }
}