import { ICardSet } from '../types/card-set';
import { createDeck } from '../services/card-service';
import { getParameters } from '../services/game-parameters-service';
import { shuffleArray } from '../utils/js-generics';
import { createTrainingSet, setNextTrainingRound } from './training-set-service';

// const devCards: ICard[] = [
//     {
//       symbol: '10',
//       suit: '!'
//     },
//     {
//       symbol: '2',
//       suit: '!'
//     },
//     {
//       symbol: '10',
//       suit: '!'
//     },
//     {
//       symbol: 'A',
//       suit: '!'
//     },
//     {
//       symbol: '6',
//       suit: '!'
//     },
//     {
//       symbol: '10',
//       suit: '!'
//     },
//     {
//       symbol: '9',
//       suit: '!'
//     }
// ];

export const collectPlayedCards = (cardSet: ICardSet) => {
    cardSet.discardPile = cardSet.discardPile.concat(cardSet.beingPlayed);
    cardSet.beingPlayed = [];

    const { maxDiscardedCards } = getParameters();
    if (cardSet.discardPile.length > maxDiscardedCards) {
        shuffleArray(cardSet.discardPile);
        cardSet.unusedCards = cardSet.unusedCards.concat(cardSet.discardPile);
        cardSet.discardPile = [];
    }
};

export const createCardSet = (useTrainingSet = false) => {
    const { decksNumber } = getParameters();
    const cards = ' '.repeat(decksNumber)
        .split('')
        .map(_ => createDeck())
        .reduce((x, y) => x.concat(y), []);
    shuffleArray(cards);

    const cardSet: ICardSet = {
        beingPlayed: [],
        discardPile: [],
        trainingSet: useTrainingSet ? createTrainingSet() : undefined,
        unusedCards: cards
        // unusedCards: devCards
    };

    return cardSet;
};

export const getNextCard = (cardSet: ICardSet, isInitialDealing = false) => {
    let cardSource = cardSet.unusedCards;
    if (isInitialDealing && cardSet.trainingSet) {
        if (cardSet.trainingSet.currentRoundCards.length === 0) {
            setNextTrainingRound(cardSet);
        }
        cardSource = cardSet.trainingSet.currentRoundCards;
    }
    const nextCard = cardSource.splice(0, 1)[0];
    cardSet.beingPlayed.push(nextCard);
    return nextCard;
};
