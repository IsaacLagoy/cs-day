// src/routes/view/view.logic.ts
import { derived, writable } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';
import { connect, messages, connectedClients } from '$lib/realtime';
import type { WebSocketConnection, GameUpdateMessage, PlayerInputMessage, ConnectedClient } from '$lib/realtime';

export interface PlayerData {
  clientId: string;
  role: string;
  x: number;
  y: number;
  inputs: Record<string, boolean>;
}

export class GameViewController {
  ws: WebSocketConnection | undefined;
  gameState: Writable<Record<string, any>>;
  players: Writable<Record<string, PlayerData>>;
  gameUpdates: Readable<GameUpdateMessage[]>;
  playerInputs: Readable<PlayerInputMessage[]>;

  constructor() {
    this.gameState = writable({});
    this.players = writable({});

    // Derived stores for filtered messages
    this.gameUpdates = derived(messages, ($m) =>
      $m.filter((msg): msg is GameUpdateMessage => msg.type === 'gameUpdate')
    );

    this.playerInputs = derived(messages, ($m) =>
      $m.filter((msg): msg is PlayerInputMessage => msg.type === 'playerInput')
    );

    // Subscribe to updates
    this.setupSubscriptions();
  }

  connect(): void {
    if (!this.ws) {
      this.ws = connect('view');
    }
  }

  private setupSubscriptions(): void {
    // Handle game updates from host
    this.gameUpdates.subscribe(($updates) => {
      if ($updates.length > 0) {
        const lastUpdate = $updates[$updates.length - 1].gameState;
        if (lastUpdate) {
          this.gameState.update(state => ({ ...state, ...lastUpdate }));
        }
      }
    });

    // Handle player inputs
    this.playerInputs.subscribe(($inputs) => {
      if ($inputs.length > 0) {
        const lastInput = $inputs[$inputs.length - 1];
        const playerId = lastInput.clientId;

        this.players.update(currentPlayers => {
          // Initialize player if they don't exist
          if (!currentPlayers[playerId]) {
            currentPlayers[playerId] = {
              clientId: playerId,
              role: lastInput.role || 'controller',
              x: Math.random() * 400,
              y: 300,
              inputs: {}
            };
          }

          // Update player inputs
          currentPlayers[playerId].inputs[lastInput.input.button] = lastInput.input.pressed;
          return { ...currentPlayers };
        });
      }
    });

    // Add new players when they join
    connectedClients.subscribe(($clients) => {
      this.players.update(currentPlayers => {
        $clients.forEach(client => {
          if (client.role === 'controller' && !currentPlayers[client.clientId]) {
            currentPlayers[client.clientId] = {
              clientId: client.clientId,
              role: client.role,
              x: Math.random() * 400,
              y: 300,
              inputs: {}
            };
          }
        });

        // Remove disconnected players
        const connectedIds = new Set($clients.map(c => c.clientId));
        Object.keys(currentPlayers).forEach(playerId => {
          if (!connectedIds.has(playerId)) {
            delete currentPlayers[playerId];
          }
        });

        return { ...currentPlayers };
      });
    });
  }

  destroy(): void {
    // Cleanup if needed
  }
}