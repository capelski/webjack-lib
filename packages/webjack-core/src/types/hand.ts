import { HandStatus } from '../types/hand-status';
import { ICard } from './card';

export interface IHand {
    bet: number;
    cards: ICard[];
    values: number[];
    status: HandStatus;
}
