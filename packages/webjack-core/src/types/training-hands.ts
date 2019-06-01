import { Card } from '../models/card';
import { Hand } from '../models/hand';

// TODO Migrate to model
export interface TrainingState {
    currentRoundCards: Card[];
    dealerAvailableHands: string[];
    dealerCurrentHand: string;
    playerAvailableHands: string[];
    playerUsedHands: string[];
    progress: number;
}

// TODO Remove
export interface TrainingHandsSet {
    dealerHand: Hand;
    playersHand: Hand[];
}