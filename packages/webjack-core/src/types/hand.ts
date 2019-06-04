import { ICard } from './card';
import { HandStatus } from '../types/hand-status';

export interface IHand {
    bet: number;
    cards: ICard[];
    values: number[];
    status: HandStatus;
}
