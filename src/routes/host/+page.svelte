<script>
  import { connect, connection, send } from '$lib/ws';
  import { get } from 'svelte/store';

  let ws;

  onMount(() => {
    ws = connect('host');
  });

  function startGame() {
    send(get(connection), 'hostCommand', { start: true });
  }

  function setFlag(name, value) {
    send(get(connection), 'hostCommand', { [name]: value });
  }
</script>

<h1>Host Controls</h1>
<button on:click={startGame}>Start Game</button>
<button on:click={() => setFlag('hardMode', true)}>Enable Hard Mode</button>
