<script>
  import { connect, messages } from '$lib/realtime';
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';

  let ws;
  let gameState = {};

  onMount(() => {
    ws = connect('view');
  });

  // Listen only for gameUpdate messages
  const gameUpdates = derived(messages, ($m) =>
    $m.filter((msg) => msg.gameState)
  );

  $: if ($gameUpdates.length > 0) {
    const lastUpdate = $gameUpdates[$gameUpdates.length - 1].gameState;
    if (lastUpdate) {
      gameState = { ...gameState, ...lastUpdate }; // merge incremental updates
    }
  }
</script>

<h1>Game View</h1>
<pre>{JSON.stringify(gameState, null, 2)}</pre>
