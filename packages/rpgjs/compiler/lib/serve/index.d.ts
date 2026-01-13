export interface DevOptions {
    host?: string;
    port?: number;
    open?: boolean;
    cors?: boolean;
    loglevel?: string;
    debug?: boolean;
}
export declare function devMode(options?: DevOptions): Promise<void>;
