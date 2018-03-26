'use strict';

let js = require('../utils/js-generics');
let HandSet = require('../models/hand-set');
let handService = require('./hand-service');

function handSetService() {

    function addAction(handSet, action) {
        handSet.actions.push(action);
    }

    function addCard(handSet, card) {
        var currentHand = getCurrentHand(handSet);
        handService.addCard(currentHand, card);
    }

    function clearRound(handSet) {
        var cards = [];
        js.iterate(handSet.hands, (hand) => {
            cards = cards.concat(handService.clear(hand));
        });

        handSet.actions = [];        
        handSet.currentHand = null;        
        handSet.hands = [];
        handSet.earningRate = null;

        return cards;
    }

    function create() {
        return new HandSet();
    }

    function doubleCurrentHand(handSet) {
        var currentHand = getCurrentHand(handSet);
        currentHand.worth += 1;
    }

    function getNextHand(handSet) {
        handSet.currentHand++;
        return handSet.hands[handSet.currentHand];
    }

    function getCurrentHand(handSet) {
        if (!handSet.hands || !handSet.hands[handSet.currentHand]) {
            throw 'No available hands in the hand set!';
        }
        return handSet.hands[handSet.currentHand];
    }

    function hasUnplayedHand(handSet) {
        var pendingHand = false;
        handSet.hands.forEach((hand) => {
            pendingHand = pendingHand || (hand.status === 'Unplayed');
        });
        return pendingHand;
    }    

    function startRound(handSet) {
        handSet.actions = [];
        handSet.currentHand = 0;
        handSet.hands.push(handService.create());
    }

    function splitCurrentHand(handSet) {
        var currentHand = getCurrentHand(handSet);
        var newHand = handService.create();
        handSet.hands.splice(handSet.currentHand + 1, 0, newHand);
        newHand.cards = currentHand.cards.splice(-1);
    }

    function stringify(handSet, active) {
        var stringifiedHandSet = '';
        handSet.hands.forEach((hand) => {
            stringifiedHandSet += '<br />&emsp;';
            if (active && handSet.hands[handSet.currentHand] === hand) {
                stringifiedHandSet += '> ';
            }            
            stringifiedHandSet += handService.stringify(hand);
        });
        if (handSet.earningRate != null) {
            stringifiedHandSet += '<br />&emsp;Returning rate: ' + handSet.earningRate;
        }
        if (handSet.hands.length > 0) {
            stringifiedHandSet += '<br />';
        }
        return stringifiedHandSet;
    }

    function updateEarningRate(handSet) {
        handSet.earningRate = 0;
        handSet.hands.forEach((hand) => {
            var handReturningRate = 
            1.5 * (hand.status === 'BlackJack') +
            1 * (hand.status === 'Wins') +
            0 * (hand.status === 'Ties') +
            -1 * (hand.status === 'Loses');
            handSet.earningRate += handReturningRate * hand.worth;
        });
        return handSet.earningRate;
    }

    return {
        addAction,
        addCard,
        clearRound,
        create,
        doubleCurrentHand,
        getCurrentHand,
        getNextHand,
        hasUnplayedHand,
        splitCurrentHand,
        stringify,
        startRound,
        updateEarningRate
    };
}

module.exports = handSetService();
