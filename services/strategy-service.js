'use strict';

let nodeUtils = require('../utils/node');
let gameService = require('./game-service');
let handService = require('./hand-service');
let playerService = require('./player-service');

function startegyService() {

    function getStrategy(minimumValue, maximumValue, dealerThreshold) {
        return nodeUtils.trace(startegyService.name, function strategy(game, player) {
            var dealerHand = playerService.getCurrentHand(game.playerSet.getDealer());
            var dealerScore = handService.getScore(dealerHand);
            var playerHand = playerService.getCurrentHand(player);            
            var playerScore = handService.getScore(playerHand);

            while (playerScore <= minimumValue ||
            (playerScore <= maximumValue && dealerScore >= dealerThreshold)) {
                gameService.makeDecision(game, player.id, 'Hit');
                playerScore = handService.getScore(playerHand);
            }

            if (playerScore < 22) {
                gameService.makeDecision(game, player.id, 'Stand');
            }
        });
    }

    return {
        getStrategy: nodeUtils.trace(startegyService.name, getStrategy)
    };
}

module.exports = startegyService();
