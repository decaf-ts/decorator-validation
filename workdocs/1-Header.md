![Banner](./workdocs/assets/decaf-logo.svg)

# Decorator Validation

A TypeScript decorator-driven validation and model framework. It lets you:
- Define validation rules with declarative decorators on model properties (e.g., @required, @min, @pattern).
- Build, validate, serialize, and hash models with pluggable registries and algorithms.
- Extend validation via a registry of Validator classes and utilities.
- Optionally expose validation as MCP tools for automation workflows.

> Release docs refreshed on 2025-11-26. See [workdocs/reports/RELEASE_NOTES.md](./workdocs/reports/RELEASE_NOTES.md) for ticket summaries.

### Core Concepts

*   **`@model()`**: A class decorator that turns a regular class into a validatable model.
*   **Validation Decorators**: A rich set of decorators for defining validation rules on properties (e.g., `@required`, `@email`, `@minLength`).
*   **`Model` Class**: An abstract base class that provides validation, serialization, hashing, and comparison methods.
*   **`Validation` Class**: A static class for managing the validator registry and creating custom validation logic.
*   **Builders and Registries**: Pluggable systems for controlling how models are constructed, serialized, and hashed.
