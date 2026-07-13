import { glob } from 'glob';

type ModuleName = 'order' | 'inventory';

export const getEntities = async (module: ModuleName): Promise<string[]> => {
    return await glob(`libs/${module}/infrastructure/src/lib/**/entities/*.typeorm-entity.ts`);
};

export const getMigrations = async (module: ModuleName): Promise<string[]> => {
    return await glob(`libs/${module}/infrastructure/src/lib/migrations/*.ts`);
};
