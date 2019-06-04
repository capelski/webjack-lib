import { ICard } from './card';

export interface ITrainingSet {
    currentRoundCards: ICard[];
    dealerAvailableHands: string[];
    dealerCurrentHand: string;
    playerAvailableHands: string[];
    playerUsedHands: string[];
    progress: number;
}
