'use strict';

const js = require('../utils/js-generics');
const playerService = require('./player-service');
const handService = require('./hand-service');
const handSetService = require('./hand-set-service');
const tableService = require('./table-service');

// TODO Control the game time

const double = (table, player) => {
    var playerHand = handSetService.getCurrentHand(player.handSet);
    if (!handService.canDouble(playerHand)) {
        throw 'Doubling is only allowed with 9, 10 or 11 points';
    }

    handSetService.doubleCurrentHand(player.handSet);
    var handScore = handSetService.dealCard(player.handSet, tableService.getNextCard(table));
    var playerHand = handSetService.getCurrentHand(player.handSet);
    handService.isOverMaxScore(playerHand);
    handService.markAsPlayed(playerHand);
    startNextHand(table, player);
};

const hit = (table, player) => {
    var handScore = handSetService.dealCard(player.handSet, tableService.getNextCard(table));
    var playerHand = handSetService.getCurrentHand(player.handSet);
    var isOverMaxScore = handService.isOverMaxScore(playerHand);
    if (isOverMaxScore) {
        handService.markAsPlayed(playerHand);
        startNextHand(table, player);
    }
    return isOverMaxScore;
};

const split = (table, player) => {
    var playerHand = handSetService.getCurrentHand(player.handSet);
    if (!handService.canSplit(playerHand)) {
        throw 'Splitting is only allowed with two equal cards!';
    }
     
    handSetService.splitCurrentHand(player.handSet);
    var handScore = handSetService.dealCard(player.handSet, tableService.getNextCard(table));
    var playerHand = handSetService.getCurrentHand(player.handSet);
    var isBlackJack = handService.isBlackJack(playerHand);
    if (isBlackJack) {
        handService.markAsPlayed(playerHand);
        startNextHand(table, player);
    }
    return isBlackJack;
};

const stand = (table, player) => {
    var playerHand = handSetService.getCurrentHand(player.handSet);
    handService.markAsPlayed(playerHand);
    startNextHand(table, player);
};

const endRound = (table) => {
    if (table.activePlayerId !== table.dealer.id) {
        throw 'Can\'t play dealer round yet!';
    }
    
    var dealer = table.dealer;
    var dealerScore = 0;
    while (dealerScore < 17) {
        dealerScore = handSetService.dealCard(dealer.handSet, tableService.getNextCard(table));
    }

    table.players.filter(p => p.handSet != null)
        .forEach(p => playerService.resolveHands(p, dealerScore));

    table.activePlayerId = null;
};

const ensurePlayer = (table, playerId) => {
    var currentPlayer = tableService.getActivePlayer(table);
    if (!currentPlayer) {
        throw 'No one is playing now';
    }

    if (table.activePlayerId !== playerId) {
        throw 'Not allowed to play now. It is ' + currentPlayer.name + '\'s turn';
    }

    return currentPlayer;
};

const makeDecision = (table, playerId, action) => {
    var player = ensurePlayer(table, playerId);
    switch (action) {
        case 'Double': {
            double(table, player);
            break;
        }
        case 'Hit': {
            hit(table, player);
            break;
        }
        case 'Split': {
            split(table, player);
            break;
        }
        case 'Stand': {
            stand(table, player);
            break;
        }
    }
};

const placeBet = (table, playerId) => {
    // TODO Allow only when round is not started
    var player = table.players.find(p => p.id == playerId);
    if (!player) {
        throw 'No player identified by ' + playerId + ' was found';
    }

    playerService.initializeHand(player);
};

const updateActivePlayer = (table) => {
    var nextPlayer = table.players.find(p => playerService.hasUnplayedHand(p));
    if (!nextPlayer) {
        nextPlayer = table.dealer;
    }
    table.activePlayerId = nextPlayer.id;
};

// TODO Merge nextHand / nextTurn
const startNextHand = (table, player) => {
    var nextHand = handSetService.getCurrentHand(player.handSet);
    if (nextHand) {
        handSetService.dealCard(player.handSet, tableService.getNextCard(table));
        var playerHand = handSetService.getCurrentHand(player.handSet);
        var isBlackJack = handService.isBlackJack(playerHand);
        if (isBlackJack) {
            handService.markAsPlayed(playerHand);
            startNextHand(table, player);
        }
    }
    else {
        updateActivePlayer(table);
    }
};

const startRound = (table) => {
    var players = table.players.filter(p => p.handSet != null);
    if (players.length == 0) {
        throw 'No one has placed a bet yet!';
    }

    players.forEach(player => {
        handSetService.dealCard(player.handSet, tableService.getNextCard(table));
    });

    playerService.initializeHand(table.dealer);
    handSetService.dealCard(table.dealer.handSet, tableService.getNextCard(table));

    players.forEach(player => {
        var handScore = handSetService.dealCard(player.handSet, tableService.getNextCard(table));
        var playerHand = handSetService.getCurrentHand(player.handSet);
        var isBlackJack = handService.isBlackJack(playerHand);
        if (isBlackJack) {
            handService.markAsPlayed(playerHand);
        }
    });

    updateActivePlayer(table);
};

module.exports = {
    endRound,
    makeDecision,
    placeBet,
    startRound
};
