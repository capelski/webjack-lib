export interface Dictionary<T> {
    [key: string]: T;
}

export interface ClientWebSocketData {
    id: string;
    playerId?: string;
    tableId?: string;
    tableUnsubscribe?: () => void;
    kickOutTimer?: NodeJS.Timeout;
}