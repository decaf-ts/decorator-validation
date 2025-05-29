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
