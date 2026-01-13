declare const _default: {
    express: {
        type: string;
        properties: {
            static: {
                type: string;
            };
            port: {
                type: string;
            };
            json: {
                type: string;
                additionalProperties: boolean;
            };
            cors: {
                type: string;
                additionalProperties: boolean;
            };
            socketIo: {
                type: string;
                additionalProperties: boolean;
            };
        };
    };
};
export default _default;
