import { Card } from './card';

export interface TrainingSet {
    currentRoundCards: Card[];
    dealerAvailableHands: string[];
    dealerCurrentHand: string;
    playerAvailableHands: string[];
    playerUsedHands: string[];
    progress: number;
}

export class TrainingSet implements TrainingSet {
    constructor (public dealerAvailableHands: string[], public playerAvailableHands: string[]) {
        this.currentRoundCards = [],
        this.dealerCurrentHand = '',
        this.playerUsedHands = [],
        this.progress = 0
    }
}
