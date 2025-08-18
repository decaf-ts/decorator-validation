import { model, Model, ModelArg, required, type } from "../../src";

describe("type via function", () => {
  it("enforces type via function", () => {
    class Dummy {
      constructor() {}
    }

    @model()
    class TypeFunction extends Model {
      @type(() => Number.name)
      @required()
      prop!: Dummy;

      constructor(arg?: ModelArg<TypeFunction>) {
        super(arg);
      }
    }

    const testModel = new TypeFunction({
      prop: "testset",
    });

    const errs = testModel.hasErrors();
    expect(errs).toBeDefined();

    testModel.prop = 6;

    expect(testModel.hasErrors()).toBeUndefined();
  });

  it("enforces list type via function", () => {});
});
