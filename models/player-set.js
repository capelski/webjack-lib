'use strict';

function PlayerSet(dealer, players) {
    // TODO Remove property currentIndex
    this.currentIndex = null;
    this.players = (players || []).concat([dealer]);
}

module.exports = PlayerSet;
