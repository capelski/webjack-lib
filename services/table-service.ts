import { Card } from '../models/card';
import { Table } from '../models/table';
import js from '../utils/js-generics';
import cardService from './card-service';
import playerService from './player-service';

const uuidV4 = require('uuid/v4');
const gameParameters = require('../game-parameters');

let tables: Table[] = [];
let virtualTables: Table[] = [];
let developmentCardsSet: Card[];

const clearTrigger = (table: Table) => {
    clearTimeout(table.nextTrigger);
    table.nextTrigger = null;
    table.nextAction = null;
};

const collectPlayedCards = (table: Table) => {
    clearTrigger(table);

    var playedCards = table.players
        .reduce((cards, player) => cards.concat(playerService.collectPlayedCards(player)), [])
        .concat(playerService.collectPlayedCards(table.dealer));

    table.playedCards = table.playedCards.concat(playedCards);

    if (table.playedCards.length > 80) {
        table.availableCards = table.availableCards.concat(table.playedCards);
        table.playedCards = [];
        js.shuffleArray(table.availableCards);
    }
};

const createTable = () => {
    const tableId = uuidV4();
    const dealer = playerService.createDealer();
    const cards = getCardsSet();

    const table = new Table(tableId, cards, dealer);
    tables.push(table);

    return table;
};

const createVirtualTable = () => {
    const tableId = uuidV4();
    const dealer = playerService.createDealer();
    const players = ' '.repeat(7).split('')
        .map((_, index) => playerService.createVirtualPlayer(`Robot ${index + 1}`));
    const cards = cardService.createDecks(gameParameters.decksNumber);

    const table = new Table(tableId, cards, dealer);
    table.isVirtual = true;
    players.forEach(player => table.players.push(player));
    virtualTables.push(table);

    return table.id;
};

const exitVirtualTable = (tableId: string) => {
    virtualTables = virtualTables.filter(t => t.id !== tableId);
};

const exitTable = (tableId: string, playerId: string) => {
    const table = tables.find(t => t.id == tableId);
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

const getCardsSet = () => developmentCardsSet ? developmentCardsSet : cardService.createDecks(gameParameters.decksNumber);

const getNextCard = (table: Table) => {
    if (table.availableCards.length === 0) {
        throw 'No more cards left!';
    }
    var nextCard = table.availableCards.splice(0, 1)[0];
    return nextCard;
};

const getTable = (tableId: string) => tables.find(t => t.id == tableId);

const getVirtualTable = (tableId: string) => virtualTables.find(t => t.id == tableId);

const hasTrigger = (table: Table) => table.nextTrigger != null;

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

const setTrigger = (table: Table, seconds: number, callback: Function) => {
    table.nextTrigger = setTimeout(callback, seconds * 1000);
    table.nextAction = new Date();
    table.nextAction.setSeconds(table.nextAction.getSeconds() + seconds);
};

const useDevelopmentCardsSet = (cardsSet: Card[]) => developmentCardsSet = cardsSet;

export const exportedMethods = {
    clearTrigger,
    collectPlayedCards,
    createVirtualTable,
    exitVirtualTable,
    exitTable,
    getActivePlayer,
    getNextCard,
    getTable,
    getVirtualTable,
    hasTrigger,
    joinTable,
    setTrigger,
    useDevelopmentCardsSet
};

export default {
    clearTrigger,
    collectPlayedCards,
    createVirtualTable,
    exitVirtualTable,
    exitTable,
    getActivePlayer,
    getNextCard,
    getTable,
    getVirtualTable,
    hasTrigger,
    joinTable,
    setTrigger,
    useDevelopmentCardsSet
};
