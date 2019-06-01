import { v4 as uuid } from 'uuid';
import { Player } from '../models/player';
import { Table } from '../models/table';
import { TableStatus } from '../types/table-status';
import { createCardSet } from './card-set-service';
import { getParameters } from './game-parameters-service';
import * as playerService from './player-service';

let tables: Table[] = [];

export const addPlayer = (table: Table, player: Player) => table.players.push(player);

export const clearNextAction = (table: Table) => {
    if (table.nextAction) {
        clearTimeout(table.nextAction as any)
    };
     table.nextAction = table.nextActionTimestamp = table.baseTimestamp = undefined;
};

export const createTable = (useTrainingHands = false) => {
    const tableId = uuid();
    const dealer = playerService.createDealer();
    const cardSet = createCardSet(useTrainingHands);
    const table = new Table(tableId, dealer, cardSet);
    tables.push(table);
    return table;
};

export const deleteTable = (tableId: string) => {
    tables = tables.filter(table => table.id !== tableId);
};

export const getActivePlayers = (table: Table) =>
    table.players.filter(playerService.isPlaying);

export const getAvailableTable = () => {
    const { maxPlayers } = getParameters();
    let table = tables.find(t => t.players.length < maxPlayers);
    if (!table) {
        table = createTable();
    }
    return table;
};

export const getCurrentPlayer = (table: Table): Player | undefined => {
    return table.status === TableStatus.PlayerTurns ?
        table.players.find(player => !!playerService.getCurrentHand(player)) :
        undefined;
};

export const getPlayerById = (table: Table, playerId: string) => table.players.find(p => p.id === playerId);

export const getTableById = (tableId: string) => tables.find(t => t.id == tableId);    

export const removePlayer = (table: Table, playerId: string) => {
    table.players = table.players.filter(player => player.id !== playerId);
};

export const setStatus = (table: Table, status: TableStatus) => {
    table.status = status;
};

export const setNextAction = (table: Table, delay: number, nextAction: (...args: any[]) => void) => {
    table.nextAction = setTimeout(nextAction, delay * 1000) as any;
    table.nextActionTimestamp = Date.now() + delay * 1000;
};