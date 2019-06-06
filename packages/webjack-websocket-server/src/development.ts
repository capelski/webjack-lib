import { getWebsocketServer } from './index';

const wsServer = getWebsocketServer();
wsServer.listen(13000, () => {
    console.log('Web socket server running at port 13000!');
});