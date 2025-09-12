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
