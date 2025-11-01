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

    function setMode(mode: string): void { host.setMode(mode); }

    function incLevel(): void { host.incLevel(); }
    function decLevel(): void { host.decLevel(); }

    function incSlide(): void { host.incSlide(); }
    function decSlide(): void { host.decSlide(); }
</script>

<h1>Host Controls</h1>

<h2>Game Settings</h2>
<hr>
<h3>Mode</h3>

<button on:click={() => setMode('none')}>Set Mode None</button>
<button on:click={() => setMode('fly')}>Set Mode Fly</button>
<button on:click={() => setMode('platformer')}>Set Mode Platformer</button>

<hr>
<h3>Slide</h3>

<button on:click={() => decSlide()}>Slide Backward</button>
<button on:click={() => incSlide()}>Slide Forward</button>

<hr>
<h3>Level</h3>

<button on:click={() => decLevel()}>Level Backward</button>
<button on:click={() => incLevel()}>Level Forward</button>


<h2>Player Settings</h2>