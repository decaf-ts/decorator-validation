import { model, Model, ModelArg, ModelConstructor, ModelKeys } from "../../src";
import {
  Metadata,
  prop,
  Constructor,
  DecorationKeys,
} from "@decaf-ts/decoration";

@model()
class TestModel extends Model {
  @prop()
  name!: string;

  constructor(model?: ModelArg<TestModel>) {
    super(model);
  }
}

describe("Class Decorators", () => {
  it("should define the anchor property", () => {
    const tm = new TestModel();
    expect(Metadata.constr(TestModel)).toEqual(tm.constructor);
  });

  it("should serialize and deserialize", () => {
    const tm = new TestModel();
    const serialized = tm.serialize();
    const deserialized = Model.deserialize(serialized);
    const tmFromRegistry = Model.build(deserialized);
    expect(tmFromRegistry).toBeDefined();
  });

  it("should get model constructor from registry", () => {
    const Constr = Model.get(TestModel.name) as ModelConstructor<TestModel>;
    expect(Constr).toBeDefined();
    expect(Constr.name).toEqual(TestModel.name);
    expect(new Constr() instanceof Model).toBeTruthy();
  });
});
