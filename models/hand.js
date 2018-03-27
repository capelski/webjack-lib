'use strict';

function Hand() {
    this.cards = [];
    this.status = 'Unplayed';
    this.worth = 1;
    this.score = 0;
}

module.exports = Hand;
