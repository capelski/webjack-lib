import * as http from 'http';
import { useCases, services, types } from 'webjack-core';
import { WebsocketResponseMessage, WebsocketResponseType } from 'webjack-websocket-contracts';
import WebSocket from 'ws';
import { ClientWebSocketData, Dictionary } from './types';

const wsClients: Dictionary<ClientWebSocketData> = {};

export const exitTable = (clientWebSocket: WebSocket, clientData: ClientWebSocketData) => {
    let response: WebsocketResponseMessage = {
        operationType: WebsocketResponseType.exitTable
    };
    const useCaseResult = useCases.exitTable(clientData.tableId!, clientData.playerId!);
    if (useCaseResult.ok) {
        clientData.tableUnsubscribe!();
        delete clientData.tableId;
        delete clientData.tableUnsubscribe;
    }
    else {
        response.error = useCaseResult.error;
    }
    sendMessage(clientWebSocket, response);
};

export const formatTable = (table: types.ITable): types.ITable => ({
    baseTimestamp: table.baseTimestamp,
    cardSet: undefined as unknown as types.ICardSet,
    dealer: table.dealer,
    id: table.id,
    nextAction: -1,
    nextActionTimestamp: table.nextActionTimestamp,
    players: table.players,
    status: table.status
});

export const getClientData = (request: http.IncomingMessage) => {
    let clientData = wsClients[request.headers.cookie!];
    if (!clientData) {
        clientData = wsClients[request.headers.cookie!] = {
            id: request.headers.cookie!
        };
    }
    return clientData;
};

export const joinTable = (clientWebSocket: WebSocket, clientData: ClientWebSocketData) => {
    let response: WebsocketResponseMessage = {
        operationType: WebsocketResponseType.joinTable
    };
    const useCaseResult = useCases.joinTable(clientData.playerId!);
    if (useCaseResult.ok) {
        clientData.tableId = useCaseResult.result!.id;
        response.table = formatTable(useCaseResult.result);
        clientData.tableUnsubscribe = subscribeToTable(clientData.tableId!, clientWebSocket);
    }
    else {
        response.error = useCaseResult.error;
    }
    
    sendMessage(clientWebSocket, response);
};

export const makeDecision = (clientWebSocket: WebSocket, clientData: ClientWebSocketData, decision: types.PlayerActions) => {
    const useCaseResult =
        useCases.makeDecision(clientData.tableId!, clientData.playerId!, decision);
    if (!useCaseResult.ok) {
        sendMessage(clientWebSocket, {
            operationType: WebsocketResponseType.makeDecision,
            error: useCaseResult.error!
        });
    }
};

export const placeBet = (clientWebSocket: WebSocket, clientData: ClientWebSocketData, bet: number) => {
    const useCaseResult = useCases.placeBet(clientData.tableId!, clientData.playerId!, bet);
    if (!useCaseResult.ok) {
        sendMessage(clientWebSocket, {
            operationType: WebsocketResponseType.placeBet,
            error: useCaseResult.error!
        });
    }
};

export const registerPlayer = (clientWebSocket: WebSocket, clientData: ClientWebSocketData, name: string) => {
    let response: WebsocketResponseMessage = {
        operationType: WebsocketResponseType.registerPlayer
    };
    if (clientData.playerId) {
        response.error = 'You are already registered';
    }
    else {
        const useCaseResult = useCases.registerPlayer(name);
        if (useCaseResult.ok) {
            clientData.playerId = useCaseResult.result!.id;
            response.playerId = clientData.playerId;
        }
        else {
            response.error = useCaseResult.error;
        }
    }
    sendMessage(clientWebSocket, response);
};

export const sendClientData = (clientWebSocket: WebSocket, clientData: ClientWebSocketData) => {
    let table: types.ITable | undefined;
    if (clientData.tableId) {
        clientData.tableUnsubscribe = subscribeToTable(clientData.tableId, clientWebSocket);
        table = formatTable(services.tableService.getTableById(clientData.tableId));
    }
    sendMessage(clientWebSocket, {
        operationType: WebsocketResponseType.clientData,
        playerId: clientData.playerId,
        table
    });
};

export const sendMessage = (clientWebSocket: WebSocket, message: WebsocketResponseMessage) => {
    clientWebSocket.send(JSON.stringify(message));
};

export const setKickOutTimer = (clientWebSocket: WebSocket, clientData: ClientWebSocketData) => {
    if (clientData.kickOutTimer) {
        clearTimeout(clientData.kickOutTimer);
    }
    clientData.kickOutTimer = setTimeout(() => {
        sendMessage(clientWebSocket, {
            operationType: WebsocketResponseType.inactivityKickOut,
            error: 'Kicked out due to inactivity'
        });
        if (clientData.tableId) {
            useCases.exitTable(clientData.tableId!, clientData.playerId!);
        }
        if (clientData.playerId) {
            services.playerService.deletePlayer(clientData.playerId);
        }
        if (clientData.tableUnsubscribe) {
            clientData.tableUnsubscribe();
        }
        delete wsClients[clientData.id];
        clientWebSocket.terminate();
    }, 1000 * 60 * 15);
};

export const subscribeToTable = (tableId: string, clientWebSocket: WebSocket) => {
    return services.tableService.subscribe(tableId, table => {
        sendMessage(clientWebSocket, {
            operationType: WebsocketResponseType.tableUpdate,
            table: formatTable(table)
        });
    });
};