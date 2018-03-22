'use strict';

let nodeUtils = require('../utils/node');
let js = require('../js-generics');
let HandScore = require('../models/hand-score');
let cardService = require('./card-service');

function scoreService() {

    function addCardScore(handScore, card) {
        var value = cardService.getValue(card);
        if (cardService.isAce(card)) {
            handScore.min += 1;
            handScore.max += (handScore.max + 11 > 21 ? 1 : 11);
        }
        else {
            handScore.min += value;
            handScore.max += value;
        }
    }

    function getCardsScore(cards) {
        var handScore = new HandScore();
        var sortedHand = js.clone(cards)
        .sort((a, b) => {
            return cardService.getValue(a) > cardService.getValue(b);
        });

        js.iterate(sortedHand, (card) => {
            addCardScore(handScore, card);
        });

        return handScore;
    }

    function getEffectiveCardsScore(cards) {
        var handScore = getCardsScore(cards);
        if (handScore.max > 21 || handScore.min === handScore.max) {
            return handScore.min;
        }
        else {
            return handScore.max;
        }
    }

    function stringify(handScore) {
        if (handScore.max > 21 || handScore.min === handScore.max) {
            return handScore.min.toString();
        }
        else {
            return handScore.min + '/' + handScore.max;
        }
    }

    return {
        getEffectiveCardsScore: nodeUtils.trace(scoreService.name, getEffectiveCardsScore, true),
        getCardsScore: nodeUtils.trace(scoreService.name, getCardsScore, true),
        stringify: nodeUtils.trace(scoreService.name, stringify, true)
    };
}

module.exports = scoreService();
