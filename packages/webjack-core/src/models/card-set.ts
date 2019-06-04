import { ICard } from './card';
import { ITrainingSet } from './training-set';

export interface ICardSet {
    unusedCards: ICard[];
    beingPlayed: ICard[];
    discardPile: ICard[];
    trainingSet?: ITrainingSet;
}
