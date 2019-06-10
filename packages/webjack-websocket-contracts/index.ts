import { types } from 'webjack-core';

export type WebsocketRequestMessage = {
    operationType: WebsocketRequestType.makeDecision;
    decision: types.PlayerActions;
} | {
    operationType: WebsocketRequestType.placeBet;
    bet: number;
} | {
    operationType: WebsocketRequestType.registerPlayer;
    name: string;
} | {
    operationType: WebsocketRequestType.clientData | 
        WebsocketRequestType.exitTable |
        WebsocketRequestType.joinTable;
}

export enum WebsocketRequestType {
    clientData = 'client-data',
    exitTable = 'exit-table',
    joinTable = 'join-table',
    makeDecision = 'make-decision',
    placeBet = 'place-bet',
    registerPlayer = 'register-player'
}

export type WebsocketResponseMessage = {
    operationType: WebsocketResponseType.clientData;
    playerId?: string;
    table?: types.ITable;
} | {
    operationType: WebsocketResponseType.exitTable;
    error?: string;
} | {
    operationType: WebsocketResponseType.inactivityKickOut | WebsocketResponseType.makeDecision | WebsocketResponseType.placeBet;
    error: string;
} | {
    operationType: WebsocketResponseType.joinTable;
    error?: string;
    table?: types.ITable;
} | {
    operationType: WebsocketResponseType.registerPlayer;
    error?: string;
    playerId?: string;
} | {
    operationType: WebsocketResponseType.tableUpdate;
    table: types.ITable;
}

export enum WebsocketResponseType {
    clientData = 'client-data',
    exitTable = 'exit-table',
    inactivityKickOut = 'inactivity-kick-out',
    joinTable = 'join-table',
    makeDecision = 'make-decision',
    placeBet = 'place-bet',
    registerPlayer = 'register-player',
    tableUpdate = 'table-update'
}
    