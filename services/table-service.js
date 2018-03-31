'use strict';

const js = require('../utils/js-generics');
const Table = require('../models/table');
const cardSetService = require('./card-set-service');
const playerSetService = require('./player-set-service');
const uuidV4 = require('uuid/v4');

let tables = [];

const create = () => {
    var tableId = uuidV4();
    var cardSet = cardSetService.create();
    var playerSet = playerSetService.create();

    var table = new Table(tableId, cardSet, playerSet);
    tables.push(table);

    return table;
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
    getTable,
    joinTable
};
