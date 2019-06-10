import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { exposeWebjackRoutes } from './index';

const app = express();

app.use(
    session({
        secret: 'development session secret',
        resave: false,
        saveUninitialized: true
    })
);
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
exposeWebjackRoutes(app, '/api');

app.listen(3000, (error: any) => {
    if (error) {
        console.error(error);
    } else {
        console.log('Express server listening on port 3000');
    }
});
