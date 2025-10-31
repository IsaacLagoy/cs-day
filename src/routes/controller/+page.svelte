<script>
  import { connect, connection, send } from '$lib/ws';
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';

  let ws;

  onMount(() => {
    ws = connect('controller');
  });

  function sendInput(action) {
    send(get(connection), 'controllerInput', { action });
  }
</script>

<h1>Controller</h1>
<button on:click={() => sendInput('left')}>Left</button>
<button on:click={() => sendInput('right')}>Right</button>
<button on:click={() => sendInput('jump')}>Jump</button>
