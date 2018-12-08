import { Player } from '../models/player';
import { Table } from '../models/table';
import cardSetService from './card-set-service';
import gameParametersService from '../services/game-parameters-service';
import playerService from './player-service';

const uuidV4 = require('uuid/v4');

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

const deleteVirtualTable = (virtualTableId: string) => {
    virtualTables = virtualTables.filter(virtualTable => virtualTable.id !== virtualTableId);
};

const getAvailableTable = () => {
    const { maxPlayers } = gameParametersService.getParameters();
    let table = tables.find(t => t.players.length < maxPlayers);
    if (!table) {
        table = createTable();
    }
    return table;
};

const getCardSet = (table: Table) => table.cardSet;

const getCurrentPlayer = (table: Table) => {
    let currentPlayer = null;
    if (table.isRoundBeingPlayed) {
        currentPlayer = table.players.find(playerService.hasUnplayedHands);
        if (!currentPlayer && playerService.hasUnplayedHands(table.dealer)) {
            currentPlayer = table.dealer;
        }
    }
    return currentPlayer;
};

const getDealer = (table: Table) => table.dealer;

const getPlayers = (table: Table) => table.players;

const getTableById = (tableId: string) => tables.find(t => t.id == tableId);

const getVirtualTableById = (tableId: string) => virtualTables.find(t => t.id == tableId);

const hasTrigger = (table: Table) => table.nextTrigger != null;

const isDealer = (table: Table, player: Player) =>
    playerService.getId(table.dealer) === playerService.getId(player);

const isRoundBeingPlayed = (table: Table) => table.isRoundBeingPlayed;

const addPlayer = (table: Table, player: Player) => {
    table.players.push(player);
}

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
}

const setTrigger = (table: Table, seconds: number, callback: Function) => {
    table.nextTrigger = setTimeout(callback, seconds * 1000);
    table.nextAction = new Date();
    table.nextAction.setSeconds(table.nextAction.getSeconds() + seconds);
};

const tableCreator = () => {
    const tableId = uuidV4();
    const dealer = playerService.createDealer();
    const cardSet = cardSetService.createCardSet();

    return new Table(tableId, dealer, cardSet);
};

export {
    addPlayer,
    clearTrigger,
    createVirtualTable,
    deleteVirtualTable,
    removePlayer,
    getAvailableTable,
    getCardSet,
    getCurrentPlayer,
    getDealer,
    getPlayers,
    getTableById,
    getVirtualTableById,
    hasTrigger,
    isDealer,
    isRoundBeingPlayed,
    setIsRoundBeingPlayed,
    setTrigger
};

export default {
    addPlayer,
    clearTrigger,
    createVirtualTable,
    deleteVirtualTable,
    removePlayer,
    getAvailableTable,
    getCardSet,
    getCurrentPlayer,
    getDealer,
    getPlayers,
    getTableById,
    getVirtualTableById,
    hasTrigger,
    isDealer,
    isRoundBeingPlayed,
    setIsRoundBeingPlayed,
    setTrigger
};
