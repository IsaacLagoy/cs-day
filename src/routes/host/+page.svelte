<script lang="ts">
    import { connect } from '$lib/realtime';
    import type { WebSocketConnection } from '$lib/realtime';
    import { onMount } from 'svelte';

    let ws: WebSocketConnection | undefined;

    onMount(() => {
        if (!ws) {
            ws = connect('host');
        }
    });

    function startGame(): void {
        if (ws) {
            ws.send({ started: true });
        }
    }

    function setFlag(name: string, value: boolean): void {
        if (ws) {
            ws.send({ [name]: value });
        }
    }
</script>

<h1>Host Controls</h1>
<button on:click={startGame}>Start Game</button>
<button on:click={() => setFlag('hardMode', true)}>Enable Hard Mode</button>