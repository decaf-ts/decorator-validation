import type { ModelArg } from "../../src";
import { model, Model, prop } from "../../src";

@model()
class TestModel extends Model {
  @prop()
  name!: string;

  constructor(model?: ModelArg<TestModel>) {
    super(model);
  }
}

describe("Class Decorators", () => {
  it("Defines the anchor property", () => {
    const tm = new TestModel();
    expect(Model.getMetadata(tm)).toEqual(tm.constructor.name);
  });

  it("Register the model to the registry", () => {
    const tm = new TestModel();
    const tmFromRegistry = Model.build(Model.deserialize(tm.serialize()));
    expect(tmFromRegistry).toBeDefined();
  });
});
