'use strict';

function Hand() {
    this.cards = [];
    this.hasAce = false;
    this.status = 'Unplayed';
    this.worth = 1;
}

module.exports = Hand;
