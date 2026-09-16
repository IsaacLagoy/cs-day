<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { GameViewController } from './controller';
  import { init, setJoinQr } from './view.logic';
  import { joinQrDataUrl, pollSession } from '$lib/join';

  const controller = new GameViewController();
  let canvas: HTMLCanvasElement;
  let stopPoll: (() => void) | undefined;
  let unsubQr: (() => void) | undefined;

  onMount(() => {
    controller.connect();
    init(canvas, controller);
    stopPoll = pollSession();
    unsubQr = joinQrDataUrl.subscribe((url) => {
      if (url) setJoinQr(url);
    });
  });

  onDestroy(() => {
    stopPoll?.();
    unsubQr?.();
    controller.destroy();
  });
</script>

<canvas bind:this={canvas}></canvas>

<style>
  :global(html),
  :global(body) {
    overflow: hidden;
    background: #111;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
