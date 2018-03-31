'use strict';

function Table(tableId, cards, playerSet) {
    this.id = tableId;
    this.availableCards = cards;
    this.playedCards = [];
    this.playerSet = playerSet;
}

module.exports = Table;
