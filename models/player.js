'use strict';

function Player(id, name, handSet) {
    if (id == null) {
        throw 'Every player must have an id!';
    }
    this.earningRate = 0;
    this.id = id;
    this.name = name || 'XXXX';
    this.handSet = handSet;
}

module.exports = Player;
