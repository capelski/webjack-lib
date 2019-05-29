import { Card } from '../models/card';
import { CardSet } from '../models/card-set';
import { createDeck } from '../services/card-service';
import { getParameters } from '../services/game-parameters-service';
import js from '../utils/js-generics';

let developmentCards: Card[];

export const collectPlayedCards = (cardSet: CardSet) => {
    cardSet.discardPile = cardSet.discardPile.concat(cardSet.beingPlayed);
    cardSet.beingPlayed = [];

    const { maxDiscardedCards } = getParameters();
    if (cardSet.discardPile.length > maxDiscardedCards) {
        js.shuffleArray(cardSet.discardPile);
        cardSet.unusedCards = cardSet.unusedCards.concat(cardSet.discardPile);
        cardSet.discardPile = [];
    }
};

export const createCardSet = () => {
    const { decksNumber } = getParameters();
    const cards = ' '.repeat(decksNumber)
        .split('')
        .map(_ => createDeck())
        .reduce((x, y) => x.concat(y), []);
    js.shuffleArray(cards);

    return new CardSet(developmentCards ? developmentCards : cards);
}

export const getNextCard = (cardSet: CardSet) => {
    const nextCard = cardSet.unusedCards.splice(0, 1)[0];
    cardSet.beingPlayed.push(nextCard);
    return nextCard;
};

export const useDevelopmentCards = (cards: Card[]) => developmentCards = cards;
