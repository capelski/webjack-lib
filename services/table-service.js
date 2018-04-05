'use strict';

const js = require('../utils/js-generics');
const Table = require('../models/table');
const cardService = require('./card-service');
const playerService = require('./player-service');
const uuidV4 = require('uuid/v4');
const gameParameters = require('../game-parameters');

let tables = [];

const collectPlayedCards = (table) => {
    // TODO PlayerService.hasHands
    var playedCards = table.players
        .filter(p => p.hands.length > 0)
        .reduce((cards, player) => cards.concat(playerService.collectPlayedCards(player)), [])
        .concat(playerService.collectPlayedCards(table.dealer));

    table.playedCards = table.playedCards.concat(playedCards);

    if (table.playedCards.length > 80) {
        table.availableCards = table.availableCards.concat(table.playedCards);
        table.playedCards = [];
        js.shuffleArray(table.availableCards);
    }

    console.log(table.playedCards.length, '/', table.availableCards.length);
};

const create = () => {
    var tableId = uuidV4();
    var dealer = playerService.create(uuidV4(), 'Dealer');
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

    if (player.hands.length > 0) {
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

const joinTable = (playerId) => {
    var table = tables.find(t => t.players.length < gameParameters.maxPlayers);
    if (!table) {
        table = create();
    }

    var player = playerService.create(playerId);
    table.players.push(player);

    return table.id;
};

module.exports = {
    collectPlayedCards,
    exitTable,
    getActivePlayer,
    getNextCard,
    getTable,
    joinTable
};
