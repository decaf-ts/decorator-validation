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
