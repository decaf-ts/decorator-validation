import { uses, Metadata } from "@decaf-ts/decoration";
import {
  min,
  minlength,
  Model,
  model,
  ModelArg,
  required,
  type,
} from "../../src/index";

describe("Flavour Override", () => {
  @uses("ram")
  @model()
  class TestUserMultipleDB extends Model {
    @required()
    id!: number;

    @required()
    @min(18)
    age!: number;

    @required()
    @minlength(5)
    name!: string;

    @required()
    @type([String])
    sex!: "M" | "F";

    constructor(arg?: ModelArg<TestUserMultipleDB>) {
      super(arg);
    }
  }

  it("uses defines flavour", async () => {
    expect(Metadata.flavourOf(TestUserMultipleDB)).toEqual("ram");
  });
  it("overrides flavour", async () => {
    uses("noram")(TestUserMultipleDB);
    expect(Metadata.flavourOf(TestUserMultipleDB)).toEqual("noram");
  });
});
