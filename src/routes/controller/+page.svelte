<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { clientId } from '$lib/realtime';
  import { ControllerLogic } from './controller.logic';
  import type { ButtonName } from './controller.logic';

  const controller = new ControllerLogic();
  const { buttonStates } = controller;

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
</script>

<h1>Controller</h1>
<p>Your client ID: {$clientId}</p>

<div style="display: flex; flex-direction: column; gap: 10px; max-width: 300px;">
  <button 
    on:mousedown={() => handleButtonDown('jump')}
    on:mouseup={() => handleButtonUp('jump')}
    on:touchstart|preventDefault={() => handleButtonDown('jump')}
    on:touchend|preventDefault={() => handleButtonUp('jump')}
    style="padding: 20px; font-size: 18px;"
  >
    Jump {$buttonStates.jump ? '(Pressed)' : ''}
  </button>
  
  <button 
    on:mousedown={() => handleButtonDown('duck')}
    on:mouseup={() => handleButtonUp('duck')}
    on:touchstart|preventDefault={() => handleButtonDown('duck')}
    on:touchend|preventDefault={() => handleButtonUp('duck')}
    style="padding: 20px; font-size: 18px;"
  >
    Duck {$buttonStates.duck ? '(Pressed)' : ''}
  </button>
  
  <div style="display: flex; gap: 10px;">
    <button 
      on:mousedown={() => handleButtonDown('left')}
      on:mouseup={() => handleButtonUp('left')}
      on:touchstart|preventDefault={() => handleButtonDown('left')}
      on:touchend|preventDefault={() => handleButtonUp('left')}
      style="padding: 20px; font-size: 18px; flex: 1;"
    >
      Left {$buttonStates.left ? '(Pressed)' : ''}
    </button>
    
    <button 
      on:mousedown={() => handleButtonDown('right')}
      on:mouseup={() => handleButtonUp('right')}
      on:touchstart|preventDefault={() => handleButtonDown('right')}
      on:touchend|preventDefault={() => handleButtonUp('right')}
      style="padding: 20px; font-size: 18px; flex: 1;"
    >
      Right {$buttonStates.right ? '(Pressed)' : ''}
    </button>
  </div>
</div>