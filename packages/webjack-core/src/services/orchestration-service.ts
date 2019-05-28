import { Hand } from '../models/hand';
import { HandStatus } from '../models/hand-status';
import { Player } from '../models/player';
import { Table } from '../models/table';
import { delay } from '../utils/js-generics';
import blackJackService from './black-jack-service';
import cardSetService from './card-set-service';
import gameParametersService from '../services/game-parameters-service';
import handService from './hand-service';
import playerService from './player-service';
import tableService from './table-service';
import { PlayerActions } from '../types/player-actions';

const endRound = (table: Table) => {
    tableService.clearTrigger(table);
    cardSetService.collectPlayedCards(table.cardSet);
    const players = table.players;
    players.forEach(player => playerService.setHands(player, []));
    playerService.setHands(table.dealer, []);
    tableService.setIsRoundBeingPlayed(table, false);
};

const makeDecision = (table: Table, player: Player, decision: PlayerActions) => {
    tableService.clearTrigger(table);
    try {
        switch (decision) {
            case PlayerActions.Double: {
                blackJackService.doublePlayerHand(player, table.cardSet);
                break;
            }
            case PlayerActions.Hit: {
                blackJackService.hitPlayerHand(player, table.cardSet);
                break;
            }
            case PlayerActions.Split: {
                blackJackService.splitPlayerHand(player, table.cardSet);
                break;
            }
            case PlayerActions.Stand: {
                blackJackService.standPlayerHand(player);
                break;
            }
            default:
                throw 'Action not supported';
        }
        moveRoundForward(table);
    }
    catch (error) {
        // If an error is raised (e.g. doubling when not allowed), we set the trigger again
        setMakeDecisionTrigger(table, player);
        throw error;
    }
};

const moveRoundForward = (table: Table) => {
    const currentPlayer = tableService.getCurrentPlayer(table)!;
    if (tableService.isDealer(table, currentPlayer)) {
        // All players have completed their hands; time to play dealer's turn
        setPlayDealerTurnTrigger(table);
    }
    else {
        const currentHand = playerService.getCurrentHand(currentPlayer)!;

        if (blackJackService.wasHandSplit(currentHand)) {
            blackJackService.dealCard(currentHand, table.cardSet);
        }

        const isHandFinished = updateHandStatus(currentHand);
        if (isHandFinished) {
            moveRoundForward(table);
        }
        else {
            setMakeDecisionTrigger(table, currentPlayer);
        }
    }
};

const playDealerTurn = (table: Table) => {
    tableService.clearTrigger(table);

    const dealer = table.dealer;
    const dealerHand = playerService.getCurrentHand(dealer)!;
    let dealerHandValue = 0; // DRY optimization to get the second card inside the interval

    const dealerInterval = setInterval(() => {
        if (dealerHandValue < 17) {
            blackJackService.dealCard(dealerHand, table.cardSet);
            dealerHandValue = handService.getValue(dealerHand);
        }
        else {
            clearInterval(dealerInterval);
            handService.markAsPlayed(dealerHand);
            const players = table.players;
            updatePlayersEarnings(players, dealerHand);
        
            setEndRoundTrigger(table);
        }
    }, 1000);
};

const setStartRoundTrigger = (table: Table) => {
    tableService.clearTrigger(table);
    tableService.setTrigger(table, 7, () => startRound(table));
};

const setMakeDecisionTrigger = (table: Table, player: Player) =>
    tableService.setTrigger(table, 20, () => {
        blackJackService.standPlayerHand(player);
        moveRoundForward(table);
    });

const setPlayDealerTurnTrigger = (table: Table) =>
    tableService.setTrigger(table, 3, () => playDealerTurn(table));

const setEndRoundTrigger = (table: Table) =>
    tableService.setTrigger(table, 5, () => endRound(table));

const startRound = (table: Table) => {
    tableService.clearTrigger(table);

    updatePlayersInactivity(table);
    const activePlayers = table.players.filter(playerService.hasHands);
    
    tableService.setIsRoundBeingPlayed(table, true);
    
    const playersHand = activePlayers.map(player => playerService.getCurrentHand(player)!);

    const dealer = table.dealer;
    const dealerHand = handService.create(0);
    playerService.setHands(dealer, [dealerHand]);

    const dealFirstCards = playersHand.map(hand => () => {
        blackJackService.dealCard(hand, table.cardSet);
    })
    .concat([() => {
        blackJackService.dealCard(dealerHand, table.cardSet);
    }]);

    const dealSecondCards = playersHand.map(hand => () => {
        blackJackService.dealCard(hand, table.cardSet);
        const isBlackJack = blackJackService.isBlackJack(hand);
        if (isBlackJack) {
            handService.setStatus(hand, HandStatus.BlackJack);
            handService.markAsPlayed(hand);
        }
    });

    const dealCards = dealFirstCards.concat(dealSecondCards);
    dealCards.reduce((reduced, next) => reduced.then(next).then(() => delay(400)), Promise.resolve({}))
        .then(() => moveRoundForward(table));
};

const updateHandStatus = (playerHand: Hand) => {
    const isBlackJack = blackJackService.isBlackJack(playerHand);
    const isBust = blackJackService.isBust(playerHand);
    const isMaxValue = blackJackService.isMaxValue(playerHand);

    if (isBust) {
        handService.setStatus(playerHand, HandStatus.Bust);
    }
    else if (isBlackJack) {
        handService.setStatus(playerHand, HandStatus.BlackJack);
    }
    
    const isHandFinished = isBlackJack || isBust || isMaxValue;
    
    if (isHandFinished) {
        handService.markAsPlayed(playerHand);
    }

    return isHandFinished;
};

const updatePlayersEarnings = (players: Player[], dealerHand: Hand) => {
    players.forEach(player => {
        const playerHands = player.hands;
        const handsEarnings = playerHands.map(hand => {
            const handEarnings = blackJackService.getHandEarnings(hand, dealerHand);
            handService.setBet(hand, 0);
            return handEarnings;
        });
        const earningRate = handsEarnings.reduce((x, y) => x + y, 0);
        playerService.updateEarningRate(player, earningRate);
    });
};

const updatePlayersInactivity = (table: Table) => {
    const players = table.players;
    const activePlayers = players.filter(playerService.hasHands);
    const inactivePlayers = players.filter(p => !playerService.hasHands(p));
    const { maxInactiveRounds } = gameParametersService.getParameters();

    activePlayers.forEach(p => p.inactiveRounds = 0);
    inactivePlayers.forEach(p => {
        playerService.increaseInactiveRounds(p);
        if (p.inactiveRounds > maxInactiveRounds) {
            tableService.removePlayer(table.id, p.id);
        }
    });
};

export {
    makeDecision,
    moveRoundForward,
    setStartRoundTrigger
};

export default {
    makeDecision,
    moveRoundForward,
    setStartRoundTrigger
};
