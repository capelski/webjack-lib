'use strict';

function Table(tableId, cards, dealer) {
    this.activePlayerId = null;
    this.availableCards = cards;
    this.dealer = dealer;
    this.id = tableId;
    this.playedCards = [];
    this.players = [];
}

module.exports = Table;
