'use strict';

const js = require('../utils/js-generics');
const Table = require('../models/table');
const cardService = require('./card-service');
const handSetService = require('./hand-set-service');
const playerService = require('./player-service');
const uuidV4 = require('uuid/v4');

let tables = [];

// TODO Exit table functionality

const collectPlayedCards = (table) => {
    var playedCards = table.players.filter(p => p.handSet != null)
        .reduce((cards, player) => cards.concat(handSetService.collectPlayedCards(player.handSet)), []);
    playedCards = playedCards.concat(handSetService.collectPlayedCards(table.dealer.handSet));

    table.players.forEach(player => player.handSet = null);
    table.dealer.handSet = null;

    table.playedCards = table.playedCards.concat(playedCards);

    if (table.playedCards.length > 80) {
        table.availableCards = table.availableCards.concat(table.playedCards);
        table.playedCards = [];
        js.shuffleArray(table.availableCards);
    }
};

const create = () => {
    var tableId = uuidV4();
    var dealer = playerService.create(uuidV4(), 'Dealer');

    // TODO Move to card service
    // TODO There should be 208 cards, not 104...
    // TODO Extract number into some configuration file
    var cards = (new Array(4, null))
        .map(x => cardService.createDeck())
        .reduce((x, y) => x.concat(y), []);
    js.shuffleArray(cards);

    var table = new Table(tableId, cards, dealer);
    tables.push(table);

    return table;
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
    // TODO Extract find predicate into method
    var table = tables.find(t => t.players.length <= 7);
    if (!table) {
        table = create();
    }

    var player = playerService.create(playerId);
    table.players.push(player);

    return table.id;
};

module.exports = {
    collectPlayedCards,
    getActivePlayer,
    getNextCard,
    getTable,
    joinTable
};
