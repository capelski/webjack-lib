    
import express from 'express';
import http from 'http';
import WebSocket from 'ws';

export const getWebsocketServer = () => {
    const app = express();
    const httpServer = http.createServer(app);
    const wsServer = new WebSocket.Server({server: httpServer});

    wsServer.on('connection', function connection(clientWebSocket) {

        clientWebSocket.on('message', (message: string) => {
            const data = JSON.parse(message);
            console.log(message);
    
            switch (data.operationType) {
                // TODO Implement use cases: RegisterPlayer, JoinTable, etc.
            }
        });
    
        clientWebSocket.on('close', () => {
            // TODO Unsubscribe from table if not done
        });
    });

    return httpServer;
};