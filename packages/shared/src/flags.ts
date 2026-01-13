export const FeatureFlags = {
    // Logic Flags
    USE_GENAI_DRIVER: process.env.USE_GENAI_DRIVER === 'true',
    ENABLE_DEBUG_LOGGING: process.env.ENABLE_DEBUG_LOGGING === 'true',

    // Visual Flags (The "Cart")
    ENABLE_VISUALS: process.env.ENABLE_VISUALS === 'true',
    USE_DIORAMA_RENDERER: true, // Default to true once visuals are enabled

    // Mechanics Flags
    ENABLE_COMBAT: true,
    ENABLE_SURVIVAL: true
} as const;
