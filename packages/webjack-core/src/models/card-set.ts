import { Card } from './card';
import { TrainingSet } from './training-set';

export interface CardSet {
    unusedCards: Card[];
    beingPlayed: Card[];
    discardPile: Card[];
    trainingSet?: TrainingSet;
}

export class CardSet implements CardSet {    
    constructor (cards: Card[], public trainingSet?: TrainingSet) {
        this.unusedCards = cards;
        this.beingPlayed = [];
        this.discardPile = [];
    }
}
