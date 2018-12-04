import { Player } from '../models/player';
import { Table } from '../models/table';
import blackJackService from './black-jack-service';
import playerService from './player-service';
import handService from './hand-service';
import tableService from './table-service';
import { Hand } from '../models/hand';
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

    const dealerHand = playerService.getCurrentHand(table.dealer);
    handService.addCard(dealerHand, tableService.getNextCard(table));
    let dealerHandValue = handService.getValue(dealerHand);
    const dealerInterval = setInterval(() => {
        if (dealerHandValue >= 17) {
            clearInterval(dealerInterval);

            table.players.forEach(p => playerService.resolveHands(p, dealerHandValue));
            table.activePlayerId = null;
        
            endRoundTrigger(table);
        }
        else {
            handService.addCard(dealerHand, tableService.getNextCard(table));
            dealerHandValue = handService.getValue(dealerHand);
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
    const playerHand = playerService.getCurrentHand(player);

    if (!handService.canDouble(playerHand)) {
        throw 'Doubling is only allowed with 9, 10 or 11 points';
    }

    const bet = playerService.getCurrentHandBet(player);
    playerService.setCurrentHandBet(player, bet * 2);
    handService.addCard(playerHand, tableService.getNextCard(table));
    handService.markAsPlayed(playerHand);
    startNextHand(table, player);
};

const updateHandStatus = (table: Table, player: Player, playerHand: Hand) => {
    const isBlackJack = blackJackService.isBlackJack(playerHand);
    const isBurned = blackJackService.isBurned(playerHand);
    const isMaxScore = blackJackService.isMaxScore(playerHand);

    if (isBurned) {
        handService.setStatus(playerHand, 'Burned');
    }
    else if (isBlackJack) {
        handService.setStatus(playerHand, 'BlackJack!');
    }
    
    const isHandFinished = isBlackJack || isBurned || isMaxScore;
    
    if (isHandFinished) {
        handService.markAsPlayed(playerHand);
        startNextHand(table, player);
    }
    else {
        makeDecisionTrigger(table, player);
    }
}

const hit = (table: Table, player: Player) => {
    const playerHand = playerService.getCurrentHand(player);
    handService.addCard(playerHand, tableService.getNextCard(table));
    updateHandStatus(table, player, playerHand);
};

const split = (table: Table, player: Player) => {
    const playerHand = playerService.getCurrentHand(player);

    if (!handService.canSplit(playerHand)) {
        throw 'Splitting is only allowed with two equal cards!';
    }
     
    blackJackService.splitPlayerCurrentHand(player);
    handService.addCard(playerHand, tableService.getNextCard(table));
    updateHandStatus(table, player, playerHand);
};

const stand = (table: Table, player: Player) => {
    const playerHand = playerService.getCurrentHand(player);
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
    const playerHand = playerService.getCurrentHand(player);
    if (playerHand) {
        handService.addCard(playerHand, tableService.getNextCard(table));
        updateHandStatus(table, player, playerHand);
    }
    else {
        updateActivePlayer(table);
    }
};

const startRound = (table: Table) => {
    tableService.clearTrigger(table);

    const activePlayers = table.players.filter(playerService.hasHands);
    const inactivePlayers = table.players.filter(p => !playerService.hasHands(p));

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

    const playersHand = activePlayers.map(playerService.getCurrentHand);
    playerService.initializeHand(table.dealer);
    const dealerHand =  playerService.getCurrentHand(table.dealer);
    
    playersHand.forEach(hand => handService.addCard(hand, tableService.getNextCard(table)));
    handService.addCard(dealerHand, tableService.getNextCard(table));
    playersHand.forEach(hand => handService.addCard(hand, tableService.getNextCard(table)));

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
