'use strict';

const js = require('../utils/js-generics');
const cardSetService = require('./card-set-service');
const playerSetService = require('./player-set-service');
const rulesService = require('./rules-service');
const handSetService = require('./hand-set-service');
const playerService = require('./player-service');
const handService = require('./hand-service');

const collectPlayedCards = (table) => {
    var playedCards = playerSetService.collectPlayedCards(table.playerSet);
    cardSetService.addPlayedCards(table.cardSet, playedCards);
};

const endRound = (table) => {
    if (!playerSetService.isDealerTurn(table.playerSet)) {
        throw 'Can\'t play dealer round yet!';
    }
    
    var dealer = playerSetService.getDealer(table.playerSet);
    var dealerHand = handSetService.getCurrentHand(dealer.handSet);
    var dealerScore = handService.getScore(dealerHand); // TODO Use score property
    while (dealerScore < 17) {
        dealerScore = handSetService.dealCard(dealer.handSet, cardSetService.getNextCard(table.cardSet));
    }

    js.iterate(table.playerSet.players, (player, key) => {            
        if (player !== playerSetService.getDealer(table.playerSet)) {
            playerService.resolveHands(player, dealerScore);
        }
    });

    playerSetService.endRound(table.playerSet);
};

const ensurePlayer = (playerSet, playerId) => {
    if (playerSet.currentIndex == null) {
        throw 'No round has been started yet!';
    }
    var currentPlayer = playerSet.players[playerSet.currentIndex];
    if (!currentPlayer) {
        throw 'There is no player identified by ' + playerId;
    }
    else if (currentPlayer.id !== playerId) {
        var ensuredPlayer = playerSetService.getPlayerById(playerSet, playerId);
        throw ensuredPlayer.name + ' can\'t play now! It is ' + currentPlayer.name + '\'s turn';
    }
    else if (currentPlayer.id === playerSetService.getDealer(playerSet).id) {
        throw 'Can\'t play dealer\'s turn!';
    }
    else {
        try {
            handSetService.getCurrentHand(currentPlayer.handSet);
            return currentPlayer;
        }
        catch (error) {
            startNextTurn(playerSet);
            throw 'Player ' + currentPlayer.name + ' can\'t play anymore this round!';
        }            
    }        
};

const makeDecision = (table, playerId, action) => {
    var player = ensurePlayer(table.playerSet, playerId);
    switch (action) {
        case 'Double': {
            var playerHand = handSetService.getCurrentHand(player.handSet);
            if (!handService.canDouble(playerHand)) {
                throw 'Doubling is only allowed with 9, 10 or 11 points';
            }
            rulesService.double(player, cardSetService.getNextCard(table.cardSet));
            startNextHand(table, player);
            break;
        }
        case 'Hit': {
            var isBurned = rulesService.hit(player, cardSetService.getNextCard(table.cardSet));
            if (isBurned) {
                startNextHand(table, player);
            }
            break;
        }
        case 'Split': {
            var playerHand = handSetService.getCurrentHand(player.handSet);
            if (!handService.canSplit(playerHand)) {
                throw 'Splitting is only allowed with two equal cards!';
            }
            var isBlackJack = rulesService.split(player, cardSetService.getNextCard(table.cardSet));
            if (isBlackJack) {
                startNextHand(table, player);
            }
            break;
        }
        case 'Stand': {
            rulesService.stand(player);
            startNextHand(table, player);
            break;
        }
    }
};

const startNextHand = (table, player) => {
    var nextHand = handSetService.getNextHand(player.handSet);
    if (nextHand) {
        var handScore = handSetService.dealCard(player.handSet, cardSetService.getNextCard(table.cardSet));
        var playerHand = handSetService.getCurrentHand(player.handSet);
        var isBlackJack = handService.isBlackJack(playerHand);
        if (isBlackJack) {
            startNextHand(table, player);
        }
    }
    else {
        startNextTurn(table.playerSet);
    }
};

const startNextTurn = (playerSet) => {
    var nextPlayer = null;
    while (!nextPlayer && (playerSet.currentIndex < playerSet.players.length - 1)) {            
        nextPlayer = playerSet.players[playerSet.currentIndex];
        if (!handSetService.hasUnplayedHand(nextPlayer.handSet)) {
            nextPlayer = null;
            playerSet.currentIndex++;
        }            
    }
    return nextPlayer;
};

const startRound = (table) => {
    // TODO Exclude dealer from players

    table.playerSet.players.forEach(player => {
        playerService.startRound(player);
        handSetService.dealCard(player.handSet, cardSetService.getNextCard(table.cardSet));
    });

    table.playerSet.players.forEach(player => {
        if (player !== playerSetService.getDealer(table.playerSet)) {
            var handScore = handSetService.dealCard(player.handSet, cardSetService.getNextCard(table.cardSet));
            var playerHand = handSetService.getCurrentHand(player.handSet);
            handService.isBlackJack(playerHand);
        }
    });

    table.playerSet.currentIndex = 0;
    startNextTurn(table.playerSet);
};

module.exports = {
    collectPlayedCards,
    endRound,
    makeDecision,
    startRound
};
