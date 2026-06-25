export interface InventoryLockPort {
    acquire(key: string, ttlMs: number): Promise<boolean>;
    release(key: string): Promise<void>;
}

export const INVENTORY_LOCK = Symbol('INVENTORY_LOCK');
