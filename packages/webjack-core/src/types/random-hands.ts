import { Hand } from '../models/hand';

export interface BasicStrategyRandomState {
    dealerAvailableHands: string[];
    dealerCurrentHand: string;
    playerAvailableHands: string[];
    playerUsedHands: string[];
    progress: number;
}

export interface BasicStrategyHandsSet {
    dealerHand: Hand;
    playersHand: Hand[];
}