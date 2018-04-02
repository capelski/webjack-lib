'use strict';

const js = require('../utils/js-generics');
const playerService = require('./player-service');
const playerSetService = require('./player-set-service');
const handService = require('./hand-service');
const handSetService = require('./hand-set-service');
const tableService = require('./table-service');

// TODO Control the game time

const double = (player, card) => {
    var playerHand = handSetService.getCurrentHand(player.handSet);
    if (!handService.canDouble(playerHand)) {
        throw 'Doubling is only allowed with 9, 10 or 11 points';
    }

    handSetService.doubleCurrentHand(player.handSet);
    var handScore = handSetService.dealCard(player.handSet, card);
    var playerHand = handSetService.getCurrentHand(player.handSet);
    var isOverMaxScore = handService.isOverMaxScore(playerHand);
    if (!isOverMaxScore) {
        handService.setStatus(playerHand, 'Played');
    }
};

const hit = (player, card) => {
    var handScore = handSetService.dealCard(player.handSet, card);
    var playerHand = handSetService.getCurrentHand(player.handSet);
    var isOverMaxScore = handService.isOverMaxScore(playerHand);
    return isOverMaxScore;
};

const split = (player, card) => {
    var playerHand = handSetService.getCurrentHand(player.handSet);
    if (!handService.canSplit(playerHand)) {
        throw 'Splitting is only allowed with two equal cards!';
    }
     
    handSetService.splitCurrentHand(player.handSet);
    var handScore = handSetService.dealCard(player.handSet, card);
    var playerHand = handSetService.getCurrentHand(player.handSet);
    var isBlackJack = handService.isBlackJack(playerHand);
    return isBlackJack;
};

const stand = (player) => {
    var playerHand = handSetService.getCurrentHand(player.handSet);
    handService.setStatus(playerHand, 'Played');
};

const collectPlayedCards = (table) => {
    var playedCards = playerSetService.collectPlayedCards(table.playerSet);
    tableService.addPlayedCards(table, playedCards);
};

const endRound = (table) => {
    if (table.playerSet.activePlayerId !== table.playerSet.dealer.id) {
        throw 'Can\'t play dealer round yet!';
    }
    
    var dealer = table.playerSet.dealer;
    var dealerScore = 0;
    while (dealerScore < 17) {
        dealerScore = handSetService.dealCard(dealer.handSet, tableService.getNextCard(table));
    }

    table.playerSet.players.filter(p => p.handSet != null)
        .forEach(p => playerService.resolveHands(p, dealerScore));

    table.playerSet.activePlayerId = null;
};

const ensurePlayer = (playerSet, playerId) => {
    var currentPlayer = playerSetService.getActivePlayer(playerSet);
    if (!currentPlayer) {
        throw 'No one is playing now';
    }

    if (playerSet.activePlayerId !== playerId) {
        throw 'Not allowed to play now. It is ' + currentPlayer.name + '\'s turn';
    }

    return currentPlayer;
};

const makeDecision = (table, playerId, action) => {
    var player = ensurePlayer(table.playerSet, playerId);
    switch (action) {
        case 'Double': {
            double(player, tableService.getNextCard(table));
            startNextHand(table, player);
            break;
        }
        case 'Hit': {
            var isOverMaxScore = hit(player, tableService.getNextCard(table));
            if (isOverMaxScore) {
                startNextHand(table, player);
            }
            break;
        }
        case 'Split': {
            var isBlackJack = split(player, tableService.getNextCard(table));
            if (isBlackJack) {
                startNextHand(table, player);
            }
            break;
        }
        case 'Stand': {
            stand(player);
            startNextHand(table, player);
            break;
        }
    }
};

const startNextHand = (table, player) => {
    var nextHand = handSetService.getNextHand(player.handSet);
    if (nextHand) {
        var handScore = handSetService.dealCard(player.handSet, tableService.getNextCard(table));
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
    if (playerSet.activePlayerId == null) {
        playerSet.activePlayerId = playerSet.players[0].id;
    }
    else {
        // TODO Refactor turn code...
        var nextPlayer = null;
        var index = 0;
        while (!nextPlayer && (index < playerSet.players.length)) {
            if (playerSet.players[index].handSet != null &&
                handSetService.hasUnplayedHand(playerSet.players[index].handSet)) {
                nextPlayer = playerSet.players[index];
                playerSet.activePlayerId = nextPlayer.id;
            }
            ++index;
        }
        if (!nextPlayer && handSetService.hasUnplayedHand(playerSet.dealer.handSet)) {
            nextPlayer = playerSet.dealer;
            playerSet.activePlayerId = nextPlayer.id;
        }
    }
};

const startRound = (table) => {
    // TODO Throw if no players
    // TODO Exclude dealer from players

    table.playerSet.players.forEach(player => {
        playerService.startRound(player);
        handSetService.dealCard(player.handSet, tableService.getNextCard(table));
    });

    playerService.startRound(table.playerSet.dealer);
    handSetService.dealCard(table.playerSet.dealer.handSet, tableService.getNextCard(table));

    table.playerSet.players.forEach(player => {
        var handScore = handSetService.dealCard(player.handSet, tableService.getNextCard(table));
        var playerHand = handSetService.getCurrentHand(player.handSet);
        handService.isBlackJack(playerHand);
    });

    startNextTurn(table.playerSet);
};

module.exports = {
    collectPlayedCards,
    endRound,
    makeDecision,
    startRound
};
