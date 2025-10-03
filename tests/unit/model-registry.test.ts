import { model, Model } from "../../src";
import type { ModelArg } from "../../src";

@model()
class TestModel extends Model {
  name?: string;

  constructor(model?: ModelArg<TestModel>) {
    super(model);
  }
}

describe("Model Registry", () => {
  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it("Handles missing arguments properly", () => {
    expect(() =>
      Model.register("random stuff, not a constructor" as unknown as any)
    ).toThrowError(
      "Model registering failed. Missing Class name or constructor"
    );
    expect(() =>
      Model.register(undefined as unknown as any, "some name")
    ).toThrowError(
      "Model registering failed. Missing Class name or constructor"
    );
    expect(() => Model.build({})).toThrowError(
      "Provided obj is not a Model object"
    );
  });

  it("Defines the correct information", () => {
    const tm = new TestModel();

    const serialization = tm.serialize();
    const rebuiltTm = Model.deserialize(serialization);

    expect(tm.equals(rebuiltTm)).toBe(true);
    expect(tm === rebuiltTm).toBe(false);
    expect((tm as any).prototype).toBe(rebuiltTm.prototype);
    expect(Model.getMetadata(tm)).toEqual(TestModel.name);
  });
});
