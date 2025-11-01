<script lang="ts">
  import { connect, clientId } from '$lib/realtime';
  import type { WebSocketConnection } from '$lib/realtime';
  import { onMount } from 'svelte';

  let ws: WebSocketConnection | undefined;

  onMount(() => {
    // Reuse existing clientId from localStorage if available
    const savedId: string | null = localStorage.getItem('clientId');

    if (!ws) {
         ws = connect('controller', savedId ?? undefined); // pass savedId to connect
    }
  });

  interface GameInput {
    action: string;
  }

  function sendInput(input: GameInput): void {
    if (ws) {
      ws.send({ input }); // send as gameState object
    } else {
      console.warn('WebSocket not connected yet');
    }
  }
</script>

<h1>Controller</h1>
<p>Your client ID: {$clientId}</p>

<button on:click={() => sendInput({ action: 'jump' })}>Jump</button>
<button on:click={() => sendInput({ action: 'duck' })}>Duck</button>