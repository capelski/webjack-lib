import express, { RequestHandler, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { exposeWebApi } from 'webjack-web-api';
import { join } from 'path';

const server: express.Application = express();
const router = express.Router();

const corsMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
};

const sessionMiddleware: RequestHandler = session({
    secret: 'test-app',
    resave: false,
    saveUninitialized: true
});

exposeWebApi(router, [sessionMiddleware, corsMiddleware]);

server.use('/api', router);

const publicFolder = join(__dirname, '..', 'ui', 'dist');
server.use(express.static(publicFolder));

server.listen(8000, (error: any) => {
    if (error) {
        console.log('An error ocurred while starting the server...', error);
    }
    else {
        console.log('Server up and running in port 8000!');
    }
});