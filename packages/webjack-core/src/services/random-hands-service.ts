import { TrainingState, TrainingHandsSet } from '../types/training-hands';
import { Card } from '../models/card';
import { CardSet } from '../models/card-set';
import { Hand } from '../models/hand';
import { addCard, create } from '../services/hand-service';

const getCardFromCardSet = (symbol: string, cardSet: CardSet): Card => {
    // We search for the cards in the discardPile first to minimize the game interfering
    let card = getCardFromCollection(symbol, cardSet.discardPile);
    if (!card) {
        card = getCardFromCollection(symbol, cardSet.unusedCards);
    }
    cardSet.beingPlayed.push(card!);
    return card!;
};

const getCardFromCollection = (symbol: string, cards: Card[]): Card | undefined => {
    let targetCard: Card | undefined = undefined;
    // We iterate the cards set from end to beginning to minimize the game interfering
    for (let i = cards.length - 1; i >= 0 ; --i) {
        const card = cards[i];
        if (symbol === card.symbol) {
            targetCard = card;
            cards.splice(i, 1);
            break;
        }
    }
    return targetCard;
};

const getDealerRandomHand = (randomState: TrainingState, cardSet: CardSet): Hand => {    
    const randomDealerCard = getCardFromCardSet(randomState.dealerCurrentHand.replace(/Figure/, getFigureSymbol()), cardSet);
    return getHandFromCards([randomDealerCard]);
};

const getFigureSymbol = (): string => {
    return ['10', 'J', 'Q', 'K'][Math.floor(Math.random() * 3)];
};

const getHandFromCards = (cards: Card[]) => {
    return cards.reduce((hand, card) => {
        addCard(hand, card);
        return hand;
    }, create(1));
};

const getHardHandSymbols = (value: number): string[] => {
    const minValue = Math.max(2, value - 10);
    const maxValue = Math.min(value - minValue, 10);

    const randomNumber = Math.floor(Math.random() * (maxValue - minValue) + minValue);

    const firstCardSymbol = randomNumber === 10 ? getFigureSymbol() : randomNumber.toString();
    const difference = value - randomNumber;
    const secondCardSymbol = difference === 10 ? getFigureSymbol() : difference.toString();

    return [firstCardSymbol, secondCardSymbol];
};

const getPlayersRandomHand = (
    playersNumber: number,
    randomState: TrainingState,
    cardSet: CardSet
): Hand[] => {
    return Array(playersNumber).fill(0).map(_ => {
        const symbols = getRandomHandSymbols(randomState);
        const cards = symbols.map(symbol => getCardFromCardSet(symbol, cardSet));
        return getHandFromCards(cards);
    });
};

const getRandomHandSymbols = (randomState: TrainingState): string[] => {
    let handsSet = randomState.playerAvailableHands.length > 0 ? randomState.playerAvailableHands : randomState.playerUsedHands;

    const randomIndex = Math.floor(Math.random() * (handsSet.length - 1));
    const randomHand = handsSet[randomIndex];
    handsSet.splice(randomIndex, 1);
    randomState.playerUsedHands.push(randomHand);

    let symbols: string[] = [];
    const hardHandMatch = randomHand.match(/^\+(.*)$/);
    if (hardHandMatch) {
        symbols = getHardHandSymbols(parseInt(hardHandMatch[1]));
    }
    else {
        symbols = randomHand.replace(/Figure/, getFigureSymbol()).replace(/Figure/, getFigureSymbol()).split(',');
    }

    if (Math.floor(Math.random() * 100) % 2) {
        symbols = symbols.reverse();
    }

    return symbols;
};

const updateDealerHand = (playersNumber: number, randomState: TrainingState) => {
    let mustUpdateDealerHand = randomState.dealerCurrentHand === '';

    if (randomState.playerAvailableHands.length === 0) {
        randomState.playerAvailableHands = [...relevantPlayerHands];
        randomState.playerUsedHands = [];
        mustUpdateDealerHand = true;
    }

    if (mustUpdateDealerHand) {
        if (randomState.dealerAvailableHands.length === 0) {
            // TODO When tracking the progress, we should mark 100% in this point
            randomState.dealerAvailableHands = [...relevantDealerHands];
        }

        const dealerIndex = Math.floor(Math.random() * (randomState.dealerAvailableHands.length - 1));
        randomState.dealerCurrentHand = randomState.dealerAvailableHands[dealerIndex];
        randomState.dealerAvailableHands.splice(dealerIndex, 1);
    }

    const coveredDealerHands = (relevantDealerHands.length - 1) - randomState.dealerAvailableHands.length;
    const coveredPlayerHands = relevantPlayerHands.length - randomState.playerAvailableHands.length + playersNumber;
    const coveredHands = coveredDealerHands * relevantPlayerHands.length + coveredPlayerHands;
    const totalHands = (relevantDealerHands.length - 1) * relevantPlayerHands.length;
    randomState.progress = Math.min(100, Math.floor(coveredHands * 1000 / totalHands) / 10);
};

export const getRandomHandsSet = (randomState: TrainingState, playersNumber: number, cardSet: CardSet): TrainingHandsSet => {
    updateDealerHand(playersNumber, randomState);
    return {
        playersHand: getPlayersRandomHand(playersNumber, randomState, cardSet),
        dealerHand: getDealerRandomHand(randomState, cardSet)
    };
};
