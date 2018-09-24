'use strict';

function Table(tableId, cards, dealer) {
    this.activePlayerId = null;
    this.availableCards = cards;
    this.dealer = dealer;
    this.id = tableId;
    this.isVirtual = false;
    this.playedCards = [];
    this.players = [];
    this.nextTrigger = null;
    this.nextAction = null;
}

module.exports = Table;
