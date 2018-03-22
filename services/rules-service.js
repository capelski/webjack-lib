'use strict';

let nodeUtils = require('../utils/node');
let cardSetService = require('./card-set-service');
let handService = require('./hand-service');
let handSetService = require('./hand-set-service');
let playerService = require('./player-service');
let playerSetService = require('./player-set-service');

function rulesService() {

    function checkBlackJackOrLoses(game, player, handScore, playerHand, initialDealing) {
        if (handScore === 21 && playerHand.cards.length === 2) {
            handService.setStatus(playerHand, 'BlackJack');
            if (!initialDealing) {
                startNextHand(game, player);
            }
        }                
        else if (handScore > 21) {
            handService.setStatus(playerHand, 'Loses');
            if (!initialDealing) {
                startNextHand(game, player);
            }
        }
    }

    function dealCard(game, player, initialDealing) {
        var nextCard = cardSetService.getNextCard(game.cardSet);
        playerService.dealCard(player, nextCard);
        var playerHand = playerService.getCurrentHand(player);
        var handScore = handService.getScore(playerHand);
        checkBlackJackOrLoses(game, player, handScore, playerHand, initialDealing);
        return handScore;
    }

    function dealerTurn(game) {
        var dealerHand = playerService.getCurrentHand(playerSetService.getDealer(game.playerSet));
        var dealerScore = handService.getScore(dealerHand);
        while (dealerScore < 17) {
            var nextCard = cardSetService.getNextCard(game.cardSet);
            playerService.dealCard(playerSetService.getDealer(game.playerSet), nextCard);
            dealerScore = handService.getScore(dealerHand);
        }
        return dealerScore;
    }

    function double(game, player) {
        var playerHand = playerService.getCurrentHand(player);
        var handScore = handService.getScore(playerHand);
        if (handScore < 9 || handScore > 11) {
            throw 'Double only allowed with 9, 10 or 11 points';
        }
        handSetService.doubleCurrentHand(player.handSet);        
        handScore = dealCard(game, player);

        if (handScore < 22) {
            handService.setStatus(playerHand, 'Played');
            startNextHand(game, player);
        }
    }

    function hit(game, player) {       
        dealCard(game, player);
    }

    function resolve(player, dealerScore) {
        player.handSet.hands.forEach((hand) => {
            var handScore = handService.getScore(hand);
            var status;
 
            if (handScore > 21) {
                status = 'Loses';
            }
            else if (handScore === 21 && hand.cards.length === 2) {
                status = 'BlackJack';
            }
            else if (dealerScore > 21) {
                status = 'Wins';
            }
            else if (handScore === dealerScore) {
                status = 'Ties';
            }
            else {
                status = handScore > dealerScore ? 'Wins' : 'Loses';
            }
            handService.setStatus(hand, status);
        });
        playerService.updateEarningRate(player);        
    }

    function split(game, player) {
        var currentHand = handSetService.getCurrentHand(player.handSet);
        if (!handService.isSplitable(currentHand)) {
            throw 'Split only allowed with two equal cards!';
        }
        handSetService.splitCurrentHand(player.handSet);        
        return dealCard(game, player);
    }

    function startNextHand(game, player) {
        var nextHand = handSetService.getNextHand(player.handSet);
        if (nextHand) {
            dealCard(game, player);
        }
        else {
            playerSetService.startNextTurn(game.playerSet);
        }
    }

    function stand(game, player) {
        var playerHand = playerService.getCurrentHand(player);
        handService.setStatus(playerHand, 'Played');
        startNextHand(game, player);
    }

    return {
        dealCard: nodeUtils.trace(rulesService.name, dealCard),
        dealerTurn: nodeUtils.trace(rulesService.name, dealerTurn),
        double: nodeUtils.trace(rulesService.name, double),
        hit: nodeUtils.trace(rulesService.name, hit),
        resolve: nodeUtils.trace(rulesService.name, resolve),
        split: nodeUtils.trace(rulesService.name, split),
        stand: nodeUtils.trace(rulesService.name, stand),
    };
}

module.exports = rulesService();
