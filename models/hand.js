'use strict';

function Hand() {
    this.cards = [];
    this.hasAce = false;
    this.status = 'Unplayed';
    this.worth = 1;
    this.score = {};
}

module.exports = Hand;
