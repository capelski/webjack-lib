import { Hand } from '../models/hand';

export interface TrainingRandomState {
    dealerAvailableHands: string[];
    dealerCurrentHand: string;
    playerAvailableHands: string[];
    playerUsedHands: string[];
    progress: number;
}

export interface TrainingHandsSet {
    dealerHand: Hand;
    playersHand: Hand[];
}