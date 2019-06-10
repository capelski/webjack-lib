export interface IDictionary<T> {
    [key: string]: T;
}

export interface IClientWebSocketData {
    id: string;
    playerId?: string;
    tableId?: string;
    tableUnsubscribe?: () => void;
    kickOutTimer?: NodeJS.Timeout;
}
