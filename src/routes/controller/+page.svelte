<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { clientId } from '$lib/realtime';
  import { ControllerLogic } from './controller.logic';
  import type { ButtonName } from './controller.logic';

  const controller = new ControllerLogic();
  const { buttonStates, buttonConfig } = controller;

  onMount(() => {
    const savedId = localStorage.getItem('clientId');
    controller.connect(savedId ?? undefined);
  });

  onDestroy(() => {
    controller.destroy();
  });

  function handleButtonDown(button: ButtonName) {
    controller.handleButtonDown(button);
  }

  function handleButtonUp(button: ButtonName) {
    controller.handleButtonUp(button);
  }

  function isButtonEnabled(buttonName: string): boolean {
    const button = $buttonConfig.find(b => b.name === buttonName);
    return button ? button.enabled : false;
  }
</script>

<div class="container">
  <h1>Controller</h1>
  <p class="client-info">Your client ID: {$clientId}</p>

  <div class="controller-pad">
    <!-- LEFT SIDE: left & right (D-Pad style, but only left/right exist) -->
    <div class="button-layout dpad-left" aria-hidden="true">
      <!-- top-left empty -->
      <div></div>
      <div></div>
      <div></div>

      <!-- middle row: left at col1, center empty, right at col3 -->
      {#if isButtonEnabled('left')}
        <button
          class="button arrow-button left {$buttonStates.left ? 'pressed' : ''}"
          on:mousedown={() => handleButtonDown('left')}
          on:mouseup={() => handleButtonUp('left')}
          on:touchstart|preventDefault={() => handleButtonDown('left')}
          on:touchend|preventDefault={() => handleButtonUp('left')}
          aria-label="Left"
        >◀</button>
      {:else}
        <div></div>
      {/if}

      <div></div>

      {#if isButtonEnabled('right')}
        <button
          class="button arrow-button right {$buttonStates.right ? 'pressed' : ''}"
          on:mousedown={() => handleButtonDown('right')}
          on:mouseup={() => handleButtonUp('right')}
          on:touchstart|preventDefault={() => handleButtonDown('right')}
          on:touchend|preventDefault={() => handleButtonUp('right')}
          aria-label="Right"
        >▶</button>
      {:else}
        <div></div>
      {/if}

      <!-- bottom row empty -->
      <div></div>
      <div></div>
      <div></div>
    </div>

    <!-- RIGHT SIDE: Jump (up) above A & B (jump is the 'up' on the right controller) -->
    <div class="button-layout actions-right" role="group" aria-label="Action buttons">
      <!-- row 1: jump centered -->
      <div></div>
      {#if isButtonEnabled('jump')}
        <button
          class="button jump {$buttonStates.jump ? 'pressed' : ''}"
          on:mousedown={() => handleButtonDown('jump')}
          on:mouseup={() => handleButtonUp('jump')}
          on:touchstart|preventDefault={() => handleButtonDown('jump')}
          on:touchend|preventDefault={() => handleButtonUp('jump')}
          aria-label="Jump"
        >▲</button>
      {:else}
        <div></div>
      {/if}
      <div></div>

      <!-- row 2: place B (left) and A (right) -->
      {#if isButtonEnabled('b')}
        <button
          id="btn-b"
          class="button {$buttonStates.b ? 'pressed' : ''}"
          on:mousedown={() => handleButtonDown('b')}
          on:mouseup={() => handleButtonUp('b')}
          on:touchstart|preventDefault={() => handleButtonDown('b')}
          on:touchend|preventDefault={() => handleButtonUp('b')}
          aria-label="B"
        >B</button>
      {:else}
        <div></div>
      {/if}

      <div></div>

      {#if isButtonEnabled('a')}
        <button
          id="btn-a"
          class="button {$buttonStates.a ? 'pressed' : ''}"
          on:mousedown={() => handleButtonDown('a')}
          on:mouseup={() => handleButtonUp('a')}
          on:touchstart|preventDefault={() => handleButtonDown('a')}
          on:touchend|preventDefault={() => handleButtonUp('a')}
          aria-label="A"
        >A</button>
      {:else}
        <div></div>
      {/if}

      <!-- row 3: empty -->
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</div>

<style>
  /* base page reset */
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    user-select: none;
  }

  .container {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  h1 {
    margin: 0;
    font-size: 1.1rem;
  }

  .client-info {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 6px;
  }

  /* Controller row */
  .controller-pad {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    width: 92%;
    max-width: 1000px;
    gap: 28px;
    margin-top: 6px;
  }

  /* Generic 3x3 layout used for both sides */
  .button-layout {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 10px;
    justify-items: center;
    align-items: center;
    width: 220px;
    height: 220px;
    box-sizing: border-box;
  }

  /* Slightly smaller on small screens */
  @media (max-width: 520px) {
    .button-layout {
      width: 160px;
      height: 160px;
    }
    .controller-pad {
      gap: 14px;
      width: 98%;
    }
  }

  /* Buttons — follow the original svelte color palette / feel */
  .button {
    width: 84px;
    height: 84px;
    min-width: 64px;
    min-height: 64px;
    border-radius: 14px;
    border: 3px solid #333;
    background: #f0f0f0; /* original base */
    color: #111;
    font-weight: 700;
    font-size: 20px;
    cursor: pointer;
    user-select: none;
    transition: transform 0.08s ease, background 0.08s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    touch-action: manipulation;
  }

  .button:active { transform: scale(0.96); background: #d0d0d0; }

  /* pressed state matches your previous .pressed (green) look */
  .pressed {
    background: #4CAF50 !important;
    color: white !important;
    border-color: #45a049 !important;
  }

  /* Make jump visually a little distinct (keeps same palette) */
  .jump { border-radius: 12px; font-size: 18px; }

  /* Action-specific IDs kept for potential future color tweaks */
  #btn-a { /* keep neutral — acts like original control button */ }
  #btn-b { }

  /* Arrow-specific style (left/right) */
  .arrow-button { border-radius: 12px; font-size: 26px; }

  /* Responsive sizes for portrait vs landscape */
  @media (orientation: portrait) {
    .button { width: 64px; height: 64px; font-size: 16px; }
    .button-layout { width: 140px; height: 140px; }
  }

  @media (orientation: landscape) {
    .button { width: 72px; height: 72px; }
    .button-layout { width: 200px; height: 200px; }
  }
</style>
