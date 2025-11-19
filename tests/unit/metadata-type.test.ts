import {
  email,
  ExtendedMetadata,
  list,
  min,
  minlength,
  Model,
  ModelArg,
  ModelBuilder,
  password,
  required,
  url,
} from "../../src/index";
import "../../src/overrides";
import { Metadata } from "@decaf-ts/decoration";

describe("metadata type retrieval", () => {
  class ComplexChildClass extends Model {
    @required()
    @minlength(2)
    title!: string;

    constructor(arg?: ModelArg<ComplexChildClass>) {
      super(arg);
    }
  }

  class ComplexTestClass extends Model {
    @required()
    @minlength(2)
    name!: string;

    @required()
    @min(10)
    age!: number;

    @required()
    @email()
    email!: string;

    @required()
    @url()
    webpage!: string;

    @password()
    @required()
    password!: string;

    @list(String)
    numbers!: string[];

    @required()
    child!: ComplexChildClass;

    @list(() => ComplexChildClass)
    @minlength(1)
    @required()
    children: ComplexChildClass[];

    constructor(arg?: ModelArg<ComplexTestClass>) {
      super(arg);
    }
  }

  it("retrieves type metadata for decorated properties", () => {
    const meta = Metadata.get(ComplexTestClass);
    expect(meta).toBeDefined();
  });

  it("Builds the  class from the metadata", () => {
    const meta = Metadata.get(
      ComplexTestClass
    ) as ExtendedMetadata<ComplexTestClass>;
    expect(meta).toBeDefined();

    const Clazz = ModelBuilder.from(meta);

    const payload = {
      name: "John Doe",
      age: 30,
      email: "asdasd@adsdas.com",
      webpage: "https://example.com",
      password: "securePassword123",
      numbers: ["one", "two", "three"],
      child: {
        title: "Child Title",
      },
      children: [{ title: "Child One" }, { title: "Child Two" }],
    };

    const generated = new Clazz(payload);
    const standard = new ComplexTestClass(payload);

    expect(generated).toBeInstanceOf(Model);
    expect(generated).toBeInstanceOf(Clazz);
    expect(generated).toEqual(standard);
  });
});
