import { Request, Response } from 'express';
import { services, types, useCases } from 'webjack-core';

export const exitTable = (req: Request, res: Response) => {
    const operationResult = useCases.exitTable(req.session!.tableId, req.session!.playerId);
    if (operationResult.outcome === types.IOperationOutcome.success) {
        delete req.session!.tableId;
        res.status(200).send(JSON.stringify({}));
    } else {
        res.status(400).send(JSON.stringify({ message: operationResult.error }));
    }
};

export const getTableStatus = (req: Request, res: Response) => {
    const table = services.tableService.getTableById(req.session!.tableId);
    if (!table) {
        res.status(400).send(JSON.stringify({ message: 'No table has been joined' }));
    } else {
        const player = services.tableService.getPlayerById(table, req.session!.playerId);
        if (!player) {
            delete req.session!.tableId;
            res.status(400).send(
                JSON.stringify({ message: 'You have been kicked out due to inactivity' })
            );
        } else {
            table.baseTimestamp = Date.now();
            return res.status(200).send(
                JSON.stringify({
                    baseTimestamp: table.baseTimestamp,
                    dealer: table.dealer,
                    id: table.id,
                    nextActionTimestamp: table.nextActionTimestamp,
                    players: table.players,
                    status: table.status
                })
            );
        }
    }
};

export const joinTable = (req: Request, res: Response) => {
    const operationResult = useCases.joinTable(req.session!.playerId);
    if (operationResult.outcome === types.IOperationOutcome.success) {
        req.session!.tableId = operationResult.result.id;
        res.status(200).send(JSON.stringify({ tableId: operationResult.result.id }));
    } else {
        res.status(400).send(JSON.stringify({ message: operationResult.error }));
    }
};

export const makeDecision = (req: Request, res: Response) => {
    const decision = req.query.decision;
    const operationResult = useCases.makeDecision(
        req.session!.tableId,
        req.session!.playerId,
        decision
    );

    if (operationResult.outcome === types.IOperationOutcome.success) {
        res.status(200).send(JSON.stringify({}));
    } else {
        res.status(400).send(JSON.stringify({ message: operationResult.error }));
    }
};

export const placeBet = (req: Request, res: Response) => {
    const bet = parseInt(req.query.bet, 10);
    const operationResult = useCases.placeBet(req.session!.tableId, req.session!.playerId, bet);
    if (operationResult.outcome === types.IOperationOutcome.success) {
        res.status(200).send(JSON.stringify({}));
    } else {
        res.status(400).send(JSON.stringify({ message: operationResult.error }));
    }
};
