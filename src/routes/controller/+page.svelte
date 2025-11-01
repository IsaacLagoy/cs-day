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

<style>
  .container {
    padding: 20px;
    max-width: 400px;
    margin: 0 auto;
  }

  .button-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
  }

  .button-row {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .control-btn {
    padding: 25px;
    font-size: 20px;
    font-weight: bold;
    border: 3px solid #333;
    border-radius: 10px;
    background: #f0f0f0;
    cursor: pointer;
    user-select: none;
    transition: all 0.1s;
    min-width: 100px;
  }

  .control-btn:active {
    transform: scale(0.95);
    background: #d0d0d0;
  }

  .control-btn.pressed {
    background: #4CAF50;
    color: white;
    border-color: #45a049;
  }

  .control-btn.disabled {
    background: #cccccc;
    color: #888;
    cursor: not-allowed;
    opacity: 0.5;
  }

  .control-btn.disabled:active {
    transform: none;
  }

  .full-width {
    flex: 1;
  }

  .client-info {
    font-size: 12px;
    color: #666;
    margin-bottom: 10px;
  }
</style>

<div class="container">
  <h1>Controller</h1>
  <p class="client-info">Your client ID: {$clientId}</p>

  <div class="button-grid">
    <!-- Jump button -->
    {#if isButtonEnabled('jump')}
      <div class="button-row">
        <button 
          class="control-btn full-width {$buttonStates.jump ? 'pressed' : ''}"
          on:mousedown={() => handleButtonDown('jump')}
          on:mouseup={() => handleButtonUp('jump')}
          on:touchstart|preventDefault={() => handleButtonDown('jump')}
          on:touchend|preventDefault={() => handleButtonUp('jump')}
        >
          Jump
        </button>
      </div>
    {/if}

    <!-- Action buttons (A and B) -->
    <div class="button-row">
      {#if isButtonEnabled('a')}
        <button 
          class="control-btn {$buttonStates.a ? 'pressed' : ''}"
          on:mousedown={() => handleButtonDown('a')}
          on:mouseup={() => handleButtonUp('a')}
          on:touchstart|preventDefault={() => handleButtonDown('a')}
          on:touchend|preventDefault={() => handleButtonUp('a')}
        >
          A
        </button>
      {/if}
      
      {#if isButtonEnabled('b')}
        <button 
          class="control-btn {$buttonStates.b ? 'pressed' : ''}"
          on:mousedown={() => handleButtonDown('b')}
          on:mouseup={() => handleButtonUp('b')}
          on:touchstart|preventDefault={() => handleButtonDown('b')}
          on:touchend|preventDefault={() => handleButtonUp('b')}
        >
          B
        </button>
      {/if}
    </div>

    <!-- Direction buttons -->
    <div class="button-row">
      {#if isButtonEnabled('left')}
        <button 
          class="control-btn {$buttonStates.left ? 'pressed' : ''}"
          on:mousedown={() => handleButtonDown('left')}
          on:mouseup={() => handleButtonUp('left')}
          on:touchstart|preventDefault={() => handleButtonDown('left')}
          on:touchend|preventDefault={() => handleButtonUp('left')}
        >
          ←
        </button>
      {/if}
      
      {#if isButtonEnabled('right')}
        <button 
          class="control-btn {$buttonStates.right ? 'pressed' : ''}"
          on:mousedown={() => handleButtonDown('right')}
          on:mouseup={() => handleButtonUp('right')}
          on:touchstart|preventDefault={() => handleButtonDown('right')}
          on:touchend|preventDefault={() => handleButtonUp('right')}
        >
          →
        </button>
      {/if}
    </div>
  </div>
</div>