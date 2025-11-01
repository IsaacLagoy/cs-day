import { derived, writable, get } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';
import { connect, messages, connectedClients } from '$lib/realtime';
import type { WebSocketConnection } from '$lib/realtime';
import type { GameUpdateMessage, PlayerInputMessage, ConnectedClient, vec2, AABB } from '$lib/types'
import { Player } from './player';

export class GameViewController {
  ws: WebSocketConnection | undefined;
  gameState: Writable<Record<string, any>>;
  players: Writable<Record<string, Player>>;
  gameUpdates: Readable<GameUpdateMessage[]>;
  playerInputs: Readable<PlayerInputMessage[]>;

  constructor() {
    this.gameState = writable({
        level: 0,
        mode: 'none',
        slide: 0
    });
    this.players = writable({});

    // Derived stores for filtered messages
    this.gameUpdates = derived(messages, ($m) =>
        $m.filter((msg): msg is GameUpdateMessage => msg.type === 'gameUpdate')
    );

    this.playerInputs = derived(messages, ($m) =>
        $m.filter((msg): msg is PlayerInputMessage => msg.type === 'playerInput')
    );

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
            currentPlayers[playerId] = new Player(
              playerId,
              lastInput.role || 'controller',
              {x: Math.random() * 5, y: Math.random() * 5},
              `#${playerId.replace(/-/g, '').slice(0, 6)}`
            );
          }

          // Update player inputs
          currentPlayers[playerId].inputs[lastInput.input.button] = lastInput.input.pressed;
          return { ...currentPlayers }; // trigger store update
        });
      }
    });

    // Add new players when they join
    connectedClients.subscribe(($clients) => {
      this.players.update(currentPlayers => {
        $clients.forEach(client => {
          if (client.role === 'controller' && !currentPlayers[client.clientId]) {
            currentPlayers[client.clientId] = new Player(
              client.clientId,
              client.role,
              Math.random() * 400,
              300
            );
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