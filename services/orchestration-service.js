'use strict';

const js = require('../utils/js-generics');
const playerService = require('./player-service');
const handService = require('./hand-service');
const tableService = require('./table-service');

// TODO Control the game time

const double = (table, player) => {
    var playerHand = playerService.getCurrentHand(player);
    if (!handService.canDouble(playerHand)) {
        throw 'Doubling is only allowed with 9, 10 or 11 points';
    }

    playerService.doubleCurrentHand(player);
    var handScore = playerService.dealCard(player, tableService.getNextCard(table));
    var playerHand = playerService.getCurrentHand(player);
    handService.isOverMaxScore(playerHand);
    handService.markAsPlayed(playerHand);
    startNextHand(table, player);
};

const hit = (table, player) => {
    var handScore = playerService.dealCard(player, tableService.getNextCard(table));
    var playerHand = playerService.getCurrentHand(player);
    var isOverMaxScore = handService.isOverMaxScore(playerHand);
    if (isOverMaxScore) {
        handService.markAsPlayed(playerHand);
        startNextHand(table, player);
    }
    return isOverMaxScore;
};

const split = (table, player) => {
    var playerHand = playerService.getCurrentHand(player);
    if (!handService.canSplit(playerHand)) {
        throw 'Splitting is only allowed with two equal cards!';
    }
     
    playerService.splitCurrentHand(player);
    var handScore = playerService.dealCard(player, tableService.getNextCard(table));
    var playerHand = playerService.getCurrentHand(player);
    var isBlackJack = handService.isBlackJack(playerHand);
    if (isBlackJack) {
        handService.markAsPlayed(playerHand);
        startNextHand(table, player);
    }
    return isBlackJack;
};

const stand = (table, player) => {
    var playerHand = playerService.getCurrentHand(player);
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
        dealerScore = playerService.dealCard(dealer, tableService.getNextCard(table));
    }

    table.players.filter(p => p.hands.length > 0)
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

const startNextHand = (table, player) => {
    var nextHand = playerService.getCurrentHand(player);
    if (nextHand) {
        playerService.dealCard(player, tableService.getNextCard(table));
        var playerHand = playerService.getCurrentHand(player);
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
    var players = table.players.filter(p => p.hands.length > 0);
    if (players.length == 0) {
        throw 'No one has placed a bet yet!';
    }

    players.forEach(player => {
        playerService.dealCard(player, tableService.getNextCard(table));
    });

    playerService.initializeHand(table.dealer);
    playerService.dealCard(table.dealer, tableService.getNextCard(table));

    players.forEach(player => {
        var handScore = playerService.dealCard(player, tableService.getNextCard(table));
        var playerHand = playerService.getCurrentHand(player);
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
