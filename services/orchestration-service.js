'use strict';

const js = require('../utils/js-generics');
const playerService = require('./player-service');
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
        startNextTurn(table);
    }
};

const startNextTurn = (table) => {
    if (table.activePlayerId == null) {
        table.activePlayerId = table.players[0].id;
    }
    else {
        // TODO Refactor turn code...
        var nextPlayer = null;
        var index = 0;
        while (!nextPlayer && (index < table.players.length)) {
            if (table.players[index].handSet != null &&
                handSetService.hasUnplayedHand(table.players[index].handSet)) {
                nextPlayer = table.players[index];
                table.activePlayerId = nextPlayer.id;
            }
            ++index;
        }
        if (!nextPlayer && handSetService.hasUnplayedHand(table.dealer.handSet)) {
            nextPlayer = table.dealer;
            table.activePlayerId = nextPlayer.id;
        }
    }
};

const startRound = (table) => {
    // TODO Throw if no players
    // TODO Exclude dealer from players

    table.players.forEach(player => {
        playerService.startRound(player);
        handSetService.dealCard(player.handSet, tableService.getNextCard(table));
    });

    playerService.startRound(table.dealer);
    handSetService.dealCard(table.dealer.handSet, tableService.getNextCard(table));

    table.players.forEach(player => {
        var handScore = handSetService.dealCard(player.handSet, tableService.getNextCard(table));
        var playerHand = handSetService.getCurrentHand(player.handSet);
        handService.isBlackJack(playerHand);
    });

    startNextTurn(table);
};

module.exports = {
    endRound,
    makeDecision,
    startRound
};
