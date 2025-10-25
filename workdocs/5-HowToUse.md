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
