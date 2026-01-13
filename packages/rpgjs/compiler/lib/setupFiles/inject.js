import { vi } from 'vitest';
const cacheInstances = {};
vi.mock('@rpgjs/common', async () => {
    const common = await vi.importActual('@rpgjs/common');
    return {
        ...common,
        inject: vi.fn().mockImplementation((service, args = []) => {
            console.log(service.name);
            if (cacheInstances[service.name]) {
                return cacheInstances[service.name];
            }
            const instance = new service(...args);
            if (instance['initialize'])
                instance['initialize'](...args);
            cacheInstances[service.name] = instance;
            return instance;
        }),
    };
});
//# sourceMappingURL=inject.js.map