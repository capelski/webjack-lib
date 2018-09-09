'use strict';

const uuidV4 = require('uuid/v4');
const js = require('../utils/js-generics');
const gameParameters = require('../game-parameters');
const Table = require('../models/table');
const cardService = require('./card-service');
const playerService = require('./player-service');

let tables = [];

const clearTrigger = (table) => {
    clearTimeout(table.nextTrigger);
    table.nextTrigger = null;
    table.nextAction = null;
};

const collectPlayedCards = (table) => {
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

    // console.log(table.playedCards.length, '/', table.availableCards.length);
};

const create = () => {
    var tableId = uuidV4();
    var dealer = playerService.createDealer();
    var cards = cardService.createDecks(gameParameters.decksNumber);

    var table = new Table(tableId, cards, dealer);
    tables.push(table);

    return table;
};

const exitTable = (tableId, playerId) => {
    var table = tables.find(t => t.id == tableId);
    if (!table) {
        throw 'No table identified by ' + tableId + ' was found';
    }

    var player = table.players.find(p => p.id == playerId);
    if (!player) {
        throw 'No player identified by ' + playerId + ' was found';
    }

    if (playerService.hasHands(player)) {
        throw 'The current round must be ended before leaving the table';
    }

    table.players = table.players.filter(p => p.id != playerId);
};

const getActivePlayer = (table) => table.players.find(p => p.id === table.activePlayerId);

const getNextCard = (table) => {
    if (table.availableCards.length === 0) {
        throw 'No more cards left!';
    }
    var nextCard = table.availableCards.splice(0, 1)[0];
    return nextCard;
};

const getTable = (tableId) => tables.find(t => t.id == tableId);

const hasTrigger = (table) => table.nextTrigger != null;

const joinTable = (playerId) => {
    var table = tables.find(t => t.players.length < gameParameters.maxPlayers);
    if (!table) {
        table = create();
    }

    const player = playerService.getPlayer(playerId);
    table.players.push(player);

    return table.id;
};

const setTrigger = (table, seconds, callback) => {
    table.nextTrigger = setTimeout(callback, seconds * 1000);
    table.nextAction = new Date();
    table.nextAction.setSeconds(table.nextAction.getSeconds() + seconds);
};

module.exports = {
    clearTrigger,
    collectPlayedCards,
    exitTable,
    getActivePlayer,
    getNextCard,
    getTable,
    hasTrigger,
    joinTable,
    setTrigger
};
