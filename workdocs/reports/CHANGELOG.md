# Changelog

## v1.22.3

### Fixes

*   **DECAF-809**: `modelBaseDecorator` now re-attaches the most-derived prototype to instances built through the wrapper (via `new.target`) instead of relying on the returned base instance, so `instance.constructor` keeps resolving to the decorated subclass and instance-level metadata reads (`hasErrors`, `validatableProperties`, `segregate`, `prepare`) resolve the same per-model bucket the decorator write path uses; coordinated with `@decaf-ts/decoration` own-property `Metadata.constr` scoping.

## v0.0.5

### New Features

*   **DECAF-206**: Added `DateBuilder`.
