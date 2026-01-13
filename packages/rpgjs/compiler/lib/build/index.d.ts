export type BuildOptions = {
    runtime?: boolean | string;
    outputFilename?: string;
    outputDir?: string;
};
export declare function buildMode(props: BuildOptions): Promise<void>;
