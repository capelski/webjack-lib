import { IHand } from './hand';

export interface IPlayer {
    earningRate: number;
    hands: IHand[];
    id: string;
    inactiveRounds: number;
    name: string;
}
