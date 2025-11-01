<script>
  import { connect } from '$lib/realtime';
  import { onMount } from 'svelte';

  let ws;

  onMount(() => {
    ws = connect('controller');
  });

  function sendInput(input) {
    ws.send({ input }); // send as gameState object
  }
</script>

<h1>Controller</h1>
<button on:click={() => sendInput({ action: 'jump' })}>Jump</button>
<button on:click={() => sendInput({ action: 'duck' })}>Duck</button>
