<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { HostLogic } from './host.logic';
    import { joinQrDataUrl, joinUrl, pollSession } from '$lib/join';

    const host = new HostLogic();
    const { buttonConfig } = host;
    let stopPoll: (() => void) | undefined;

    onMount(() => {
        host.connect();
        stopPoll = pollSession();
    });

    onDestroy(() => {
        stopPoll?.();
        host.destroy();
    });

    function toggleButton(buttonName: string) { host.toggleButton(buttonName); }
</script>

<div class="page">
    <h1>Host</h1>

    <div class="join">
        {#if $joinQrDataUrl}
            <img class="qr" src={$joinQrDataUrl} alt="Join QR code" width="220" height="220" />
        {:else}
            <p class="hint">Waiting for join URL…</p>
        {/if}
        {#if $joinUrl}
            <p class="join-url">{$joinUrl}</p>
        {/if}
    </div>

    <div class="panels">
        <section class="panel">
            <h2>Scene</h2>
            <div class="scene-row">
                <button class="button" type="button" on:click={() => host.decScene()}>◀</button>
                <button class="button" type="button" on:click={() => host.resetScene()}>Reset</button>
                <button class="button" type="button" on:click={() => host.incScene()}>▶</button>
            </div>
        </section>

        <section class="panel">
            <h2>Controller buttons</h2>
            <p class="hint">Toggle what players can press</p>
            <div class="toggles">
                {#each $buttonConfig as button}
                    <button
                        type="button"
                        class="toggle {button.enabled ? 'pressed' : ''}"
                        on:click={() => toggleButton(button.name)}
                    >
                        <span class="toggle-name">{button.name}</span>
                        <span>{button.enabled ? 'On' : 'Off'}</span>
                    </button>
                {/each}
            </div>
        </section>
    </div>
</div>

<style>
    .page {
        min-height: 100%;
        box-sizing: border-box;
        padding: 24px 18px 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        background: #111;
        color: #eee;
        font-family: system-ui, sans-serif;
        user-select: none;
    }

    h1 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 700;
    }

    h2 {
        margin: 0 0 10px;
        font-size: 1.1rem;
        font-weight: 700;
    }

    .join {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        max-width: 520px;
        width: 100%;
    }

    .qr {
        width: 220px;
        height: 220px;
        border-radius: 14px;
        border: 3px solid #333;
        background: #fff;
    }

    .join-url {
        margin: 0;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.8rem;
        word-break: break-all;
        text-align: center;
        color: #ccc;
    }

    .hint {
        margin: 0 0 12px;
        font-size: 0.8rem;
        color: #999;
    }

    .panels {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 28px;
        width: 100%;
        max-width: 920px;
    }

    .panel {
        flex: 1 1 280px;
        max-width: 400px;
    }

    .scene-row {
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    .button,
    .toggle {
        border-radius: 14px;
        border: 3px solid #333;
        background: #f0f0f0;
        color: #111;
        font-weight: 700;
        cursor: pointer;
        user-select: none;
        transition: transform 0.08s ease, background 0.08s ease;
    }

    .button {
        min-width: 84px;
        height: 64px;
        padding: 0 16px;
        font-size: 18px;
    }

    .button:active,
    .toggle:active {
        transform: scale(0.96);
        background: #d0d0d0;
    }

    .toggles {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        font-size: 16px;
        text-transform: capitalize;
    }

    .toggle-name {
        font-size: 16px;
    }

    .pressed {
        background: #4CAF50 !important;
        color: white !important;
        border-color: #45a049 !important;
    }
</style>
