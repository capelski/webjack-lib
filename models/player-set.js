'use strict';

function PlayerSet(dealer) {
    this.activePlayerId = null;
    this.dealer = dealer;
    this.players = [];
}

module.exports = PlayerSet;
