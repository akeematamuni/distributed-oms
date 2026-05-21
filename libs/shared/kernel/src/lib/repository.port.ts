export interface RepositoryPort<T> {
    save(aggregate: T): Promise<void>;
    findById(id: string): Promise<T | null>;
    exists(id: string): Promise<boolean>;
}
