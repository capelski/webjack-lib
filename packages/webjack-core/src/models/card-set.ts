import { TrainingState } from '../types/training-hands';
import { Card } from './card';

export interface CardSet {
    unusedCards: Card[];
    beingPlayed: Card[];
    discardPile: Card[];
    trainingState?: TrainingState;
}

export class CardSet implements CardSet {    
    constructor (cards: Card[]) {
        this.unusedCards = cards;
        this.beingPlayed = [];
        this.discardPile = [];
    }
}
