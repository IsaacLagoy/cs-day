<script>
  import { connect, messages } from '$lib/ws';
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';

  let gameState = {};

  onMount(() => {
    connect('view');
  });

  // Listen for updates
  const gameUpdates = derived(messages, ($m) =>
    $m.filter((msg) => msg.type === 'gameUpdate')
  );

  $: if ($gameUpdates.length > 0) {
    gameState = $gameUpdates[$gameUpdates.length - 1].gameState;
  }
</script>

<h1>Game View</h1>
<pre>{JSON.stringify(gameState, null, 2)}</pre>
