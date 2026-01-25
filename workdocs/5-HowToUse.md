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
