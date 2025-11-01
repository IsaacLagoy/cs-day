<script>
  import { connect, messages, connectedClients, clientId } from '$lib/realtime';
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';

  let ws;
  let gameState = {};

  onMount(() => {
    ws = connect('view');
  });

  // Listen for game updates
  const gameUpdates = derived(messages, ($m) =>
    $m.filter((msg) => msg.type === 'gameUpdate')
  );

  $: if ($gameUpdates.length > 0) {
    const lastUpdate = $gameUpdates[$gameUpdates.length - 1].gameState;
    if (lastUpdate) gameState = { ...gameState, ...lastUpdate };
  }
</script>

<h1>Game View</h1>
<pre>{JSON.stringify(gameState, null, 2)}</pre>

<h2>Connected Clients</h2>
<ul>
  {#each $connectedClients as client}
    <li>
      {client.clientId} ({client.role}) {client.clientId === $clientId ? '← You' : ''}
    </li>
  {/each}
</ul>
