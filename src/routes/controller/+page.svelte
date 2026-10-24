<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { clientId } from '$lib/realtime';
  import { ControllerLogic } from './controller.logic';
  import type { ButtonName } from './controller.logic';
  import { chickenPortrait } from '../view/sprites';

  const controller = new ControllerLogic();
  const { buttonStates, buttonConfig, sceneStyle } = controller;

  // Frames in /assets/buttons.png (16x16 each, unpressed then pressed)
  const BUTTON_FRAME: Record<ButtonName, number> = { right: 0, left: 2, jump: 4 };

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

  // Create a reactive map of button enabled states
  // This is more efficient than calling a function in the template
  $: buttonEnabled = {
    left: $buttonConfig.find(b => b.name === 'left')?.enabled ?? false,
    right: $buttonConfig.find(b => b.name === 'right')?.enabled ?? false,
    jump: $buttonConfig.find(b => b.name === 'jump')?.enabled ?? false
  };

  // Log when button config changes for debugging
  $: {
    console.log('[Controller Page] Button config updated:', $buttonConfig);
    console.log('[Controller Page] Button enabled states:', buttonEnabled);
  }

  // reactive color variable
  $: color = $clientId ? '#' + $clientId.slice(0, 6) : '#000000';

  $: chicken = $sceneStyle === 'chicken';

  // Picture of this player's recolored chicken
  let chickenSrc: string | null = null;
  $: if (chicken && $clientId) {
    const forColor = color;
    chickenPortrait(forColor).then(src => {
      if (forColor === color) chickenSrc = src;
    });
  }

  // Class and sprite frame for a button, depending on the style
  function buttonClass(button: ButtonName, pressed: boolean, chicken: boolean): string {
    if (chicken) return 'sprite';
    return pressed ? 'pressed' : '';
  }
  function spriteFrame(button: ButtonName, pressed: boolean): string {
    return `--frame: ${BUTTON_FRAME[button] + (pressed ? 1 : 0)}`;
  }
</script>

<div class="container">
  {#if chicken}
    <h1>Your Chicken</h1>
    {#if chickenSrc}
      <img class="chicken" src={chickenSrc} alt="Your chicken" />
    {:else}
      <p>Loading chicken...</p>
    {/if}
  {:else}
    <h1>Your Color</h1>
    {#if $clientId}
      <div class="color-box" style="background-color: {color};">
      </div>
    {:else}
      <p>Loading color...</p>
    {/if}
  {/if}

  <div class="controller-pad">
    <!-- LEFT SIDE: left & right (D-Pad style, but only left/right exist) -->
    <div class="button-layout dpad-left" aria-hidden="true">
      <div></div><div></div><div></div>

      {#if buttonEnabled.left}
        <button
          class="button arrow-button left {buttonClass('left', $buttonStates.left, chicken)}"
          style={chicken ? spriteFrame('left', $buttonStates.left) : ''}
          on:mousedown={() => handleButtonDown('left')}
          on:mouseup={() => handleButtonUp('left')}
          on:touchstart|preventDefault={() => handleButtonDown('left')}
          on:touchend|preventDefault={() => handleButtonUp('left')}
          aria-label="Left"
        >{chicken ? '' : '◀'}</button>
      {:else}
        <div></div>
      {/if}

      <div></div>

      {#if buttonEnabled.right}
        <button
          class="button arrow-button right {buttonClass('right', $buttonStates.right, chicken)}"
          style={chicken ? spriteFrame('right', $buttonStates.right) : ''}
          on:mousedown={() => handleButtonDown('right')}
          on:mouseup={() => handleButtonUp('right')}
          on:touchstart|preventDefault={() => handleButtonDown('right')}
          on:touchend|preventDefault={() => handleButtonUp('right')}
          aria-label="Right"
        >{chicken ? '' : '▶'}</button>
      {:else}
        <div></div>
      {/if}

      <div></div><div></div><div></div>
    </div>

    <!-- RIGHT SIDE: Jump (up) above A & B -->
    <div class="button-layout actions-right" role="group" aria-label="Action buttons">
      <div></div><div></div><div></div>

      <div></div>

      {#if buttonEnabled.jump}
        <button
          class="button jump {buttonClass('jump', $buttonStates.jump, chicken)}"
          style={chicken ? spriteFrame('jump', $buttonStates.jump) : ''}
          on:mousedown={() => handleButtonDown('jump')}
          on:mouseup={() => handleButtonUp('jump')}
          on:touchstart|preventDefault={() => handleButtonDown('jump')}
          on:touchend|preventDefault={() => handleButtonUp('jump')}
          aria-label="Jump"
        >{chicken ? '' : '▲'}</button>
      {:else}
        <div></div>
      {/if}

      <div></div>
      
      <div></div><div></div><div></div>
    </div>
  </div>
</div>

<style>
  .color-box {
    width: 200px;
    height: 100px;
    border-radius: 12px;
    border: 2px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #fff;
    margin-bottom: 12px;
    text-shadow: 0 0 2px rgba(0,0,0,0.7);
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

  /* Buttons – follow the original svelte color palette / feel */
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

  /* Chicken style: buttons drawn from the /assets/buttons.png sprite sheet */
  .chicken {
    height: 100px;
    image-rendering: pixelated;
    margin-bottom: 12px;
  }

  .button.sprite,
  .button.sprite:active {
    border: none;
    border-radius: 0;
    background-color: transparent;
    background-image: url('/assets/buttons.png');
    background-size: 600% 100%;
    background-position: calc(var(--frame) * 20%) 0;
    image-rendering: pixelated;
    transform: none;
    /* Swap frames instantly instead of animating between them */
    transition: none;
  }

  /* A bit bigger than the regular buttons; multiples of 16 keep the pixels crisp.
     Set without :active so pressing never changes the size. */
  .button.sprite { width: 96px; height: 96px; }

  @media (orientation: portrait) {
    .button.sprite,
    .button.sprite:active { width: 80px; height: 80px; }
  }

  /* Make jump visually a little distinct (keeps same palette) */
  .jump { border-radius: 12px; font-size: 18px; }

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