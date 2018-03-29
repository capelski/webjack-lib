'use strict';

function Player(id, name) {
    if (id == null) {
        throw 'Every player must have an id!';
    }
    this.earningRate = 0;
    this.id = id;
    this.name = name || 'XXXX';
    this.handSet = null;
}

module.exports = Player;
