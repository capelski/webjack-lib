'use strict';

function PlayerSet(dealer) {
    // TODO Remove property currentIndex
    this.currentIndex = null;
    this.players = [dealer];
}

module.exports = PlayerSet;
