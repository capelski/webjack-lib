import { TableStatus } from '../types/table-status';
import { ICardSet } from './card-set';
import { IPlayer } from './player';

export interface ITable {
    baseTimestamp: number | undefined;
    cardSet: ICardSet;
    dealer: IPlayer;
    id: string;
    nextActionTimestamp: number | undefined;
    nextAction: number | undefined;
    players: IPlayer[];
    status: TableStatus;
}

export type TableSubscriber = (table: ITable) => void;
