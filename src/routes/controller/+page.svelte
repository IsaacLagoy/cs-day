<script lang="ts">
  import { connect, clientId } from '$lib/realtime';
  import type { WebSocketConnection } from '$lib/realtime';
  import { onMount } from 'svelte';

  let ws: WebSocketConnection | undefined;
  let buttonStates: Record<string, boolean> = {
    jump: false,
    duck: false,
    left: false,
    right: false
  };

  onMount(() => {
    // Reuse existing clientId from localStorage if available
    const savedId: string | null = localStorage.getItem('clientId');

    if (!ws) {
         ws = connect('controller', savedId ?? undefined);
    }
  });

  function handleButtonDown(button: string): void {
    if (ws && !buttonStates[button]) {
      buttonStates[button] = true;
      ws.sendInput(button, true);
    }
  }

  function handleButtonUp(button: string): void {
    if (ws && buttonStates[button]) {
      buttonStates[button] = false;
      ws.sendInput(button, false);
    }
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
    Jump {buttonStates.jump ? '(Pressed)' : ''}
  </button>
  
  <button 
    on:mousedown={() => handleButtonDown('duck')}
    on:mouseup={() => handleButtonUp('duck')}
    on:touchstart|preventDefault={() => handleButtonDown('duck')}
    on:touchend|preventDefault={() => handleButtonUp('duck')}
    style="padding: 20px; font-size: 18px;"
  >
    Duck {buttonStates.duck ? '(Pressed)' : ''}
  </button>
  
  <div style="display: flex; gap: 10px;">
    <button 
      on:mousedown={() => handleButtonDown('left')}
      on:mouseup={() => handleButtonUp('left')}
      on:touchstart|preventDefault={() => handleButtonDown('left')}
      on:touchend|preventDefault={() => handleButtonUp('left')}
      style="padding: 20px; font-size: 18px; flex: 1;"
    >
      Left {buttonStates.left ? '(Pressed)' : ''}
    </button>
    
    <button 
      on:mousedown={() => handleButtonDown('right')}
      on:mouseup={() => handleButtonUp('right')}
      on:touchstart|preventDefault={() => handleButtonDown('right')}
      on:touchend|preventDefault={() => handleButtonUp('right')}
      style="padding: 20px; font-size: 18px; flex: 1;"
    >
      Right {buttonStates.right ? '(Pressed)' : ''}
    </button>
  </div>
</div>