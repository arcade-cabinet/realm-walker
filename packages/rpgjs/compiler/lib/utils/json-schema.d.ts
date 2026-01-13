interface ServerSchema {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
}
interface ClientSchema {
    type: 'object';
    properties: Record<string, unknown>;
}
interface JsonSchema {
    namespace?: string;
    server?: ServerSchema;
    client?: ClientSchema;
    '*': ServerSchema | ClientSchema;
}
interface InputData {
    [key: string]: unknown;
}
interface ParsedData {
    server: Record<string, unknown>;
    client: Record<string, unknown>;
    namespace: string;
    extraProps: string[];
}
export declare function parseJsonSchema(jsonSchema: JsonSchema, inputData: InputData): ParsedData;
export {};
