'use strict';

function Player(id, name) {
    this.earningRate = 0;
    this.id = id;
    this.name = name || 'Unnamed';
    this.hands = [];
    this.inactiveRounds = 0;
}

module.exports = Player;
