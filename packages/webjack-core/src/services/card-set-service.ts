import { Card } from '../models/card';
import { CardSet } from '../models/card-set';
import { Hand } from '../models/hand';
import { createDeck } from '../services/card-service';
import { getParameters } from '../services/game-parameters-service';
import { addCard, create } from '../services/hand-service';
import { TrainingState, TrainingHandsSet } from '../types/training-hands';
import { shuffleArray } from '../utils/js-generics';

let developmentCards: Card[];

// TODO Place somehwere else?
const relevantDealerHands = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'Figure'
];

const splittableHands = [
    '2,2',
    '3,3',
    '4,4',
    '5,5', // Not relevant as splittable hand, but still there to train
    '6,6',
    '7,7',
    '8,8',
    '9,9',
    'Figure,Figure', // Not relevant as splittable hand, but still there to train
    'A,A',
];

const softHands = [
    'A,2',
    'A,3',
    'A,4',
    'A,5',
    'A,6',
    'A,7',
    'A,8',
    'A,9',
    // 'A,Figure' -> There is no decision to make since the hand is skipped
];

const hardHands = [
    '+5',
    '+6',
    '+7',
    '+8',
    '+9',
    '+10',
    '+11',
    '+12',
    '+13',
    '+14',
    '+15',
    '+16',
    '+17',
    '+18',
    '+19',
    '+20',
    // '+21' -> There is no decision to make since the hand is skipped
]

const relevantPlayerHands = [
    ...splittableHands,
    ...softHands,
    ...hardHands
];

export const collectPlayedCards = (cardSet: CardSet) => {
    cardSet.discardPile = cardSet.discardPile.concat(cardSet.beingPlayed);
    cardSet.beingPlayed = [];

    const { maxDiscardedCards } = getParameters();
    if (cardSet.discardPile.length > maxDiscardedCards) {
        shuffleArray(cardSet.discardPile);
        cardSet.unusedCards = cardSet.unusedCards.concat(cardSet.discardPile);
        cardSet.discardPile = [];
    }
};

export const createCardSet = (useTrainingHands = false) => {
    const { decksNumber } = getParameters();
    const cards = ' '.repeat(decksNumber)
        .split('')
        .map(_ => createDeck())
        .reduce((x, y) => x.concat(y), []);
    shuffleArray(cards);
    // TODO Pass development cards as parameter
    const cardSet = new CardSet(developmentCards ? developmentCards : cards);

    if (useTrainingHands) {
        cardSet.trainingState = {
            currentRoundCards: [],
            dealerAvailableHands: [...relevantDealerHands],
            dealerCurrentHand: '',
            playerAvailableHands: [...relevantPlayerHands],
            playerUsedHands: [],
            progress: 0
        };
        setNextTrainingRound(cardSet);
    }

    return cardSet;
};

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

export const getNextCard = (cardSet: CardSet) => {
    let cardSource = cardSet.unusedCards;
    if (cardSet.trainingState) {
        if (cardSet.trainingState.currentRoundCards.length === 0) {
            setNextTrainingRound(cardSet);
        }
        cardSource = cardSet.trainingState.currentRoundCards;
    }
    const nextCard = cardSource.splice(0, 1)[0];
    cardSet.beingPlayed.push(nextCard);
    return nextCard;
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

export const setNextTrainingRound = (cardSet: CardSet) => {
    const playersNumber = 7; // When using training hands, there must always be 7 players
    updateDealerHand(playersNumber, cardSet.trainingState!);
    const playerCards = Array(playersNumber).fill(0).map(_ => {
        const symbols = getRandomHandSymbols(cardSet.trainingState!);
        return {
            first: getCardFromCardSet(symbols[0], cardSet),
            second: getCardFromCardSet(symbols[1], cardSet)
        };
    });
    const playersFirstCard = playerCards.map(x => x.first);
    const dealerCard = getCardFromCardSet(
        cardSet.trainingState!.dealerCurrentHand.replace(/Figure/, getFigureSymbol()),
        cardSet);
    const playersSecondCard = playerCards.map(x => x.second);
    cardSet.trainingState!.currentRoundCards = playersFirstCard
        .concat([dealerCard])
        .concat(playersSecondCard);
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

// TODO Remove. Pass as parameter in the constructor
export const useDevelopmentCards = (cards: Card[]) => {
    developmentCards = cards;
};

