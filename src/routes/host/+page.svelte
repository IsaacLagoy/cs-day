<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { HostLogic } from './host.logic';

  const host = new HostLogic();

  onMount(() => {
    host.connect();
  });

  onDestroy(() => {
    host.destroy();
  });

  function startGame() {
    host.startGame();
  }

  function setFlag(name: string, value: boolean) {
    host.setFlag(name, value);
  }
</script>

<h1>Host Controls</h1>
<button on:click={startGame}>Start Game</button>
<button on:click={() => setFlag('hardMode', true)}>Enable Hard Mode</button>