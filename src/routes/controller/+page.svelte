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
    max-width: 700px;
    margin: 0 auto;
    text-align: center;
  }

  .client-info {
    font-size: 12px;
    color: #666;
    margin-bottom: 10px;
  }

  /* Controller overall layout */
  .controller-layout {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 60px;
    margin-top: 30px;
  }

  /* D-pad on left */
  .dpad {
    display: flex;
    flex-direction: column;
    gap: 25px;
    align-items: center;
  }

  /* Action cluster on right */
  .action-cluster {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .jump-btn {
    margin-bottom: 15px;
  }

  /* A and B side by side (base of the triangle) */
  .ab-row {
    display: flex;
    gap: 25px;
  }

  /* Base button styling */
  .control-btn {
    width: 80px;
    height: 80px;
    font-size: 20px;
    font-weight: bold;
    border: 3px solid #333;
    border-radius: 50%;
    background: #f0f0f0;
    cursor: pointer;
    user-select: none;
    transition: all 0.1s ease;
    box-shadow: 0 3px 0 #999;
  }

  .control-btn:active {
    transform: scale(0.95) translateY(2px);
    background: #d0d0d0;
    box-shadow: 0 1px 0 #777;
  }

  .control-btn.pressed {
    background: #4CAF50;
    color: white;
    border-color: #45a049;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  /* MOBILE VIEW (same layout, but fills width) */
  @media (max-width: 768px) {
    .controller-layout {
      gap: 40px;
      padding: 0 20px;
    }

    .control-btn {
      width: 70px;
      height: 70px;
      font-size: 18px;
    }

    .dpad {
      gap: 20px;
    }

    .ab-row {
      gap: 20px;
    }

    .jump-btn {
      margin-bottom: 10px;
    }
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