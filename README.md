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

![Licence](https://img.shields.io/github/license/decaf-ts/decorator-validation.svg?style=plastic)
![GitHub language count](https://img.shields.io/github/languages/count/decaf-ts/decorator-validation?style=plastic)
![GitHub top language](https://img.shields.io/github/languages/top/decaf-ts/decorator-validation?style=plastic)

[![Build & Test](https://github.com/decaf-ts/decorator-validation/actions/workflows/nodejs-build-prod.yaml/badge.svg)](https://github.com/decaf-ts/decorator-validation/actions/workflows/nodejs-build-prod.yaml)
[![CodeQL](https://github.com/decaf-ts/decorator-validation/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/decaf-ts/decorator-validation/actions/workflows/codeql-analysis.yml)[![Snyk Analysis](https://github.com/decaf-ts/decorator-validation/actions/workflows/snyk-analysis.yaml/badge.svg)](https://github.com/decaf-ts/decorator-validation/actions/workflows/snyk-analysis.yaml)
[![Pages builder](https://github.com/decaf-ts/decorator-validation/actions/workflows/pages.yaml/badge.svg)](https://github.com/decaf-ts/decorator-validation/actions/workflows/pages.yaml)
[![.github/workflows/release-on-tag.yaml](https://github.com/decaf-ts/decorator-validation/actions/workflows/release-on-tag.yaml/badge.svg?event=release)](https://github.com/decaf-ts/decorator-validation/actions/workflows/release-on-tag.yaml)

![Open Issues](https://img.shields.io/github/issues/decaf-ts/decorator-validation.svg)
![Closed Issues](https://img.shields.io/github/issues-closed/decaf-ts/decorator-validation.svg)
![Pull Requests](https://img.shields.io/github/issues-pr-closed/decaf-ts/decorator-validation.svg)
![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)

![Forks](https://img.shields.io/github/forks/decaf-ts/decorator-validation.svg)
![Stars](https://img.shields.io/github/stars/decaf-ts/decorator-validation.svg)
![Watchers](https://img.shields.io/github/watchers/decaf-ts/decorator-validation.svg)

![Node Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbadges%2Fshields%2Fmaster%2Fpackage.json&label=Node&query=$.engines.node&colorB=blue)
![NPM Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbadges%2Fshields%2Fmaster%2Fpackage.json&label=NPM&query=$.engines.npm&colorB=purple)

Documentation available [here](https://decaf-ts.github.io/decorator-validation/)

Minimal size: 14.4 KB kb gzipped


# Decorator Validation – Detailed Description

Decorator Validation is a TypeScript library that centers on two complementary pillars:

1) Declarative validation via decorators
- A rich set of property decorators such as @required, @min, @max, @minLength, @maxLength, @pattern, @email, @url, @type, @equals, @greaterThan, @greaterThanOrEqual, @lessThan, @lessThanOrEqual, @step, @list, @diff, @date, @password, as well as an async() flag helper.
- Each decorator writes strongly-typed metadata using reflect-metadata and a common Validation metadata keying convention, so validators can later interpret the rules consistently.
- Decorators are defined in src/validation/decorators.ts and are backed by concrete Validator classes in src/validation/Validators/* that implement the actual validation logic.

2) A model system tailored for validation, building, hashing, and serialization
- Models are ordinary classes marked with @model() (src/model/decorators.ts). The decorator replaces the constructor, binds the model prototype utilities, runs a global builder (if registered), and tags reflection metadata for identification.
- Additional class-level decorators configure algorithms:
  - @hashedBy(algorithm, ...args) to define model hashing implementation.
  - @serializedBy(serializer, ...args) to define serialization strategy.
  - @description(text) to attach human-readable documentation to a class, property, or method.
- The Model class (src/model/Model.ts) provides:
  - A ModelRegistryManager for registering and retrieving model constructors by name, enabling rebuild/deserialize flows.
  - Validation integration (model/validation.ts) that runs the registered validators against metadata collected by decorators.
  - Utility methods and metadata helpers to identify models, fetch metadata, compare instances, and orchestrate hashing/serialization strategies.

Core runtime architecture
- Validation namespace (src/validation/Validation.ts):
  - Manages a pluggable IValidatorRegistry so custom Validator implementations can be registered, migrated, and queried.
  - Exposes helper utilities: Validation.key(key) for reflect-metadata keying, Validation.keys() to list available validator keys, register(...) and get(...) to manage validators, decorator registration to link a metadata key to its decorator for dynamic use.
- Validator classes (src/validation/Validators/*):
  - BaseValidator.ts defines common behaviors; concrete validators (RequiredValidator, MinValidator, PatternValidator, etc.) implement validate and message/typing logic.
  - ValidatorRegistry.ts stores Validator instances keyed by ValidationKeys constants.
  - constants.ts defines DEFAULT_ERROR_MESSAGES, DEFAULT_PATTERNS, and ValidationKeys (e.g., REQUIRED, MIN, MAX...).
  - decorators.ts contains decorator sugar for directly registering standard validators and building metadata using Decoration/Reflection utilities.
- Utilities (src/utils/*):
  - strings, dates, types, serialization, hashing, registry, decorators, Decoration helper, and a PathProxy to traverse nested properties and apply metadata.

Intent of the library
- Provide a cohesive, decorator-first developer experience for enforcing validation constraints on model classes.
- Ensure that validation, model lifecycle (build/serialize/hash), and metadata are consistent and extensible through registries.
- Allow advanced composition (custom validators, alternative registries), and integration into automation flows (MCP tools).

Design principles
- Declarative over imperative: Constraints live next to the properties they validate.
- Extensibility: Registries and helper factories allow swapping implementations without changing consumer code.
- Type safety: Metadata and decorators are typed; validators advertise supported types; utility functions use narrow types where practical.
- Separation of concerns: Decorators express intent; Validator classes implement behavior; Model provides lifecycle utilities.


# How to Use

This guide provides examples of how to use the main features of the `@decaf-ts/decorator-validation` library.

## Creating a Model

The `@model()` decorator is the entry point for creating a validatable model.

```typescript
import { model, Model } from '@decaf-ts/decorator-validation';

@model()
class User extends Model {
  // ...
}
```

## Validation Decorators

The library provides a rich set of decorators for defining validation rules on properties.

```typescript
import { model, Model, required, email, minLength } from '@decaf-ts/decorator-validation';

@model()
class User extends Model {
  @required()
  name!: string;

  @required()
  @email()
  email!: string;

  @minLength(8)
  password!: string;
}
```

## Validating a Model

You can validate a model instance using the `hasErrors()` method.

```typescript
const user = new User();
const errors = user.hasErrors();

if (errors) {
  console.log('Validation errors:', errors);
}
```

### Ignoring Properties

You can ignore properties during validation by passing their names to `hasErrors()`.

```typescript
const user = new User();
// Ignore the 'password' property during validation
const errors = user.hasErrors('password');
```

## Serialization and Hashing

The `Model` class provides methods for serializing and hashing instances.

```typescript
const user = new User({ name: 'John Doe', email: 'john.doe@example.com' });

const serializedUser = user.serialize();
const userHash = user.hash();
```

## Model Construction

The library provides a flexible system for constructing model instances.

```typescript
import { Model } from '@decaf-ts/decorator-validation';

// Create a new instance
const user1 = new User({ name: 'Jane Doe' });

// Create an instance from a plain object
const user2 = Model.build({
  [Model.ANCHOR]: 'User',
  name: 'John Smith',
  email: 'john.smith@example.com'
});
```

## Custom Validators

You can create custom validators by extending the `Validator` class and registering them with the `Validation` class.

```typescript
import { Validator, Validation, metadata } from '@decaf-ts/decorator-validation';

// 1. Create a custom validator
class MyCustomValidator extends Validator {
  constructor() {
    super('my-custom-validator', 'Invalid value');
  }

  validate(value: any): boolean {
    // Custom validation logic
    return value === 'valid';
  }
}

// 2. Register the validator
Validation.register(new MyCustomValidator());

// 3. Create a decorator for the validator
function myCustom() {
  return metadata(Validation.key('my-custom-validator'), {});
}

// 4. Use the decorator
@model()
class MyModel extends Model {
  @myCustom()
  myProp: string;
}
```

## Date Operations

The library includes a `DateBuilder` for creating and manipulating dates.

```typescript
import { DateBuilder } from '@decaf-ts/decorator-validation';

const date = new DateBuilder().addDays(5).build();
```


### Related

[![decaf-ts](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=decaf-ts)](https://github.com/decaf-ts/decaf-ts)
[![Reflection](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=reflection)](https://github.com/decaf-ts/reflection)

### Social

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/TiagoVenceslau/)

#### Languages

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![ShellScript](https://img.shields.io/badge/Shell_Script-121011?style=for-the-badge&logo=gnu-bash&logoColor=white)

## Getting help

If you have bug reports, questions or suggestions please [create a new issue](https://github.com/decaf-ts/ts-workspace/issues/new/choose).

## Contributing

I am grateful for any contributions made to this project. Please read [this](./workdocs/98-Contributing.md) to get started.

## Supporting

The first and easiest way you can support it is by [Contributing](./workdocs/98-Contributing.md). Even just finding a typo in the documentation is important.

Financial support is always welcome and helps keep both me and the project alive and healthy.

So if you can, if this project in any way. either by learning something or simply by helping you save precious time, please consider donating.

## License

This project is released under the [MIT License](./LICENSE.md).

By developers, for developers...
