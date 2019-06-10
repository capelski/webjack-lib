export enum IOperationOutcome {
    success = 'success',
    error = 'error'
}

export type IOperationResult<T> =
    | {
          outcome: IOperationOutcome.success;
          result: T;
      }
    | {
          error: string;
          outcome: IOperationOutcome.error;
      };
