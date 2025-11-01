// src/routes/view/view.logic.ts
import { derived, writable, get } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';
import { connect, messages, connectedClients } from '$lib/realtime';
import type { WebSocketConnection } from '$lib/realtime';
import type { GameUpdateMessage, PlayerInputMessage, ConnectedClient, vec2, AABB } from '$lib/types'

// Game Rendering
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let controllerInstance: GameViewController;
let lastTime = 0;
let unit = 100;

export class Player {
    clientId: string;
    role: string;
    pos: vec2;
    vel: vec2;
    scale: vec2;
    inputs: Record<string, boolean>;

    // physics
    collider: AABB;

    constructor(clientId: string, role: string, x = 0, y = 0) {
        this.clientId = clientId;
        this.role = role;
        this.pos = { x: x, y: y };
        this.vel = { x: 0, y: 0 };
        this.scale = { x: 1, y: 1 };
        this.collider = { topRight: this.pos, bottomLeft: this.pos }; // temporary value
        this.inputs = {};
    }

    draw() {
        if (!ctx) return;
        ctx.fillStyle = '#fc4444ff';
        ctx.fillRect(this.pos.x, this.pos.y, unit, unit);
    }

    calcCollider() {
        this.collider.topRight.x = this.pos.x * this.scale.x;
        this.collider.topRight.y = this.pos.y * this.scale.y;
        this.collider.bottomLeft.x = -this.pos.x * this.scale.x;
        this.collider.bottomLeft.y = -this.pos.y * this.scale.y;
    }
}

export class GameViewController {
  ws: WebSocketConnection | undefined;
  gameState: Writable<Record<string, any>>;
  players: Writable<Record<string, Player>>;
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
              Math.random() * 400,
              300
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

// Initialize the canvas and start the game loop
export function init(c: HTMLCanvasElement, controller: GameViewController) {
  if (typeof window === 'undefined') return;

  canvas = c;
  ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  controllerInstance = controller;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  requestAnimationFrame(loop);
}

// Update player positions based on inputs
function update() {
  const currentPlayers = get(controllerInstance.players);

  Object.values(currentPlayers).forEach(player => {
    if (player.inputs["right"]) player.pos.x += 1;
    if (player.inputs["left"]) player.pos.y -= 1;
  });
}

// Draw all players
function draw() {
  const currentPlayers = get(controllerInstance.players);

  Object.values(currentPlayers).forEach(player => {
    player.draw();
  });
}

// Main loop
function loop(time: number) {
  const delta = time - lastTime;
  lastTime = time;

  update();

  // Clear the screen
  ctx.fillStyle = '#c6c6c6ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  draw();

  requestAnimationFrame(loop);
}
