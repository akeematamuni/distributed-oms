import DataSource from './datasource.config';
import { INVENTORY_NODE_SEED } from './inventory-seed.data';
import { InventoryNodeTypeOrmEntity } from '../persistence/entities/inventory-node.typeorm-entity';

/**
 * Reuses the exact connection as data-source.ts (the migration CLI config)
 * so this script and migrations always point at the same database by construction.
 */
async function seed(): Promise<void> {
    await DataSource.initialize();
    console.log('Connected to inventory database.');

    const repository = DataSource.getRepository(InventoryNodeTypeOrmEntity);

    // for (const row of INVENTORY_NODE_SEED) {
    //     const existing = await repository.findOne({
    //         where: { sku: row.sku, nodeId: row.nodeId },
    //     });

    //     if (existing) {
    //         existing.onHand = row.onHand;
    //         await repository.save(existing);
    //         console.log(`Updated ${row.sku} @ ${row.nodeId} -> onHand=${row.onHand}`);
    //         continue;
    //     }

    //     const entity = new InventoryNodeTypeOrmEntity();
    //     entity.id = row.id ?? crypto.randomUUID();
    //     entity.sku = row.sku;
    //     entity.nodeId = row.nodeId;
    //     entity.onHand = row.onHand;

    //     await repository.save(entity);
    //     console.log(`Created ${row.sku} @ ${row.nodeId} -> onHand=${row.onHand}`);
    // }

    const entitiesToUpsert = INVENTORY_NODE_SEED.map((e) => {
        const entity = new InventoryNodeTypeOrmEntity();
        entity.id = e.id ?? crypto.randomUUID();
        entity.sku = e.sku;
        entity.nodeId = e.nodeId;
        entity.onHand = e.onHand;
        entity.reserved = 0;
        entity.reservations = [];
        return entity;
    });

    await repository.upsert(entitiesToUpsert, {
        skipUpdateIfNoValuesChanged: true,
        conflictPaths: ['sku', 'nodeId'],
    });

    console.log('Inventory seeded successfully.');
    await DataSource.destroy();
}

seed().catch((error) => {
    console.error('Inventory seeding failed:', error);
    process.exit(1);
});
