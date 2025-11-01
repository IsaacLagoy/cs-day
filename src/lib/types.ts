/* Networking */
export interface ConnectedClient {
    clientId: string;
    role: string;
}

export interface BaseMessage {
    type: string;
    clientId: string;
    role?: string;
}

export interface ClientJoinedMessage extends BaseMessage {
    type: 'clientJoined';
    role: string;
}

export interface ClientLeftMessage extends BaseMessage {
    type: 'clientLeft';
}

export interface PlayerInputMessage extends BaseMessage {
    type: 'playerInput';
    role: string;
    input: {
        button: string;
        pressed: boolean;
    };
}

export interface GameUpdateMessage extends BaseMessage {
    type: 'gameUpdate';
    gameState: Record<string, any>;
}

export interface ButtonConfig {
    id: string;
    label: string;
    enabled: boolean;
    color?: string;
}

export interface ButtonConfigMessage extends BaseMessage {
    type: 'buttonConfig';
    role: string;
    buttons: ButtonConfig[];
}

export interface ButtonConfigRequestMessage extends BaseMessage {
    type: 'buttonConfigRequest';
    role: string;
}

export type Message = ClientJoinedMessage | ClientLeftMessage | GameUpdateMessage | PlayerInputMessage | ButtonConfigMessage | ButtonConfigRequestMessage;

/* Physics */
export interface vec2 {
    x: number;
    y: number;
}

export interface AABB {
    topRight: vec2;
    bottomLeft: vec2;
}