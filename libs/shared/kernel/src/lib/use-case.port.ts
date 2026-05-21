export interface UseCasePort<TRequest, TResponse> {
    execute(request: TRequest): Promise<TResponse>;
}
