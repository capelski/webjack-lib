import { IHand } from './hand';

export interface IPlayer {
    earningHistory: number[];
    earningRate: number;
    hands: IHand[];
    id: string;
    inactiveRounds: number;
    name: string;
}
