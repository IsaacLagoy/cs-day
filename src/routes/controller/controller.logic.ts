// src/routes/controller/controller.logic.ts
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { connect } from '$lib/realtime';
import type { WebSocketConnection } from '$lib/realtime';

export type ButtonName = 'jump' | 'duck' | 'left' | 'right';

export class ControllerLogic {
  ws: WebSocketConnection | undefined;
  buttonStates: Writable<Record<ButtonName, boolean>>;

  constructor() {
    this.buttonStates = writable({
      jump: false,
      duck: false,
      left: false,
      right: false
    });
  }

  connect(savedId?: string): void {
    if (!this.ws) {
      this.ws = connect('controller', savedId);
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