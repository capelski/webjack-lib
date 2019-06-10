export interface IDecisionsSet {
    [key: number]: string;
    until: {
        dealer: (
            limit: number
        ) => {
            then: {
                double: IDecisionsSet;
                hit: IDecisionsSet;
                split: IDecisionsSet;
                stand: IDecisionsSet;
            };
        };
    };
}

export interface IHandDecisionsData {
    symbols: string;
    value: number;
    values: number[];
}

export type DecisionsSetGetter = (decisionsData: IHandDecisionsData) => undefined | IDecisionsSet;

export interface INumberDictionary<T> {
    [key: number]: T;
}

export interface IOptimalDecision {
    action: string;
    description: string;
}
