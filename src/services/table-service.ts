import { Table } from '../models/table';
import cardSetService from './card-set-service';
import playerService from './player-service';

const uuidV4 = require('uuid/v4');
const gameParameters = require('../../game-parameters');

let tables: Table[] = [];
let virtualTables: Table[] = [];

const clearTrigger = (table: Table) => {
    clearTimeout(table.nextTrigger);
    table.nextTrigger = null;
    table.nextAction = null;
};

const createTable = () => {
    const table = tableCreator();
    tables.push(table);
    return table;
};

const createVirtualTable = () => {
    const virtualTable = tableCreator();

    virtualTable.isVirtual = true;
    virtualTable.players = ' '.repeat(7).split('')
        .map((_, index) => playerService.createVirtualPlayer(`Robot ${index + 1}`));
    
    virtualTables.push(virtualTable);

    return virtualTable.id;
};

const endRound = (table: Table) => {
    clearTrigger(table);
    cardSetService.collectPlayedCards(table.cardSet);
    table.players.forEach(playerService.clearPlayerHands);
    playerService.clearPlayerHands(table.dealer);
    setRoundBeingPlayed(table, false);
};

const exitVirtualTable = (tableId: string) => {
    virtualTables = virtualTables.filter(t => t.id !== tableId);
};

const removePlayer = (tableId: string, playerId: string) => {
    const table = getTable(tableId);
    if (!table) {
        throw 'No table identified by ' + tableId + ' was found';
    }

    const player = table.players.find(p => p.id == playerId);
    if (!player) {
        throw 'No player identified by ' + playerId + ' was found';
    }

    if (playerService.hasHands(player)) {
        throw 'The current round must be ended before leaving the table';
    }

    table.players = table.players.filter(p => p.id != playerId);
};

const getActivePlayer = (table: Table) => table.players.find(p => p.id === table.activePlayerId);

const getCardSet = (table: Table) => table.cardSet;

const getTable = (tableId: string) => tables.find(t => t.id == tableId);

const getVirtualTable = (tableId: string) => virtualTables.find(t => t.id == tableId);

const hasTrigger = (table: Table) => table.nextTrigger != null;

const isRoundBeingPlayed = (table: Table) => table.isRoundBeingPlayed;

const joinTable = (playerId: string) => {
    var table = tables.find(t => t.players.length < gameParameters.maxPlayers);
    if (!table) {
        table = createTable();
    }

    const player = playerService.getPlayer(playerId);
    playerService.resetInactiveRounds(player);
    table.players.push(player);

    return table.id;
};

const setActivePlayer = (table: Table, playerId: string) => {
    table.activePlayerId = playerId;
}

const setRoundBeingPlayed = (table: Table, isRoundBeingPlayed: boolean) => {
    table.isRoundBeingPlayed = isRoundBeingPlayed;
}

const setTrigger = (table: Table, seconds: number, callback: Function) => {
    table.nextTrigger = setTimeout(callback, seconds * 1000);
    table.nextAction = new Date();
    table.nextAction.setSeconds(table.nextAction.getSeconds() + seconds);
};

const tableCreator = () => {
    const tableId = uuidV4();
    const dealer = playerService.createDealer();
    const cardSet = cardSetService.createCardSet(gameParameters.decksNumber);

    return new Table(tableId, cardSet, dealer);
};

export const exportedMethods = {
    clearTrigger,
    createVirtualTable,
    endRound,
    exitVirtualTable,
    removePlayer,
    getActivePlayer,
    getCardSet,
    getTable,
    getVirtualTable,
    hasTrigger,
    isRoundBeingPlayed,
    joinTable,
    setActivePlayer,
    setRoundBeingPlayed,
    setTrigger
};

export default {
    clearTrigger,
    createVirtualTable,
    endRound,
    exitVirtualTable,
    removePlayer,
    getActivePlayer,
    getCardSet,
    getTable,
    getVirtualTable,
    hasTrigger,
    isRoundBeingPlayed,
    joinTable,
    setActivePlayer,
    setRoundBeingPlayed,
    setTrigger
};
