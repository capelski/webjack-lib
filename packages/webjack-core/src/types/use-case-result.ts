export interface IUseCaseResult<T = any> {
    ok: boolean;
    error?: string;
    result?: T;
}
