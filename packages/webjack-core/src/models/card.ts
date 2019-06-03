export interface ICard {
    suit: string;
    symbol: string;
}

export class Card implements ICard {
    constructor (public suit: string, public symbol: string) {
    }
}
