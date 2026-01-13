import { ViteNodeServer } from 'vite-node/server';
import { ViteNodeRunner } from 'vite-node/client';
export declare function runServer(): Promise<{
    server: import("vite").ViteDevServer;
    node: ViteNodeServer;
    runner: ViteNodeRunner;
    files: string[];
}>;
