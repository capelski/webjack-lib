'use strict';

const handService = require('./hand-service');
const handSetService = require('./hand-set-service');
const playerService = require('./player-service');
const playerSetService = require('./player-set-service');

const checkBlackJack = (playerHand) => {
    if (playerHand.score === 21 && playerHand.cards.length === 2) {
        handService.setStatus(playerHand, 'BlackJack');
        return true;
    }
    return false;
};

const checkMaxScore = (playerHand) => {
    if (playerHand.score > 21) {
        handService.setStatus(playerHand, 'Loses');
        return true;
    }
    return false;
};

const dealerTurn = (game, cardGetter) => {
    var dealerHand = playerService.getCurrentHand(playerSetService.getDealer(game.playerSet));
    var dealerScore = handService.getScore(dealerHand);
    while (dealerScore < 17) {
        playerService.dealCard(playerSetService.getDealer(game.playerSet), cardGetter());
        dealerScore = handService.getScore(dealerHand);
    }
    return dealerScore;
};

const double = (game, player, cardGetter) => {
    var playerHand = playerService.getCurrentHand(player);
    if (playerHand.score < 9 || playerHand.score > 11) {
        throw 'Double only allowed with 9, 10 or 11 points';
    }
    handSetService.doubleCurrentHand(player.handSet);        

    var handScore = playerService.dealCard(player,  cardGetter());
    playerHand = playerService.getCurrentHand(player);
    var isBurned = checkMaxScore(playerHand);
    if (!isBurned) {
        handService.setStatus(playerHand, 'Played');
    }    
};

const hit = (game, player, cardGetter) => {
    var handScore = playerService.dealCard(player, cardGetter());
    var playerHand = playerService.getCurrentHand(player);
    var isBurned = checkMaxScore(playerHand);
    return isBurned;
};

const resolve = (player, dealerScore) => {
    player.handSet.hands.forEach((hand) => {
        var status;

        if (hand.score > 21) {
            status = 'Loses';
        }
        else if (hand.score === 21 && hand.cards.length === 2) {
            status = 'BlackJack';
        }
        else if (dealerScore > 21) {
            status = 'Wins';
        }
        else if (hand.score === dealerScore) {
            status = 'Ties';
        }
        else {
            status = hand.score > dealerScore ? 'Wins' : 'Loses';
        }
        handService.setStatus(hand, status);
    });
    playerService.updateEarningRate(player);        
};

const split = (game, player, cardGetter) => {
    var currentHand = handSetService.getCurrentHand(player.handSet);
    if (!handService.isSplitable(currentHand)) {
        throw 'Split only allowed with two equal cards!';
    }
    handSetService.splitCurrentHand(player.handSet);

    var handScore = playerService.dealCard(player, cardGetter());
    var playerHand = playerService.getCurrentHand(player);
    var isBlackJack = checkBlackJack(playerHand);
    return isBlackJack;
};

const stand = (game, player, cardGetter) => {
    var playerHand = playerService.getCurrentHand(player);
    handService.setStatus(playerHand, 'Played');
};

// TODO Receive playerSet instead
const startRound = (game, cardGetter) => {
    // TODO Exclude dealer from players

    game.playerSet.players.forEach(player => {
        playerService.startRound(player);
        playerService.dealCard(player, cardGetter());
    });

    game.playerSet.players.forEach(player => {
        if (player !== playerSetService.getDealer(game.playerSet)) {
            var handScore = playerService.dealCard(player, cardGetter());
            var playerHand = playerService.getCurrentHand(player);
            checkBlackJack(playerHand);
        }
    });
};

module.exports = {
    checkBlackJack,
    dealerTurn,
    double,
    hit,
    resolve,
    split,
    stand,
    startRound
};
