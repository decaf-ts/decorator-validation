![Banner](./workdocs/assets/Banner.png)
## Simple Decorator based Model Validation Engine

A comprehensive TypeScript library that provides a powerful model validation framework using decorators. It enables type-safe, declarative validation for your TypeScript models with features for serialization, comparison, and hashing. The library offers a rich set of validation decorators for various data types and constraints, making it easy to define and enforce validation rules on your model properties.


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

### Description

The decorator-validation library is a comprehensive TypeScript implementation of a decorator-based validation system. It provides a robust framework for defining, validating, and managing model objects in TypeScript applications.

Meant to be easily extended, customized, and integrated with browser input validation mechanisms, this library offers a declarative approach to validation through TypeScript decorators.

#### Core Components

##### Model System
The library is built around the abstract `Model` class, which serves as the foundation for all model objects. The Model system provides:

- A registry mechanism for storing and retrieving model constructors
- Serialization and deserialization capabilities
- Hashing functionality for model objects
- Equality comparison between model objects
- Support for nested model instantiation and validation

##### Validation Framework
The validation framework offers a rich set of decorators for validating model properties:

- **Basic Validation**: `required()`, `min()`, `max()`, `step()`, `minlength()`, `maxlength()`, `pattern()`
- **Type-Specific Validation**: `email()`, `url()`, `type()`, `date()`, `password()`, `list()`, `set()`
- **Comparison Validation**: `eq()`, `diff()`, `lt()`, `lte()`, `gt()`, `gte()` for comparing properties

##### Key Features
- **Decorator-based validation API** with recursive validation for nested models
- **Customizable Model building factories** enabling nested instantiation
- **Model serialization/deserialization** with configurable serializers
- **Model Hashing** with configurable algorithms
- **Model Equality** comparison with support for excluding properties
- **Easily extended custom validation** through the decorator system
- **Java-like date handling** (format and serialization)
- **Configurable error messages** for all validation rules
- **Comparative validation** between attributes, supporting various comparison operators
- **Type safety** through TypeScript's static typing system

The library is designed with extensibility in mind, allowing developers to create custom validators and decorators to meet specific application requirements. It integrates seamlessly with TypeScript's type system to provide compile-time type checking alongside runtime validation.


### How to Use

- [Initial Setup](./workdocs/tutorials/For%20Developers.md#_initial-setup_)
- [Installation](./workdocs/tutorials/For%20Developers.md#installation)

### Examples

#### Creating a Model Class

```typescript
import { Model, model, required, email, minlength, maxlength, min, hashedBy, serializedBy } from 'decorator-validation';

@model()
@hashedBy('sha256')
@serializedBy('json')
class User extends Model {
  @required()
  @minlength(3)
  @maxlength(50)
  username!: string;

  @required()
  @email()
  email!: string;

  @required()
  @min(18, "User must be at least 18 years old")
  age!: number;

  constructor(data?: any) {
    super(data);
    Model.fromModel(this, data);
  }
}
```

#### Basic Validation

```typescript
// Create a user with invalid data
const invalidUser = new User({
  username: "jo", // too short
  email: "not-an-email",
  age: 16 // below minimum
});

// Check for validation errors
const errors = invalidUser.hasErrors();
console.log(errors);
// Output will contain validation errors for username, email, and age

// Create a valid user
const validUser = new User({
  username: "john_doe",
  email: "john@example.com",
  age: 25
});

// Check for validation errors
const validErrors = validUser.hasErrors();
console.log(validErrors); // undefined - no errors
```

#### Using Different Validation Decorators

##### Numeric Validation

```typescript
class Product {
  @required()
  name!: string;

  @required()
  @min(0, "Price cannot be negative")
  @max(10000, "Price cannot exceed 10,000")
  @step(0.01, "Price must have at most 2 decimal places")
  price!: number;

  constructor(data?: any) {
    Model.fromModel(this, data);
  }
}
```

##### String Validation

```typescript
class Article {
  @required()
  @minlength(5)
  @maxlength(100)
  title!: string;

  @required()
  @minlength(50)
  @maxlength(5000)
  content!: string;

  @pattern(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
  slug!: string;

  constructor(data?: any) {
    Model.fromModel(this, data);
  }
}
```

##### Special Types Validation

```typescript
class Contact {
  @required()
  name!: string;

  @required()
  @email()
  email!: string;

  @url()
  website?: string;

  @date("yyyy-MM-dd")
  birthdate?: Date;

  @password()
  password!: string;

  constructor(data?: any) {
    Model.fromModel(this, data);
  }
}
```

##### Comparison Validation

```typescript
class DateRange {
  @required()
  @date("yyyy-MM-dd")
  startDate!: Date;

  @required()
  @date("yyyy-MM-dd")
  @gt("startDate", "End date must be after start date")
  endDate!: Date;

  constructor(data?: any) {
    Model.fromModel(this, data);
  }
}

class PriceRange {
  @required()
  @min(0)
  minPrice!: number;

  @required()
  @min(0)
  @gte("minPrice", "Maximum price must be greater than or equal to minimum price")
  maxPrice!: number;

  constructor(data?: any) {
    Model.fromModel(this, data);
  }
}
```

##### Collection Validation

```typescript
class Tag {
  @required()
  name!: string;

  constructor(data?: any) {
    Model.fromModel(this, data);
  }
}

class BlogPost {
  @required()
  title!: string;

  @required()
  content!: string;

  @list(Tag)
  tags!: Tag[];

  @set(Tag)
  uniqueTags!: Set<Tag>;

  constructor(data?: any) {
    Model.fromModel(this, data);
  }
}
```

#### Model Registry and Building

```typescript
// Register models
Model.register(User);
Model.register(BlogPost);
Model.register(Tag);

// Build a model from plain object
const userData = {
  username: "jane_doe",
  email: "jane@example.com",
  age: 28
};

const user = Model.build(userData, "User");

// Bulk register models
bulkModelRegister(User, BlogPost, Tag);
```

#### Serialization and Deserialization

```typescript
// Create a user
const user = new User({
  username: "john_doe",
  email: "john@example.com",
  age: 25
});

// Serialize to string
const serialized = user.serialize();
console.log(serialized);
// Output: JSON string representation of the user

// Deserialize from string
const deserialized = Model.deserialize(serialized);
console.log(deserialized);
// Output: User object with the same properties
```

#### Comparing Models

```typescript
const user1 = new User({
  username: "john_doe",
  email: "john@example.com",
  age: 25
});

const user2 = new User({
  username: "john_doe",
  email: "john@example.com",
  age: 25
});

const user3 = new User({
  username: "jane_doe",
  email: "jane@example.com",
  age: 28
});

console.log(user1.equals(user2)); // true - same properties
console.log(user1.equals(user3)); // false - different properties

// Compare ignoring specific properties
console.log(user1.equals(user3, "username", "email")); // true - only comparing age
```

#### Hashing Models

```typescript
const user = new User({
  username: "john_doe",
  email: "john@example.com",
  age: 25
});

// Get hash of the model
const hash = user.hash();
console.log(hash);
// Output: Hash string based on the configured algorithm (sha256)
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