export const noTableJoined = (res: any) =>
    res.status(400).send(JSON.stringify({ message: 'No table has been joined' }));