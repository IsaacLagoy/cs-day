// src/lib/realtime.ts
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { 
    ConnectedClient, 
    ButtonConfig, 
    Message 
} from '$lib/types';

export interface WebSocketConnection {
    send: (gameStateUpdate: Record<string, any>) => void;
    sendInput: (button: string, pressed: boolean) => void;
    sendButtonConfig: (buttons: ButtonConfig[]) => void;
    requestButtonConfig: () => void;
    clientId: string;
    disconnect: () => void;
}

// Stores
export const messages: Writable<Message[]> = writable([]);
export const clientId: Writable<string | null> = writable(null);
export const connectedClients: Writable<ConnectedClient[]> = writable([]);

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// Track active channels to prevent duplicates
const activeChannels = new Map<string, RealtimeChannel>();

export function connect(role: string, existingId?: string): WebSocketConnection {
    const id: string = existingId || crypto.randomUUID();
    
    // If this client already has an active connection, disconnect it first
    if (activeChannels.has(id)) {
        console.log('Cleaning up existing connection for', id);
        const oldChannel = activeChannels.get(id);
        oldChannel?.unsubscribe();
        activeChannels.delete(id);
    }

    clientId.set(id);

    // Persist if it's new
    if (!existingId && typeof window !== 'undefined') {
        localStorage.setItem('clientId', id);
    }

    const channel: RealtimeChannel = supabase.channel('game', {
        config: {
            presence: {
                key: id,
            },
        },
    });

    activeChannels.set(id, channel);

    // Use Supabase Presence instead of manual broadcasts
    channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const clients: ConnectedClient[] = [];
        
        for (const [presenceId, presences] of Object.entries(state)) {
            const presence = presences[0] as any;
            if (presence) {
                clients.push({
                    clientId: presence.clientId,
                    role: presence.role
                });
            }
        }
        
        connectedClients.set(clients);
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Client joined:', newPresences);
        
        // If a controller joins and we're the host, send them the button config
        const joinedClient = newPresences[0] as any;
        if (role === 'host' && joinedClient?.role === 'controller') {
            // The host will need to send the current button config
            // This will be handled by the host's subscription to buttonConfig
        }
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Client left:', leftPresences);
    });

    // Listen for game messages
    channel.on('broadcast', { event: 'message' }, (payload: { payload: Message }) => {
        const msg: Message = payload.payload;
        console.log('Received broadcast:', msg);
        messages.update((m) => [...m, msg]);
        
        // If we're a host and receive a button config request, respond with current config
        if (msg.type === 'buttonConfigRequest' && role === 'host') {
            // The host should respond - this will be handled by host logic
            console.log('Received button config request from', msg.clientId);
        }
    });

    let isSubscribed = false;

    channel.subscribe(async (status: string) => {
        console.log('Supabase channel status:', status);
        if (status === 'SUBSCRIBED' && !isSubscribed) {
            isSubscribed = true;
            console.log(`Connected to Supabase Realtime as ${role}`);
            
            // Track presence
            await channel.track({
                clientId: id,
                role: role,
                online_at: new Date().toISOString(),
            });
        }
    });

    // Cleanup function
    async function disconnect(): Promise<void> {
      console.log('Disconnecting client', id);
      try {
        await Promise.allSettled([
          channel.untrack(),
          channel.unsubscribe()
        ]);
      } finally {
        activeChannels.delete(id);
        if (activeChannels.size === 0) {
          await supabase.removeAllChannels();
        }
      }
    }

    if (typeof window !== 'undefined') {
      const handleVisibility = async () => {
        if (document.visibilityState === 'hidden') await disconnect();
      };
      document.addEventListener('visibilitychange', handleVisibility);
    }


    // Handle page unload
    if (typeof window !== 'undefined') {
        const handleUnload = () => {
            // Use sendBeacon for more reliable cleanup
            disconnect();
        };
        
        window.addEventListener('beforeunload', handleUnload);
        window.addEventListener('pagehide', handleUnload);
        
        // Store cleanup for later removal
        (channel as any)._cleanupHandler = () => {
            window.removeEventListener('beforeunload', handleUnload);
            window.removeEventListener('pagehide', handleUnload);
        };
    }

    function send(gameStateUpdate: Record<string, any>): void {
        channel.send({
            type: 'broadcast',
            event: 'message',
            payload: { type: 'gameUpdate', clientId: id, role, gameState: gameStateUpdate }
        });
    }

    function sendInput(button: string, pressed: boolean): void {
        channel.send({
            type: 'broadcast',
            event: 'message',
            payload: { 
                type: 'playerInput', 
                clientId: id, 
                role,
                input: { button, pressed }
            }
        });
    }

    function sendButtonConfig(buttons: ButtonConfig[]): void {
        channel.send({
            type: 'broadcast',
            event: 'message',
            payload: {
                type: 'buttonConfig',
                clientId: id,
                role,
                buttons
            }
        });
    }

    function requestButtonConfig(): void {
        channel.send({
            type: 'broadcast',
            event: 'message',
            payload: {
                type: 'buttonConfigRequest',
                clientId: id,
                role
            }
        });
    }

    return { send, sendInput, sendButtonConfig, requestButtonConfig, clientId: id, disconnect };
}