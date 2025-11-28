import { model, Model, ModelArg } from "../../src/model";
import { required, email, minlength, list } from "../../src/validation";
import "../../src/overrides";

@model()
class Address extends Model {
  @required()
  street!: string;

  @required()
  city!: string;

  constructor(arg?: ModelArg<Address>) {
    super(arg);
  }
}

@model()
class User extends Model {
  @required()
  @minlength(3)
  name!: string;

  @required()
  @email()
  email!: string;

  @required()
  address!: Address;

  constructor(arg?: ModelArg<User>) {
    super(arg);
  }
}

@model()
class Post extends Model {
  @required()
  title!: string;

  @list(User)
  authors!: User[];

  constructor(arg?: ModelArg<Post>) {
    super(arg);
  }
}

describe("Model.compare", () => {
  it("should return undefined for identical models", () => {
    const dummy = {
      name: "John Doe",
      email: "john.doe@example.com",
      address: {
        street: "123 Main St",
        city: "Anytown",
      },
    };
    const user1 = new User(dummy);

    const user2 = new User(dummy);

    expect(user1.compare(user2)).toBeUndefined();
  });

  it("should detect differences in top-level properties", () => {
    const user1 = new User({
      name: "John Doe",
      email: "john.doe@example.com",
    });

    const user2 = new User({
      name: "Jane Doe",
      email: "jane.doe@example.com",
    });

    const diff = user1.compare(user2);
    expect(diff).toEqual({
      name: { current: "John Doe", other: "Jane Doe" },
      email: { current: "john.doe@example.com", other: "jane.doe@example.com" },
    });
  });

  it("should detect differences in nested models", () => {
    const user1 = new User({
      name: "John Doe",
      email: "john.doe@example.com",
      address: {
        street: "123 Main St",
        city: "Anytown",
      },
    });

    const user2 = new User({
      name: "John Doe",
      email: "john.doe@example.com",
      address: {
        street: "456 Oak Ave",
        city: "Otherville",
      },
    });

    const diff = user1.compare(user2);
    expect(diff).toEqual({
      address: {
        street: { current: "123 Main St", other: "456 Oak Ave" },
        city: { current: "Anytown", other: "Otherville" },
      },
    });
  });

  it("should return undefined for identical models with lists", () => {
    const post1 = new Post({
      title: "My Post",
      authors: [
        {
          name: "John Doe",
        },
      ],
    });

    const post2 = new Post({
      title: "My Post",
      authors: [
        {
          name: "John Doe",
        },
      ],
    });

    expect(post1.compare(post2)).toBeUndefined();
  });

  it("should detect differences in lists of models", () => {
    const post1 = new Post({
      title: "My Post",
      authors: [
        {
          name: "John Doe",
        },
      ],
    });

    const post2 = new Post({
      title: "My Post",
      authors: [
        {
          name: "Jane Doe",
        },
      ],
    });

    const diff = post1.compare(post2);
    expect(diff).toEqual({
      authors: [
        {
          name: { current: "John Doe", other: "Jane Doe" },
        },
      ],
    });
  });

  it("should detect differences in lists of models with different lengths", () => {
    const post1 = new Post({
      title: "My Post",
      authors: [
        {
          name: "John Doe",
        },
      ],
    });

    const post2 = new Post({
      title: "My Post",
      authors: [
        {
          name: "John Doe",
        },
        {
          name: "Jane Doe",
        },
      ],
    });

    const diff = post1.compare(post2);
    expect(diff).toEqual({
      authors: {
        current: post1.authors,
        other: post2.authors,
      },
    });
  });

  it("should handle null and undefined properties", () => {
    const user1 = new User();
    user1.name = "John Doe";
    user1.email = undefined;

    const user2 = new User();
    user2.name = "John Doe";
    user2.email = null as any;

    const diff = user1.compare(user2);
    expect(diff).toEqual({
      email: { current: undefined, other: null },
    });
  });
});
