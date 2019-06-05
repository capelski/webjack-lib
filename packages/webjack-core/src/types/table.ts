import { ICardSet } from './card-set';
import { IPlayer } from './player';
import { TableStatus } from '../types/table-status';

export interface ITable {
    baseTimestamp: number | undefined;
    cardSet: ICardSet;
    dealer: IPlayer
    id: string;
    nextActionTimestamp: number | undefined;
    nextAction: number | undefined;
    players: IPlayer[];
    status: TableStatus;
}

export type TableSubscriber = (table: ITable) => void;
