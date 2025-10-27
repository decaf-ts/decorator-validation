![Banner](./workdocs/assets/decaf-logo.svg)

# Decorator Validation

A TypeScript decorator-driven validation and model framework. It lets you:
- Define validation rules with declarative decorators on model properties (e.g., @required, @min, @pattern).
- Build, validate, serialize, and hash models with pluggable registries and algorithms.
- Extend validation via a registry of Validator classes and utilities.
- Optionally expose validation as MCP tools for automation workflows.


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

Minimal size: 11.7 KB kb gzipped


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


# How to Use Decorator Validation

This guide shows concrete, TypeScript-accurate examples for the main public APIs exported by the library. Examples are inspired by patterns used across the repo tests and typical usage of decorator-driven validation and models.

Notes
- Import paths assume a consumer importing from the package entry and submodules as re-exported by src/index.ts.
- All snippets are valid TypeScript.


## Model decorators and model lifecycle

### @model()
Description: Marks a class as a model. The constructor is wrapped to bind model utilities and run a global builder (if any).

```typescript
import { model, Model, ModelArg } from "@decaf-ts/decorator-validation";

@model()
class User extends Model {
  @prop()
  id!: string;
  @prop()
  name!: string;
  
  constructor(arg?: ModelArg<User>) {
    super(arg);
  }
}

const u = new User();
```

Extending from the Model class is optional but highly recommended. Regardless, if decorated with `@model()`, the constructor signature must be compatible.

When using a class for validation, eg `hasErrors()` only, @model() is not required.

#### Model construction

When a class is decorated with @model(), the framework invokes a model building function right after the instance is constructed. This builder initializes your model from the argument you pass to the constructor.

There are two builder strategies:
- Model.fromObject: Accepts a plain object and performs a more permissive, best-effort mapping.
    - Does not enforce nested Model classes
- Model.fromModel (default): does the same as fromObject, but also instantiates nested Model classes

Your model constructors should accept an optional argument and pass it to super so the builder can use it.

You can change between builder functions by using:

```typescript
import { required, Model, model, ModelArg } from "@decaf-ts/decorator-validation";

@model()
class Child extends Model {
  @required()
  name!: string;
  
  constructor(arg?: ModelArg<Child>) {
    super(arg);
  }
}

@model()
class Parent extends Model {
  @required()
  name!: string;
  @required()
  child!: Child;
  constructor(arg?: ModelArg<Parent>) {
    super(arg);
  }
}
// Default builder is Model.fromModel

let parent = new Parent({
  child: {
    name: "child"
  }
})

parent.child instanceof Child; // true

Model.setBuilder(Model.fromObject);

parent = new Parent({
  child: {
    name: "child"
  }
})

parent.child instanceof Child; // false
```

### @hashedBy(algorithm, ...args)
Description: Declares which hashing strategy to use when hashing model instances.

```typescript
import { model, hashedBy, ModelArg, prop } from "@decaf-ts/decorator-validation";

@model()
@hashedBy("sha256", "utf8")
class FileInfo extends Model {
  @prop()
  path!: string;
  @prop()
  size!: number;
  
  constructor(arg?: ModelArg<FileInfo>) {
    super(arg)
  }
}
```

### @serializedBy(serializer, ...args)
Description: Declares which serializer to use for (de)serializing model instances.

```typescript
import { prop, ModelArg, model, serializedBy } from "@decaf-ts/decorator-validation";

@model()
@serializedBy("json")
class Settings extends Model {
  @prop()
  theme!: string;
  @prop()
  locale!: string;
  
  constructor(arg?: ModelArg<Settings>){
    super(arg)
  }
}
```

### @description(text)
Description: Applies textual documentation metadata to a class, property, or method.

```typescript
import { model, description, Model } from "@decaf-ts/decorator-validation";

@model()
@description("Represents an application user")
class User extends Model {
  @description("Unique identifier")
  id!: string;
  // ...
}
```


## Validation decorators (property-level)
Each decorator writes metadata for a corresponding Validator. Use them on model fields.


### @prop()
Description: Registers a property with the model system. This is required for model construction so the property participates in metadata, serialization, hashing, validation discovery, etc.

Important
- All other property decorators (e.g., @required, @min, @email, etc.) already apply @prop under the hood.
- Therefore, you only need to use @prop when a property has no other decorators.


### @required(message?)
Description: Field must be present and non-empty.

```typescript
import { Model, required, model } from "@decaf-ts/decorator-validation";

@model()
class User extends Model {
  @required()
  username!: string;
  //...
}
```

### @min(value, message?) and @max(value, message?)
Description: Numeric or date boundaries.

```typescript
import { model } from "@decaf-ts/decorator-validation";
import { min } from "@decaf-ts/decorator-validation";
import { max } from "@decaf-ts/decorator-validation";

@model()
class Product extends Model {
  @min(0)
  @max(1000)
  price!: number;
}
```

### @minLength(n, message?) and @maxLength(n, message?)
Description: String length boundaries.

```typescript
import { model, Model } from "@decaf-ts/decorator-validation";
import { minLength, maxLength } from "@decaf-ts/decorator-validation";

@model()
class Credentials extends Model {
  @minLength(8)
  @maxLength(64)
  password!: string;
}
```

### @pattern(regex | string, message?)
Description: String must match a pattern.

```typescript
import { model } from "@decaf-ts/decorator-validation";
import { pattern, model } from "@decaf-ts/decorator-validation";

@model()
class Vehicle extends Model {
  @pattern(/^[A-Z]{2}-\d{2}-[A-Z]{2}$/)
  plate!: string;
}
```

### @email(message?)
Description: Must be a valid email.

```typescript
import { model } from "@decaf-ts/decorator-validation";
import { email } from "@decaf-ts/decorator-validation";

@model()
class Contact extends Model {
  @email()
  email!: string;
}
```

### @url(message?)
Description: Must be a valid URL.

```typescript
import { model } from "@decaf-ts/decorator-validation";
import { url } from "@decaf-ts/decorator-validation";

@model()
class Link extends Model {
  @url()
  href!: string;
}
```

### @type(T, message?)
Description: Enforces a runtime type match (e.g., Number, String, Date).

```typescript
import { model } from "@decaf-ts/decorator-validation";
import { type } from "@decaf-ts/decorator-validation";

@model()
class Measurement extends Model {
  @type(Number)
  value!: number;
}
```

### @equals(otherValueOrPath, message?)
Description: Value must equal the provided value or another property.

```typescript
import { model } from "@decaf-ts/decorator-validation";
import { equals } from "@decaf-ts/decorator-validation";

@model()
class Confirmation extends Model {
  password!: string;
  @equals(":password")
  confirm!: string;
}
```

### @greaterThan(x) / @greaterThanOrEqual(x) / @lessThan(x) / @lessThanOrEqual(x)
Description: Numeric or date comparisons.

```typescript
import { model } from "@decaf-ts/decorator-validation";
import { greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual } from "@decaf-ts/decorator-validation";

@model()
class Range extends Model {
  @greaterThan(0)
  @lessThanOrEqual(100)
  ratio!: number;
}
```

### @step(step, message?)
Description: Numeric step constraints.

```typescript
import { model, Model } from "@decaf-ts/decorator-validation";
import { step } from "@decaf-ts/decorator-validation";

@model()
class Slider extends Model {
  @step(0.5)
  value!: number;
}
```

### @list(values, message?)
Description: Constrains value to be one of the provided list.

```typescript
import { model, Model } from "@decaf-ts/decorator-validation";
import { list } from "@decaf-ts/decorator-validation";

@model()
class ThemeSettingm extends Model {
  @list(["light", "dark", "system"]) 
  theme!: "light" | "dark" | "system";
}
```

### @diff(propertyPath, message?)
Description: Must be different from another property.

```typescript
import { model, Model } from "@decaf-ts/decorator-validation";
import { diff } from "@decaf-ts/decorator-validation";

@model()
class Credentials extends Model {
  username!: string;
  @diff(":username")
  password!: string;
}
```

### @date({ min?, max? }, message?)
Description: Date constraints for a date-typed field.

```typescript
import { model, Model } from "@decaf-ts/decorator-validation";
import { date } from "@decaf-ts/decorator-validation";

@model()
class Booking extends Model {
  @date({ min: new Date("2025-01-01"), max: new Date("2025-12-31") })
  start!: Date;
}
```

### @password(options?, message?)
Description: Password strength constraints (e.g., min length, uppercase, digits, symbols) depending on validator configuration.

```typescript
import { model } from "@decaf-ts/decorator-validation";
import { password, Model } from "@decaf-ts/decorator-validation";

@model()
class Account extends Model{
  @password({ minLength: 10 })
  password!: string;
}
```

### async()
Description: Marks a model as involving async validation rules (decorator flag helper).

```typescript
import { model } from "@decaf-ts/decorator-validation";
import { async } from "@decaf-ts/decorator-validation";

@model()
@async()
class Signup {
  // fields that may use async validators
}
```


## Running validation
Use the model validation utilities to evaluate rules defined by decorators.

```typescript
import { model, required, email, validate, Model } from "@decaf-ts/decorator-validation";

@model()
class Contact extends Model {
  @required()
  @email()
  email!: string;
  
  constructor(arg?: ModelArg<Contact>) {
    super(arg);
  }
}

const c = new Contact({
  email: "not-an-email"
});

let errs = c.hasErrors(); // resolves to a list of errors or undefined

@async()
@model()
class User extends Model {
  @required()
  @email()
  email!: string;
  
  constructor(arg?: ModelArg<User>) {
    super(arg);
  }
}

const u = new User({
  email: "not-an-email"
})

errs = await u.hasErrors(); // resolves to a list of errors or undefined

```


## Validation registry APIs (Validation)

### Validation.setRegistry(registry, migration?)
Description: Swap the active validator registry and optionally migrate validators.

```typescript
import { Validation, ValidatorRegistry } from "@decaf-ts/decorator-validation";

const custom = new ValidatorRegistry();
Validation.setRegistry(custom, v => v); // trivial migration
```

### Validation.register(...validators)
Description: Register one or more Validator implementations or definitions.

```typescript
import { Validation, Validator, validator } from "@decaf-ts/decorator-validation";

@validator("ALWAYS_OK")
class AlwaysOk extends Validator {
  hasErrors(...args: any[]) { return []; }
}

Validation.register(new AlwaysOk());
```

### Validation.get(key)
Description: Retrieve a registered validator by key.

```typescript
import { Validation, ValidationKeys } from "@decaf-ts/decorator-validation";

const requiredValidator = Validation.get(ValidationKeys.REQUIRED);
```

### Validation.key(k) and Validation.keys()
Description: Build a reflect-metadata key or list all registered keys.

```typescript
import { Validation } from "@decaf-ts/decorator-validation";

const metaKey = Validation.key("REQUIRED");
const allKeys = Validation.keys();
```

## Notes on tests and validity
- Patterns here reflect common test patterns found across the monorepo (e.g., model decoration, decorator application, registry customization).
- Each snippet is valid TypeScript and aligns with the re-exports provided by the package entry.


## Coding Principles

- group similar functionality in folders (analog to namespaces but without any namespace declaration)
- one class per file;
- one interface per file (unless interface is just used as a type);
- group types as other interfaces in a types.ts file per folder;
- group constants or enums in a constants.ts file per folder;
- group decorators in a decorators.ts file per folder;
- always import from the specific file, never from a folder or index file (exceptions for dependencies on other packages);
- prefer the usage of established design patters where applicable:
  - Singleton (can be an anti-pattern. use with care);
  - factory;
  - observer;
  - strategy;
  - builder;
  - etc;


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
