import express from 'express';
import http from 'http';
import { WebsocketRequestMessage, WebsocketRequestType } from 'webjack-websocket-contracts';
import WebSocket from 'ws';
import * as operations from './socket-operations';

export const getWebsocketServer = () => {
    const app = express();
    const httpServer = http.createServer(app);
    const wsServer = new WebSocket.Server({server: httpServer});

    wsServer.on('connection', function connection(clientWebSocket, request) {
        const clientData = operations.getClientData(request);
        operations.setKickOutTimer(clientWebSocket, clientData);

        clientWebSocket.on('message', (message: string) => {
            operations.setKickOutTimer(clientWebSocket, clientData);
            const messageData = JSON.parse(message) as WebsocketRequestMessage;
            switch (messageData.operationType) {
                case WebsocketRequestType.clientData:
                    operations.sendClientData(clientWebSocket, clientData);
                    break;
                case WebsocketRequestType.exitTable:
                    operations.exitTable(clientWebSocket, clientData);
                    break;
                case WebsocketRequestType.joinTable:
                    operations.joinTable(clientWebSocket, clientData);
                    break;
                case WebsocketRequestType.makeDecision:
                    operations.makeDecision(clientWebSocket, clientData, messageData.decision);
                    break;
                case WebsocketRequestType.placeBet:
                    operations.placeBet(clientWebSocket, clientData, messageData.bet);
                    break;
                case WebsocketRequestType.registerPlayer:
                    operations.registerPlayer(clientWebSocket, clientData, messageData.name);
                    break;
                default:
                    clientWebSocket.send(JSON.stringify({ error: 'Unsupported operation type' }));
                    break;
            }
        });
    });

    return httpServer;
};