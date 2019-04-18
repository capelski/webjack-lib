import { Player } from '../models/player';
import { Table } from '../models/table';
import cardSetService from './card-set-service';
import gameParametersService from '../services/game-parameters-service';
import playerService from './player-service';
import { v4 as uuid } from 'uuid';

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

const getCardSet = (table: Table) => table.cardSet;

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

const getDealer = (table: Table) => table.dealer;

const getPlayers = (table: Table) => table.players;

const getTableById = (tableId: string) => tables.find(t => t.id == tableId);

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

const setTrigger = (table: Table, seconds: number, callback: (...args: any[]) => void) => {
    table.nextTrigger = setTimeout(callback, seconds * 1000) as any;
    table.nextActionTimestamp = table.baseTimestamp + seconds * 1000;
};

export {
    addPlayer,
    clearTrigger,
    createTable,
    deleteTable,
    removePlayer,
    getAvailableTable,
    getCardSet,
    getCurrentPlayer,
    getDealer,
    getPlayers,
    getTableById,
    hasTrigger,
    isDealer,
    isRoundBeingPlayed,
    setIsRoundBeingPlayed,
    setTrigger
};

export default {
    addPlayer,
    clearTrigger,
    createTable,
    deleteTable,
    removePlayer,
    getAvailableTable,
    getCardSet,
    getCurrentPlayer,
    getDealer,
    getPlayers,
    getTableById,
    hasTrigger,
    isDealer,
    isRoundBeingPlayed,
    setIsRoundBeingPlayed,
    setTrigger
};
