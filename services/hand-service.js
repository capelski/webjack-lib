'use strict';

let nodeUtils = require('../utils/node');
let Hand = require('../models/hand');
let cardService = require('./card-service');
let scoreService = require('./score-service');
let js = require('../js-generics');

function handService() {

    function addCard(hand, card) {
        hand.hasAce = hand.hasAce || cardService.isAce(card);
        hand.cards.push(card);
        hand.score = scoreService.getHandScore(hand);
    }

    function clear(hand) {
        var cards = hand.cards;
        hand.cards = [];
        hand.hasAce = false;
        hand.status = null;
        return cards;
    }

    function create() {
        return new Hand();
    }

    function getScore(hand) {
        return scoreService.getHandScore(hand).effective;
    }

    function isSplitable(hand) {
        return (hand.cards.length === 2 &&
        cardService.getValue(hand.cards[0]) === cardService.getValue(hand.cards[1]));
    }

    function setStatus(hand, status) {
        hand.status = status;
    }

    function stringify(hand) {
        var stringifiedCards = js.stringifyArray(hand.cards, (card) => {
            return cardService.stringify(card);
        });
        var handScore = scoreService.getHandScore(hand);
        stringifiedCards += ' (' + scoreService.stringify(handScore) + ') - ' + hand.status +
        ', Worth: ' + hand.worth;
        return stringifiedCards;
    }

    return {
        addCard: nodeUtils.trace(handService.name, addCard, true),
        clear: nodeUtils.trace(handService.name, clear, true),
        create: nodeUtils.trace(handService.name, create),
        getScore: nodeUtils.trace(handService.name, getScore, true),
        isSplitable: nodeUtils.trace(handService.name, isSplitable),
        setStatus: nodeUtils.trace(handService.name, setStatus),
        stringify: nodeUtils.trace(handService.name, stringify)
    };
}

module.exports = handService();
