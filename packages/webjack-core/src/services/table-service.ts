import { Player } from '../models/player';
import { Table } from '../models/table';
import { createCardSet } from './card-set-service';
import { getParameters } from './game-parameters-service';
import * as playerService from './player-service';
import * as orchestrationService from './orchestration-service';
import * as handService from './hand-service';
import { v4 as uuid } from 'uuid';
import { PlayerActions } from '../types/player-actions';

let tables: Table[] = [];

export const clearTrigger = (table: Table) => {
    if (table.nextTrigger) {
        clearTimeout(table.nextTrigger as any)
    };
     table.nextTrigger = table.nextActionTimestamp = table.baseTimestamp = undefined;
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

const getAvailableTable = () => {
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

export const getTableById = (tableId: string) => tables.find(t => t.id == tableId);

export const isDealerTurn = (table: Table): boolean =>
    table.isRoundBeingPlayed && !getCurrentPlayer(table) && playerService.hasUnplayedHands(table.dealer);

export const isRoundBeingPlayed = (table: Table) => table.isRoundBeingPlayed;

export const joinTable = (playerId: string) => {
    const player = playerService.getPlayerById(playerId);
    if (!player) {
        throw 'No player identified by ' + playerId + ' was found';
    }
    playerService.setInactiveRounds(player, 0);

    const table = getAvailableTable();
    table.players.push(player);
    return table;
};

export const makeDecision = (table: Table, playerId: string, decision: PlayerActions) => {
    const currentPlayer = getCurrentPlayer(table);
    if (!currentPlayer) {
        throw 'No player is playing now';
    }

    if (currentPlayer.id !== playerId) {
        throw 'Not allowed to play now. It is ' + currentPlayer.name + '\'s turn';
    }

    orchestrationService.makeDecision(table, currentPlayer, decision);
};

export const moveRoundForward = (table: Table) => orchestrationService.moveRoundForward(table);

export const placeBet = (table: Table, playerId: string, bet: number) => {
    const player = table.players.find(p => p.id == playerId);
    if (!player) {
        throw 'No player identified by ' + playerId + ' was found';
    }

    if (isRoundBeingPlayed(table)) {
        throw 'Bets can only be placed before a round starts';
    }

    const hand = handService.create(bet);
    playerService.setHands(player, [hand]);
    playerService.increaseEarningRate(player, -bet);

    if (table.nextTrigger == null) {
        orchestrationService.setStartRoundTrigger(table);
    }
};

export const removePlayer = (tableId: string, playerId: string) => {
    const table = getTableById(tableId);
    if (!table) {
        throw 'No table identified by ' + tableId + ' was found';
    }

    const player = table.players.find(player => player.id == playerId);
    if (!player) {
        throw 'No player identified by ' + playerId + ' was found';
    }

    if (playerService.hasHands(player)) {
        throw 'The current round must be ended before leaving the table';
    }

    table.players = table.players.filter(player => player.id != playerId);
};

export const setIsRoundBeingPlayed = (table: Table, isRoundBeingPlayed: boolean) => {
    table.isRoundBeingPlayed = isRoundBeingPlayed;
};

export const setTrigger = (table: Table, seconds: number, callback: (...args: any[]) => void) => {
    table.nextTrigger = setTimeout(callback, seconds * 1000) as any;
    table.nextActionTimestamp = Date.now() + seconds * 1000;
};
