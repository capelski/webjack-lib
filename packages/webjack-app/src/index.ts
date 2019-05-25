import express, { RequestHandler, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { exposeWebjackRoutes } from 'webjack-web-api';
import { join } from 'path';

const corsMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
};

const server: express.Application = express();

const assetsFolder = join(__dirname, 'public');
server.use(express.static(assetsFolder));
server.use(session({
    secret: 'test-app',
    resave: false,
    saveUninitialized: true
}));
server.use(corsMiddleware);

exposeWebjackRoutes(server, '/api');

server.listen(8000, (error: any) => {
    if (error) {
        console.log('An error ocurred while starting the server...', error);
    }
    else {
        console.log('Server up and running in port 8000!');
    }
});