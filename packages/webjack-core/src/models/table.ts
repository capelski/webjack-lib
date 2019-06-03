import { CardSet } from './card-set';
import { Player } from './player';
import { TableStatus } from '../types/table-status';

export interface ITable {
    baseTimestamp: number | undefined;
    cardSet: CardSet;
    dealer: Player
    id: string;
    nextActionTimestamp: number | undefined;
    nextAction: number | undefined;
    players: Player[];
    status: TableStatus;
}

export class Table implements ITable {
    baseTimestamp: number | undefined;
    nextActionTimestamp: number | undefined;
    nextAction: number | undefined;
    players: Player[];
    status: TableStatus;

    constructor (public id: string, public dealer: Player, public cardSet: CardSet) {
        this.baseTimestamp = undefined;
        this.nextActionTimestamp = undefined;
        this.nextAction = undefined;
        this.players = [];
        this.status = TableStatus.Idle;
    }
}
