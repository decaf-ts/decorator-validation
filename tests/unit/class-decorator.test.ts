import { model, Model, ModelArg, ModelConstructor, prop } from "../../src";

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
    expect(Model.getMetadata(tm)).toEqual(tm.constructor.name);
  });

  it("should serialize and deserialize", () => {
    const tm = new TestModel();
    const tmFromRegistry = Model.build(Model.deserialize(tm.serialize()));
    expect(tmFromRegistry).toBeDefined();
  });

  it("should get model constructor from registry", () => {
    const Constr = Model.get(TestModel.name) as ModelConstructor<TestModel>;
    expect(Constr).toBeDefined();
    expect(Constr.name).toEqual(TestModel.name);
    expect(new Constr() instanceof Model).toBeTruthy();
  });
});
