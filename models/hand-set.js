'use strict';

function HandSet(hands) {
    this.currentHand = 0; // TODO Remove? Calculate every time based on played
    this.hands = hands;
}

module.exports = HandSet;
