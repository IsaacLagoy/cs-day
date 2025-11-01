<script>
  import { connect } from '$lib/realtime';
  import { onMount } from 'svelte';

  let ws;

  onMount(() => {
    ws = connect('host');
  });

  function startGame() {
    ws.send({ started: true });
  }

  function setFlag(name, value) {
    ws.send({ [name]: value });
  }
</script>

<h1>Host Controls</h1>
<button on:click={startGame}>Start Game</button>
<button on:click={() => setFlag('hardMode', true)}>Enable Hard Mode</button>
