import { Card } from './card';
import { TrainingSet } from './training-set';

export interface ICardSet {
    unusedCards: Card[];
    beingPlayed: Card[];
    discardPile: Card[];
    trainingSet?: TrainingSet;
}

export class CardSet implements ICardSet {
    unusedCards: Card[];
    beingPlayed: Card[];
    discardPile: Card[];

    constructor (cards: Card[], public trainingSet?: TrainingSet) {
        this.unusedCards = cards;
        this.beingPlayed = [];
        this.discardPile = [];
    }
}
