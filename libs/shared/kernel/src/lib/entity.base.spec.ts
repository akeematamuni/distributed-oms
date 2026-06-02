import { EntityBase } from './entity.base';

interface TestEntityProps {
    name: string;
}

class TestEntity extends EntityBase<TestEntityProps> {
    constructor(props: TestEntityProps, id: string) {
        super(props, id);
    }
}

class OtherEntity extends EntityBase<TestEntityProps> {
    constructor(props: TestEntityProps, id: string) {
        super(props, id);
    }
}

describe('EntityBase', () => {
    const validUUID = '5fa24cc8-6dba-48bf-9da3-2daf0476b6ad';
    const anotherUUID = '8665fa9b-78ae-4998-8eef-7edce3aa3426';
    const a = new TestEntity({ name: 'entity-001' }, validUUID);
    const b = new TestEntity({ name: 'entity-002' }, validUUID);
    const c = new TestEntity({ name: 'entity-003' }, anotherUUID);
    const o = new OtherEntity({ name: 'entity-004' }, validUUID);

    it('should expose the id via getter', () => {
        expect(a.id).toBe(validUUID);
    });

    it('should return true for two entities with the same id', () => {
        expect(a.equals(b)).toBe(true);
    });

    it('should return false for two entities with different ids', () => {
        expect(a.equals(c)).toBe(false);
    });

    it('should return false when compared against null', () => {
        expect(a.equals(null as unknown as TestEntity)).toBe(false);
    });

    it('should return false when compared against undefined', () => {
        expect(a.equals(undefined as unknown as TestEntity)).toBe(false);
    });

    it('should return true regardless of subclass type as long as id matches', () => {
        expect(a.equals(o as unknown as TestEntity)).toBe(true);
    });
});
