# The Weaver's Guide (`packages/looms`)

This document describes how the AI "Weaver" generates the soul of the realm.

## The Seed Phrase
The entire realm is derived from a 3-word seed phrase (e.g., "Floating Crystal Sanctuary").
- **First Word**: Physical Structure (Floating -> Sky Islands).
- **Second Word**: Material/Theme (Crystal -> Magic/Technology level).
- **Third Word**: Social Structure (Sanctuary -> Peaceful/Religious).

## The Schema Contract
The Weaver outputs pure JSON adhering to `RealmSchema` in `@realm-walker/shared`.

### Responsibilities
1.  **Strict Typing**: Output must validate against Zod schemas.
2.  **Thematic Consistency**: Names, Descriptions, and Stats must align with the Seed.
3.  **Expansion**: The Weaver fills the "Slots" defined by the Mechanics (e.g., populating the Item Registry).

## Usage
```bash
# Generate a realm
pnpm generate-realm --seed "Frozen-Iron-Dominion"
```
