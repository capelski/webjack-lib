import { Response } from 'express';

export const noTableJoined = (res: Response) =>
    res.status(400).send(JSON.stringify({ message: 'No table has been joined' }));