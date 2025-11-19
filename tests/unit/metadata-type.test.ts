import {
  email,
  list,
  min,
  minlength,
  Model,
  ModelArg,
  password,
  required,
  url,
} from "../../src/index";
import { Metadata } from "@decaf-ts/decoration";

describe("metadata type retrieval", () => {
  it("retrieves type metadata for decorated properties", () => {
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

    const meta = Metadata.get(ComplexTestClass);
    expect(meta).toBeDefined();
  });
});
