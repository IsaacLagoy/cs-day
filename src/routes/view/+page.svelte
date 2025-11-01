<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { connectedClients, clientId } from '$lib/realtime';
  import { GameViewController } from './view.logic';
  import { init } from './view.logic';

  const controller = new GameViewController();
  const { gameState, players } = controller;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  onMount(() => {
    controller.connect();
    init(canvas, controller);

  });

  onDestroy(() => {
    controller.destroy();
  });
</script>

<style>
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>

<canvas bind:this={canvas}></canvas>

<h1>Game View</h1>

<h2>Game State</h2>
<pre>{JSON.stringify($gameState, null, 2)}</pre>

<h2>Players</h2>
{#each Object.values($players) as player}
  <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; border-radius: 5px; z-index: 15;">
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