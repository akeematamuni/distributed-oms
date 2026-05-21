import { DomainEventBase } from './domain-event.base';

export abstract class AggregateRootBase {
    public readonly id: string;
    private _domainEvents: DomainEventBase[] = [];

    constructor(id: string) {
        this.id = id;
    }

    protected apply(domainEvent: DomainEventBase): void {
        this._domainEvents.push(domainEvent);
    }

    pullDomainEvents(): DomainEventBase[] {
        const events = [...this._domainEvents];
        this._domainEvents = [];
        return events;
    }
}
