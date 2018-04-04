'use strict';

function Player(id, name) {
    this.earningRate = 0;
    this.id = id;
    this.name = name || 'Unnamed';
    this.hands = [];
}

module.exports = Player;
