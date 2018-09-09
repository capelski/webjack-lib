'use strict';

function Hand(bet) {
    this.cards = [];
    this.status = '';
    this.value = bet;
    this.score = 0;
    this.played = false;
    this.canDouble = false;
    this.canSplit = false;
}

module.exports = Hand;
