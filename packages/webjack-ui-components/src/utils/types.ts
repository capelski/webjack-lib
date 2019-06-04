export interface IPlayerActionsHandlers {
    double: () => void;
    hit: () => void;
    stand: () => void;
    split: () => void;
}

export interface IActionsBarHandlers extends IPlayerActionsHandlers {
    exitTable: () => void;
    startRound: () => void;
}

export interface IValueReference<T> {
    value: T;
}

export interface INullableValueReference<T> {
    value?: T;
}