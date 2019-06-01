import { Card } from '../models/card';

// TODO Migrate to model
export interface TrainingHands {
    currentRoundCards: Card[];
    dealerAvailableHands: string[];
    dealerCurrentHand: string;
    playerAvailableHands: string[];
    playerUsedHands: string[];
    progress: number;
}