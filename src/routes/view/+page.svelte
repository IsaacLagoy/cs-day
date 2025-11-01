<script lang="ts">
  import { connect, messages, connectedClients, clientId } from '$lib/realtime';
  import type { WebSocketConnection, GameUpdateMessage, PlayerInputMessage } from '$lib/realtime';
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';

  let ws: WebSocketConnection | undefined;
  let gameState: Record<string, any> = {};
  
  interface PlayerData {
    clientId: string;
    role: string;
    x: number;
    y: number;
    inputs: Record<string, boolean>;
  }
  
  let players: Record<string, PlayerData> = {};

  onMount(() => {
    if (!ws) {
        ws = connect('view');
    }
  });

  // Listen for game updates from host
  const gameUpdates = derived(messages, ($m) =>
    $m.filter((msg): msg is GameUpdateMessage => msg.type === 'gameUpdate')
  );

  // Listen for player inputs
  const playerInputs = derived(messages, ($m) =>
    $m.filter((msg): msg is PlayerInputMessage => msg.type === 'playerInput')
  );

  // Update game state from host
  $: if ($gameUpdates.length > 0) {
    const lastUpdate = $gameUpdates[$gameUpdates.length - 1].gameState;
    if (lastUpdate) gameState = { ...gameState, ...lastUpdate };
  }

  // Handle player inputs and update player data
  $: if ($playerInputs.length > 0) {
    const lastInput = $playerInputs[$playerInputs.length - 1];
    const playerId = lastInput.clientId;
    
    // Initialize player if they don't exist
    if (!players[playerId]) {
      players[playerId] = {
        clientId: playerId,
        role: lastInput.role || 'controller',
        x: Math.random() * 400,
        y: 300,
        inputs: {}
      };
    }
    
    // Update player inputs
    players[playerId].inputs[lastInput.input.button] = lastInput.input.pressed;
    players = { ...players }; // Trigger reactivity
  }

  // Add new players when they join
  $: {
    $connectedClients.forEach(client => {
      if (client.role === 'controller' && !players[client.clientId]) {
        players[client.clientId] = {
          clientId: client.clientId,
          role: client.role,
          x: Math.random() * 400,
          y: 300,
          inputs: {}
        };
      }
    });
    players = { ...players }; // Trigger reactivity
  }

  // Remove players when they leave
  $: {
    const connectedIds = new Set($connectedClients.map(c => c.clientId));
    Object.keys(players).forEach(playerId => {
      if (!connectedIds.has(playerId)) {
        delete players[playerId];
      }
    });
    players = { ...players }; // Trigger reactivity
  }
</script>

<h1>Game View</h1>

<h2>Game State</h2>
<pre>{JSON.stringify(gameState, null, 2)}</pre>

<h2>Players</h2>
{#each Object.values(players) as player}
  <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; border-radius: 5px;">
    <h3>Player: {player.clientId.slice(0, 8)}... {player.clientId === $clientId ? '(You)' : ''}</h3>
    <p>Position: ({player.x.toFixed(0)}, {player.y.toFixed(0)})</p>
    <p>Inputs:</p>
    <ul>
      {#each Object.entries(player.inputs) as [button, pressed]}
        <li>{button}: {pressed ? '✓ Pressed' : '○ Released'}</li>
      {/each}
    </ul>
  </div>
{/each}

<h2>Connected Clients</h2>
<ul>
  {#each $connectedClients as client}
    <li>
      {client.clientId.slice(0, 8)}... ({client.role}) {client.clientId === $clientId ? '← You' : ''}
    </li>
  {/each}
</ul>