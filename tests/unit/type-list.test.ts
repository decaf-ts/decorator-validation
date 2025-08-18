import {
  list,
  minlength,
  model,
  Model,
  ModelArg,
  required,
  type,
} from "../../src";

describe("type via function", () => {
  it("enforces type via function", () => {
    class Dummy {
      constructor() {}
    }

    @model()
    class ChildClazz {
      @type(() => Number.name)
      @required()
      nestedProp!: Dummy;

      constructor() {}
    }

    @model()
    class TypeFunction extends Model {
      @type(() => Number.name)
      @required()
      prop!: Dummy;

      @required()
      child!: ChildClazz;

      @required()
      @list(ChildClazz)
      @minlength(1)
      list!: ChildClazz[];

      constructor(arg?: ModelArg<TypeFunction>) {
        super(arg);
      }
    }

    const testModel = new TypeFunction({
      prop: "testset",
      child: {
        nestedProp: 6,
      },
      list: [
        {
          nestedProp: 6,
        },
      ],
    });

    const errs = testModel.hasErrors();
    expect(errs).toBeDefined();
    testModel.prop = 6;

    expect(testModel.hasErrors()).toBeUndefined();
  });

  it("enforces list type via function", () => {});
});
