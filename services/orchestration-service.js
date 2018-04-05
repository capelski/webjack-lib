'use strict';

const js = require('../utils/js-generics');
const playerService = require('./player-service');
const handService = require('./hand-service');
const tableService = require('./table-service');

const startRoundTrigger = (table) => {
    tableService.clearTrigger(table);
    tableService.setTrigger(table, 8, () => startRound(table));
};
const makeDecisionTrigger = (table, player) => tableService.setTrigger(table, 8, () => stand(table, player));
const playDealerTurnTrigger = (table) => tableService.setTrigger(table, 2, () => playDealerTurn(table));
const collectPlayedCardsTrigger = (table) => tableService.setTrigger(table, 2, () => tableService.collectPlayedCards(table));

// TODO Access to models properties should be done in the model service
// e.g. table.players.forEach(whatever) => tableService.whatever

const playDealerTurn = (table) => {
    tableService.clearTrigger(table);

    if (table.activePlayerId !== table.dealer.id) {
        throw 'Can\'t play dealer round yet!';
    }
    
    var dealerScore = 0;
    while (dealerScore < 17) {
        dealerScore = playerService.dealCard(table.dealer, tableService.getNextCard(table)).score;
    }

    table.players.forEach(p => playerService.resolveHands(p, dealerScore));
    table.activePlayerId = null;

    collectPlayedCardsTrigger(table);
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

const double = (table, player) => {
    var playerHand = playerService.getCurrentHand(player);
    if (!handService.canDouble(playerHand)) {
        throw 'Doubling is only allowed with 9, 10 or 11 points';
    }

    playerService.doubleCurrentHand(player);
    playerService.dealCard(player, tableService.getNextCard(table));
    handService.markAsPlayed(playerHand);
    startNextHand(table, player);
};

const hit = (table, player) => {
    var handStatus = playerService.dealCard(player, tableService.getNextCard(table));
    if (!handStatus.isHandAlive) {
        startNextHand(table, player);
    }
    else {
        makeDecisionTrigger(table, player);
    }
};

const split = (table, player) => {
    var playerHand = playerService.getCurrentHand(player);
    if (!handService.canSplit(playerHand)) {
        throw 'Splitting is only allowed with two equal cards!';
    }
     
    playerService.splitCurrentHand(player);
    var handStatus = playerService.dealCard(player, tableService.getNextCard(table));
    if (!handStatus.isHandAlive) {
        startNextHand(table, player);
    }
    else {
        makeDecisionTrigger(table, player);
    }
};

const stand = (table, player) => {
    var playerHand = playerService.getCurrentHand(player);
    handService.markAsPlayed(playerHand);
    startNextHand(table, player);
};

const makeDecision = (table, playerId, action) => {
    var player = ensurePlayer(table, playerId);
    tableService.clearTrigger(table);
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
    var player = table.players.find(p => p.id == playerId);
    if (!player) {
        throw 'No player identified by ' + playerId + ' was found';
    }

    // TODO Allow only when round is not started

    playerService.initializeHand(player);
    startRoundTrigger(table);
};

const updateActivePlayer = (table) => {
    var nextPlayer = table.players.find(playerService.hasUnplayedHands);
    if (!nextPlayer) {
        nextPlayer = table.dealer;
        playDealerTurnTrigger(table);
    }
    else {
        makeDecisionTrigger(table, nextPlayer);
    }
    table.activePlayerId = nextPlayer.id;
    
};

const startNextHand = (table, player) => {
    var nextHand = playerService.getCurrentHand(player);
    if (nextHand) {
        var handStatus = playerService.dealCard(player, tableService.getNextCard(table));
        if (!handStatus.isHandAlive) {
            startNextHand(table, player);
        }
        makeDecisionTrigger(table, player);
    }
    else {
        updateActivePlayer(table);
    }
};

const startRound = (table) => {
    tableService.clearTrigger(table);

    var players = table.players.filter(playerService.hasHands);
    if (players.length == 0) {
        throw 'No one has placed a bet yet!';
    }

    players.forEach(p => playerService.dealCard(p, tableService.getNextCard(table)));
    playerService.initializeHand(table.dealer);
    playerService.dealCard(table.dealer, tableService.getNextCard(table));
    players.forEach(p => playerService.dealCard(p, tableService.getNextCard(table)));

    updateActivePlayer(table);
};

module.exports = {
    playDealerTurn,
    makeDecision,
    placeBet,
    startRound
};
