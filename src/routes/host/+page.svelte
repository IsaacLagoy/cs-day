<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { HostLogic } from './host.logic';

    const host = new HostLogic();
    const { buttonConfig } = host;

    onMount(() => {
        host.connect();
    });

    onDestroy(() => {
        host.destroy();
    });

    function setMode(mode: string): void { host.setMode(mode); }

    function resetLevel(): void { host.resetLevel(); }
    function incLevel(): void { host.incLevel(); }
    function decLevel(): void { host.decLevel(); }

    function resetSlide(): void { host.resetSlide(); }
    function incSlide(): void { host.incSlide(); }
    function decSlide(): void { host.decSlide(); }

    function resetScene(): void { host.resetScene(); }
    function incScene(): void { host.incScene(); }
    function decScene(): void { host.decScene(); }

    function toggleButton(buttonName: string) { host.toggleButton(buttonName); }
</script>

<h1>Host Controls</h1>

<div style="display: flex; justify-content: space-around;">
<div>
    <h3>Scene</h3>
    <button on:click={() => resetScene()}>Reset</button>
    <button on:click={() => decScene()}>Scene Backward</button>
    <button on:click={() => incScene()}>Scene Forward</button>
</div>

<div class="container">
    <div class="section">
        <h2>Button Configuration</h2>
        <p>Toggle buttons on/off for all controllers:</p>
        <div class="button-controls">
            {#each $buttonConfig as button}
                <div class="button-toggle">
                    <span style="font-size: 16px; text-transform: capitalize;">
                        {button.name}
                    </span>
                    <button 
                        class="toggle-btn {button.enabled ? 'enabled' : 'disabled'}"
                        on:click={() => toggleButton(button.name)}
                    >
                        {button.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                </div>
            {/each}
        </div>
    </div>
</div>
</div>


<style>
    .container {
        padding: 20px;
        max-width: 600px;
    }

    .section {
        margin-bottom: 30px;
        padding: 15px;
        border: 1px solid #ccc;
        border-radius: 8px;
    }

    .button-controls {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .button-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 5px;
    }

    .toggle-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s;
    }

    .toggle-btn.enabled {
        background-color: #4CAF50;
        color: white;
    }

    .toggle-btn.disabled {
        background-color: #f44336;
        color: white;
    }

    .game-controls button {
        margin-right: 10px;
        padding: 10px 20px;
        font-size: 16px;
    }
</style>

