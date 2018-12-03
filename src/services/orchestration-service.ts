import { Player } from '../models/player';
import { Table } from '../models/table';
import blackJackService from './black-jack-service';
import playerService from './player-service';
import handService from './hand-service';
import tableService from './table-service';
const gameParameters = require('../../game-parameters');

const startRoundTrigger = (table: Table) => {
    tableService.clearTrigger(table);
    tableService.setTrigger(table, 7, () => startRound(table));
};
const makeDecisionTrigger = (table: Table, player: Player) =>
    tableService.setTrigger(table, 20, () => stand(table, player));
const playDealerTurnTrigger = (table: Table) =>
    tableService.setTrigger(table, 3, () => playDealerTurn(table));
const endRoundTrigger = (table: Table) =>
tableService.setTrigger(table, 5, () => tableService.endRound(table));

// TODO Access to models properties should be done in the model service
// e.g. table.players.forEach(whatever) => tableService.whatever

const playDealerTurn = (table: Table) => {
    tableService.clearTrigger(table);

    if (table.activePlayerId !== table.dealer.id) {
        throw 'Can\'t play dealer round yet!';
    }

    playerService.dealCard(table.dealer, tableService.getNextCard(table));
    let dealerScore = playerService.getCurrentHandScore(table.dealer);
    const dealerInterval = setInterval(() => {
        if (dealerScore >= 17) {
            clearInterval(dealerInterval);

            table.players.forEach(p => playerService.resolveHands(p, dealerScore));
            table.activePlayerId = null;
        
            endRoundTrigger(table);
        }
        else {
            playerService.dealCard(table.dealer, tableService.getNextCard(table));
            dealerScore = playerService.getCurrentHandScore(table.dealer);
        }
    }, 1000);
};

const ensurePlayer = (table: Table, playerId: string) => {
    const currentPlayer = tableService.getActivePlayer(table);
    if (!currentPlayer) {
        throw 'No one is playing now';
    }

    if (table.activePlayerId !== playerId) {
        throw 'Not allowed to play now. It is ' + currentPlayer.name + '\'s turn';
    }

    return currentPlayer;
};

const double = (table: Table, player: Player) => {
    var playerHand = playerService.getCurrentHand(player);
    if (!handService.canDouble(playerHand)) {
        throw 'Doubling is only allowed with 9, 10 or 11 points';
    }

    const bet = playerService.getCurrentHandBet(player);
    playerService.setCurrentHandBet(player, bet * 2);
    playerService.dealCard(player, tableService.getNextCard(table));
    handService.markAsPlayed(playerHand);
    startNextHand(table, player);
};

const hit = (table: Table, player: Player) => {
    var playerHand = playerService.getCurrentHand(player);
    playerService.dealCard(player, tableService.getNextCard(table));
    // TODO Code repetition
    const handMetrics = handService.getHandMetrics(playerHand);
    if (handMetrics.isBlackJack || handMetrics.isMaxScore || handMetrics.isBurned) {
        handService.setHandStatus(playerHand, handMetrics);
        startNextHand(table, player);
    }
    else {
        makeDecisionTrigger(table, player);
    }
};

const split = (table: Table, player: Player) => {
    var playerHand = playerService.getCurrentHand(player);
    if (!handService.canSplit(playerHand)) {
        throw 'Splitting is only allowed with two equal cards!';
    }
     
    blackJackService.splitPlayerCurrentHand(player);
    playerService.dealCard(player, tableService.getNextCard(table));
    const handMetrics = handService.getHandMetrics(playerHand);
    if (handMetrics.isBlackJack || handMetrics.isMaxScore || handMetrics.isBurned) {
        handService.setHandStatus(playerHand, handMetrics);
        startNextHand(table, player);
    }
    else {
        makeDecisionTrigger(table, player);
    }
};

const stand = (table: Table, player: Player) => {
    var playerHand = playerService.getCurrentHand(player);
    handService.markAsPlayed(playerHand);
    startNextHand(table, player);
};

const _makeDecision = (table: Table, player: Player, decision: string) => {
    tableService.clearTrigger(table);
    try {
        switch (decision) {
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
            default:
                throw 'Action not supported';
        }
    }
    catch (error) {
        // If an error is raised (e.g. doubling when not allowed), we set the trigger again
        makeDecisionTrigger(table, player);
        throw error;
    }
};

const makeDecision = (table: Table, playerId: string, decision: string) => {
    const player = ensurePlayer(table, playerId);
    _makeDecision(table, player, decision)
};

const makeVirtualDecision = (table: Table, decision: string) => {
    const currentPlayer = tableService.getActivePlayer(table);
    _makeDecision(table, currentPlayer, decision);
};

const placeBet = (table: Table, playerId: string, bet: number) => {
    const player = table.players.find(p => p.id == playerId);
    if (!player) {
        throw 'No player identified by ' + playerId + ' was found';
    }

    if (tableService.isRoundBeingPlayed(table)) {
        throw 'Bets can only be placed before a round starts';
    }

    playerService.initializeHand(player, bet);
    if (!tableService.hasTrigger(table)) {
        startRoundTrigger(table);
    }
};

const updateActivePlayer = (table: Table) => {
    let nextPlayer = table.players.find(playerService.hasUnplayedHands);
    if (!nextPlayer) {
        nextPlayer = table.dealer;
        playDealerTurnTrigger(table);
    }
    else {
        makeDecisionTrigger(table, nextPlayer);
    }
    table.activePlayerId = nextPlayer.id;
};

const startNextHand = (table: Table, player: Player) => {
    const nextHand = playerService.getCurrentHand(player);
    if (nextHand) {
        playerService.dealCard(player, tableService.getNextCard(table));
        const handMetrics = handService.getHandMetrics(nextHand);
        if (handMetrics.isBlackJack || handMetrics.isMaxScore || handMetrics.isBurned) {
            handService.setHandStatus(nextHand, handMetrics);
            startNextHand(table, player);
        }
        makeDecisionTrigger(table, player);
    }
    else {
        updateActivePlayer(table);
    }
};

const startRound = (table: Table) => {
    tableService.clearTrigger(table);

    var activePlayers = table.players.filter(playerService.hasHands);
    var inactivePlayers = table.players.filter(p => !playerService.hasHands(p));

    if (activePlayers.length == 0) {
        throw 'No one has placed a bet yet!';
    }

    activePlayers.forEach(p => p.inactiveRounds = 0);
    inactivePlayers.forEach(p => {
        playerService.increaseInactiveRounds(p);
        if (p.inactiveRounds > gameParameters.maxInactiveRounds) {
            tableService.exitTable(table.id, p.id);
        }
    });

    tableService.setRoundBeingPlayed(table, true);

    activePlayers.forEach(p => playerService.dealCard(p, tableService.getNextCard(table)));
    playerService.initializeHand(table.dealer);
    playerService.dealCard(table.dealer, tableService.getNextCard(table));
    activePlayers.forEach(p => playerService.dealCard(p, tableService.getNextCard(table)));

    updateActivePlayer(table);
};

export {
    playDealerTurn,
    makeDecision,
    makeVirtualDecision,
    placeBet,
    startRound
};

export default {
    playDealerTurn,
    makeDecision,
    makeVirtualDecision,
    placeBet,
    startRound
};
