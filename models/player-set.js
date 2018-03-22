'use strict';

function PlayerSet(dealer, players) {
    this.currentIndex = null;
    this.players = (players || []).concat([dealer]);
}

module.exports = PlayerSet;
