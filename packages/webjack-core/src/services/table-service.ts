import { Player } from '../models/player';
import { Table } from '../models/table';
import cardSetService from './card-set-service';
import gameParametersService from './game-parameters-service';
import playerService from './player-service';
import orchestrationService from './orchestration-service';
import handService from './hand-service';
import { v4 as uuid } from 'uuid';
import { PlayerActions } from '../types/player-actions';

let tables: Table[] = [];

const clearTrigger = (table: Table) => {
    if (table.nextTrigger) {
        clearTimeout(table.nextTrigger as any)
    };
     table.nextTrigger = table.nextActionTimestamp = table.baseTimestamp = undefined;
};

const createTable = () => {
    const tableId = uuid();
    const dealer = playerService.createDealer();
    const cardSet = cardSetService.createCardSet();

    const table = new Table(tableId, dealer, cardSet);
    tables.push(table);
    return table;
};

const deleteTable = (tableId: string) => {
    tables = tables.filter(table => table.id !== tableId);
};

const getAvailableTable = () => {
    const { maxPlayers } = gameParametersService.getParameters();
    let table = tables.find(t => t.players.length < maxPlayers);
    if (!table) {
        table = createTable();
    }
    return table;
};

const getCurrentPlayer = (table: Table): Player | undefined => {
    let currentPlayer: Player | undefined = undefined;
    if (table.isRoundBeingPlayed) {
        currentPlayer = table.players.find(playerService.hasUnplayedHands);
        if (!currentPlayer && playerService.hasUnplayedHands(table.dealer)) {
            currentPlayer = table.dealer;
        }
    }
    return currentPlayer;
};

const getTableById = (tableId: string) => tables.find(t => t.id == tableId);

const isDealer = (table: Table, player: Player) => table.dealer.id === player.id;

const isRoundBeingPlayed = (table: Table) => table.isRoundBeingPlayed;

const joinTable = (playerId: string) => {
    const player = playerService.getPlayerById(playerId);
    if (!player) {
        throw 'No player identified by ' + playerId + ' was found';
    }
    playerService.setInactiveRounds(player, 0);

    const table = getAvailableTable();
    table.players.push(player);
    return table;
};

const makeDecision = (table: Table, playerId: string, decision: PlayerActions) => {
    const currentPlayer = getCurrentPlayer(table);
    if (!currentPlayer) {
        throw 'No one is playing now';
    }

    if (currentPlayer.id !== playerId) {
        throw 'Not allowed to play now. It is ' + currentPlayer.name + '\'s turn';
    }

    orchestrationService.makeDecision(table, currentPlayer, decision);
};

const moveRoundForward = (table: Table) => orchestrationService.moveRoundForward(table);

const placeBet = (table: Table, playerId: string, bet: number) => {
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

const removePlayer = (tableId: string, playerId: string) => {
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

const setIsRoundBeingPlayed = (table: Table, isRoundBeingPlayed: boolean) => {
    table.isRoundBeingPlayed = isRoundBeingPlayed;
};

const setTrigger = (table: Table, seconds: number, callback: (...args: any[]) => void) => {
    table.nextTrigger = setTimeout(callback, seconds * 1000) as any;
    table.nextActionTimestamp = Date.now() + seconds * 1000;
};

export {
    clearTrigger,
    createTable,
    deleteTable,
    getCurrentPlayer,
    getTableById,
    isDealer,
    isRoundBeingPlayed,
    joinTable,
    makeDecision,
    moveRoundForward,
    placeBet,
    removePlayer,
    setIsRoundBeingPlayed,
    setTrigger
};

export default {
    clearTrigger,
    createTable,
    deleteTable,
    getCurrentPlayer,
    getTableById,
    isDealer,
    isRoundBeingPlayed,
    joinTable,
    makeDecision,
    moveRoundForward,
    placeBet,
    removePlayer,
    setIsRoundBeingPlayed,
    setTrigger
};
