import { Player } from '../models/player';
import { Table } from '../models/table';
import { createCardSet } from './card-set-service';
import { getParameters } from './game-parameters-service';
import * as playerService from './player-service';
import { v4 as uuid } from 'uuid';

let tables: Table[] = [];

export const addPlayer = (table: Table, player: Player) => table.players.push(player);

export const clearNextAction = (table: Table) => {
    if (table.nextAction) {
        clearTimeout(table.nextAction as any)
    };
     table.nextAction = table.nextActionTimestamp = table.baseTimestamp = undefined;
};

export const createTable = () => {
    const tableId = uuid();
    const dealer = playerService.createDealer();
    const cardSet = createCardSet();

    const table = new Table(tableId, dealer, cardSet);
    tables.push(table);
    return table;
};

export const deleteTable = (tableId: string) => {
    tables = tables.filter(table => table.id !== tableId);
};

export const getActivePlayers = (table: Table) =>
    table.players.filter(playerService.hasHands);

export const getAvailableTable = () => {
    const { maxPlayers } = getParameters();
    let table = tables.find(t => t.players.length < maxPlayers);
    if (!table) {
        table = createTable();
    }
    return table;
};

export const getCurrentPlayer = (table: Table): Player | undefined => {
    let currentPlayer: Player | undefined;
    if (table.isRoundBeingPlayed) {
        currentPlayer = table.players.find(playerService.hasUnplayedHands);
    }
    return currentPlayer;
};

export const getPlayerById = (table: Table, playerId: string) => table.players.find(p => p.id === playerId);

export const getTableById = (tableId: string) => tables.find(t => t.id == tableId);

export const isDealerTurn = (table: Table): boolean =>
    table.isRoundBeingPlayed && !getCurrentPlayer(table) && playerService.hasUnplayedHands(table.dealer);

export const removePlayer = (table: Table, playerId: string) => {
    table.players = table.players.filter(player => player.id !== playerId);
};

export const setIsRoundBeingPlayed = (table: Table, isRoundBeingPlayed: boolean) => {
    table.isRoundBeingPlayed = isRoundBeingPlayed;
};

export const setNextAction = (table: Table, delay: number, nextAction: (...args: any[]) => void) => {
    table.nextAction = setTimeout(nextAction, delay * 1000) as any;
    table.nextActionTimestamp = Date.now() + delay * 1000;
};

// TODO Extract into startRound use case
export const updatePlayersInactivity = (table: Table) => {
    const players = table.players;
    const activePlayers = players.filter(playerService.hasHands);
    const inactivePlayers = players.filter(p => !playerService.hasHands(p));
    const { maxInactiveRounds } = getParameters();

    activePlayers.forEach(p => p.inactiveRounds = 0);
    inactivePlayers.forEach(p => {
        playerService.increaseInactiveRounds(p);
        if (p.inactiveRounds > maxInactiveRounds) {
            removePlayer(table, p.id);
        }
    });
};