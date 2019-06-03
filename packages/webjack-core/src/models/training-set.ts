import { Card } from './card';

export interface ITrainingSet {
    currentRoundCards: Card[];
    dealerAvailableHands: string[];
    dealerCurrentHand: string;
    playerAvailableHands: string[];
    playerUsedHands: string[];
    progress: number;
}

export class TrainingSet implements ITrainingSet {
    currentRoundCards: Card[];
    dealerCurrentHand: string;
    playerUsedHands: string[];
    progress: number;

    constructor (public dealerAvailableHands: string[], public playerAvailableHands: string[]) {
        this.currentRoundCards = [],
        this.dealerCurrentHand = '',
        this.playerUsedHands = [],
        this.progress = 0
    }
}
