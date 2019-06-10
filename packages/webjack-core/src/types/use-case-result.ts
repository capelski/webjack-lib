export interface UseCaseResult<T = any> {
    ok: boolean;
    error?: string;
    result?: T;
}
