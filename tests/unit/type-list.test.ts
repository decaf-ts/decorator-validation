import { model, Model, ModelArg, type } from "../../src";

describe("type via function", () => {
  it("enforces type via function", () => {
    class Dummy {
      constructor() {}
    }

    @model()
    class TypeFunction extends Model {
      @type(Number.name)
      prop!: Dummy;

      constructor(arg?: ModelArg<TypeFunction>) {
        super(arg);
      }
    }

    const testModel = new TypeFunction({
      prop: {},
    });

    testModel.prop = "sfdfsdf";
    const errs = testModel.hasErrors();
    expect(errs).toBeDefined();

    testModel.prop = new Dummy();

    expect(testModel.hasErrors()).toBeUndefined();
  });

  it("enforces list type via function", () => {});
});
