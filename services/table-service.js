'use strict';

const js = require('../utils/js-generics');
const Table = require('../models/table');
const cardService = require('./card-service');
const playerSetService = require('./player-set-service');
const uuidV4 = require('uuid/v4');

let tables = [];

// TODO Exit table functionality

const addPlayedCards = (table, playedCards) => {
    table.playedCards = table.playedCards.concat(playedCards);

    if (table.playedCards.length > 80) {
        table.availableCards = table.availableCards.concat(table.playedCards);
        table.playedCards = [];
        js.shuffleArray(table.availableCards);
    }
};

const create = () => {
    var tableId = uuidV4();
    var playerSet = playerSetService.create();

    // TODO Extract number into some configuration file
    var cards = (new Array(4, null))
        .map(x => cardService.createDeck())
        .reduce((x, y) => x.concat(y), []);
    js.shuffleArray(cards);

    var table = new Table(tableId, cards, playerSet);
    tables.push(table);

    return table;
};

const getNextCard = (table) => {
    if (table.availableCards.length === 0) {
        throw 'No more cards left!';
    }
    var nextCard = table.availableCards.splice(0, 1)[0];
    return nextCard;
};

const getTable = (tableId) => tables.find(t => t.id == tableId);

const joinTable = (playerId) => {
    // TODO Extract find predicate into method
    var table = tables.find(t => t.playerSet.players.length <= 7);
    if (!table) {
        table = create();
    }

    playerSetService.addPlayer(table.playerSet, playerId);

    return table.id;
};

module.exports = {
    addPlayedCards,
    getNextCard,
    getTable,
    joinTable
};
