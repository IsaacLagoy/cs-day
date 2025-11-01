<script>
  import { connect, clientId } from '$lib/realtime';
  import { onMount } from 'svelte';

  let ws;

  onMount(() => {
    // Reuse existing clientId from localStorage if available
    const savedId = localStorage.getItem('clientId');

    ws = connect('controller', savedId); // pass savedId to connect
  });

  function sendInput(input) {
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
