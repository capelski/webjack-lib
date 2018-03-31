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
    if (!playerSetService.isDealerTurn(table.playerSet)) {
        throw 'Can\'t play dealer round yet!';
    }
    
    var dealer = playerSetService.getDealer(table.playerSet);
    var dealerHand = handSetService.getCurrentHand(dealer.handSet);
    var dealerScore = handService.getScore(dealerHand); // TODO Use score property
    while (dealerScore < 17) {
        dealerScore = handSetService.dealCard(dealer.handSet, tableService.getNextCard(table));
    }

    js.iterate(table.playerSet.players, (player, key) => {            
        if (player !== playerSetService.getDealer(table.playerSet)) {
            playerService.resolveHands(player, dealerScore);
        }
    });
};

const ensurePlayer = (playerSet, playerId) => {
    if (playerSet.activePlayerId == null) {
        throw 'No round has been started yet!';
    }

    var currentPlayer = playerSetService.getActivePlayer(playerSet);

    if (playerSet.activePlayerId !== playerId) {
        throw 'Not allowed to play now. It is ' + currentPlayer.name + '\'s turn';
    }

    // TODO This shouldn't be here..
    if (currentPlayer.id === playerSetService.getDealer(playerSet).id) {
        throw 'Can\'t play dealer\'s turn!';
    }

    try {
        handSetService.getCurrentHand(currentPlayer.handSet);
        return currentPlayer;
    }
    catch (error) {
        startNextTurn(playerSet);
        throw 'Player ' + currentPlayer.name + ' can\'t play anymore this round!';
    }
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
    playerSetService.updateActivePlayer(playerSet);
};

const startRound = (table) => {
    // TODO Throw if no players
    // TODO Exclude dealer from players

    table.playerSet.players.forEach(player => {
        playerService.startRound(player);
        handSetService.dealCard(player.handSet, tableService.getNextCard(table));
    });

    table.playerSet.players.forEach(player => {
        if (player !== playerSetService.getDealer(table.playerSet)) {
            var handScore = handSetService.dealCard(player.handSet, tableService.getNextCard(table));
            var playerHand = handSetService.getCurrentHand(player.handSet);
            handService.isBlackJack(playerHand);
        }
    });

    table.playerSet.activePlayerId = playerSetService.updateActivePlayer(table.playerSet);
    startNextTurn(table.playerSet);
};

module.exports = {
    collectPlayedCards,
    endRound,
    makeDecision,
    startRound
};
