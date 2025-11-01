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

    const channel: RealtimeChannel = supabase.channel(`game-${id}`, {
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
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Client left:', leftPresences);
    });

    // Listen for game messages
    channel.on('broadcast', { event: 'message' }, (payload: { payload: Message }) => {
        const msg: Message = payload.payload;
        console.log('Received broadcast:', msg);
        messages.update((m) => [...m, msg]);
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
    function disconnect(): void {
        console.log('Disconnecting client', id);
        channel.untrack();
        channel.unsubscribe();
        activeChannels.delete(id);
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