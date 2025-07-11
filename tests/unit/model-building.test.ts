import { min, minlength, Model, model, ModelArg, required } from "../../src";
import { ModelBuilder } from "../../src/model/Builder";

@model()
class TestModelBuilding extends Model {
  @required()
  @minlength(2)
  name!: string;

  @required()
  @min(10)
  age!: number;

  constructor(arg?: ModelArg<TestModelBuilding>) {
    super(arg);
  }
}

describe("Model building", () => {
  it("registers models regularly", () => {
    const m = new TestModelBuilding({ name: "test", age: 9 });
    expect(m.name).toEqual("test");
    expect(m.age).toEqual(9);
    expect(m.hasErrors()).toBeTruthy();
    m.age = 10;
    expect(m.hasErrors()).toBeFalsy();
  });

  it("Builds a class", () => {
    const builder = ModelBuilder.builder;

    const clazz = builder
      .setName(TestModelBuilding.name)
      .string("name")
      .decorate(required(), minlength(2))
      // .number("age")
      // .decorate(
      //   required(),
      //   min(10)
      // )
      .build();

    console.log(clazz);
    const m = new clazz({ name: "test", age: 9 });
    expect(m.name).toEqual("test");
    expect(m.age).toEqual(9);
    expect(m.hasErrors()).toBeTruthy();
    m.age = 10;
    expect(m.hasErrors()).toBeFalsy();
  });
});
