'use strict';

function Hand() {
    this.cards = [];
    this.status = '';
    this.value = 1;
    this.score = 0;
    this.played = false;
}

module.exports = Hand;
