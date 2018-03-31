'use strict';

function PlayerSet(dealer) {
    this.activePlayerId = null;
    this.players = [dealer];
}

module.exports = PlayerSet;
