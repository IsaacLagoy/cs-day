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
  private unsubscribeMessages: (() => void) | undefined;
  private lastProcessedMessageCount: number = 0;

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
      { name: 'jump', enabled: false },
      { name: 'a', enabled: false },
      { name: 'b', enabled: false }
    ]);
  }

  connect(savedId?: string): void {
    if (!this.ws) {
      this.ws = connect('controller', savedId);
      
      console.log('[ControllerLogic] Connected, requesting button config');
      
      // Request current button configuration when connecting
      this.ws.requestButtonConfig();
      
      // Listen for button configuration updates
      // Only process NEW messages since last check
      this.unsubscribeMessages = messages.subscribe($messages => {
        const currentCount = $messages.length;
        
        // Only process if there are new messages
        if (currentCount > this.lastProcessedMessageCount) {
          console.log('[ControllerLogic] Processing new messages:', currentCount - this.lastProcessedMessageCount);
          
          // Only look at NEW messages since last check
          const newMessages = $messages.slice(this.lastProcessedMessageCount);
          
          // Find buttonConfig messages in the new messages
          const configMessages = newMessages.filter(
            (msg): msg is ButtonConfigMessage => msg.type === 'buttonConfig'
          );
          
          if (configMessages.length > 0) {
            // Use the most recent config message
            const latestConfig = configMessages[configMessages.length - 1];
            console.log('[ControllerLogic] 🎮 Applying NEW button config:', latestConfig.buttons);
            this.buttonConfig.set(latestConfig.buttons);
            
            // Verify the store was updated
            let currentConfig: ButtonConfig[] = [];
            const unsub = this.buttonConfig.subscribe(c => { currentConfig = c; });
            unsub();
            console.log('[ControllerLogic] ✅ Button config now:', currentConfig);
          }
          
          // Update the last processed count
          this.lastProcessedMessageCount = currentCount;
        }
      });
      
      console.log('[ControllerLogic] Subscribed to messages');
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
    console.log('[ControllerLogic] Destroying controller');
    
    // Unsubscribe from messages
    if (this.unsubscribeMessages) {
      this.unsubscribeMessages();
      this.unsubscribeMessages = undefined;
    }
    
    if (this.ws) {
      this.ws.disconnect();
      this.ws = undefined;
    }
    
    // Reset message counter
    this.lastProcessedMessageCount = 0;
  }
}