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
  class Dummy {
    constructor() {}
  }
  it("enforces type via function", () => {
    @model()
    class TypeFunction extends Model {
      @type(() => Number)
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

  it("enforces type via function in a list", () => {
    @model()
    class ChildClazz {
      @type(() => Number)
      @required()
      nestedProp!: Dummy;

      constructor() {}
    }

    @model()
    class TypeListFunction extends Model {
      @required()
      child!: ChildClazz;

      @required()
      @list(() => ChildClazz)
      @minlength(1)
      list!: ChildClazz[];

      constructor(arg?: ModelArg<TypeListFunction>) {
        super(arg);
      }
    }

    const testModel = new TypeListFunction({
      child: {
        nestedProp: 6,
      },
      list: [
        {
          nestedProp: "test",
        },
      ],
    });

    const errs = testModel.hasErrors();
    expect(errs).toBeDefined();
    testModel.list[0].nestedProp = 6;

    expect(testModel.hasErrors()).toBeUndefined();
  });
  it("enforces type via function in a list with many types", () => {
    @model()
    class ChildClazz {
      @type(() => Number)
      @required()
      nestedProp!: Dummy;

      constructor() {}
    }

    @model()
    class TypeListFunction extends Model {
      @required()
      child!: ChildClazz;

      @required()
      @list([() => ChildClazz, String])
      @minlength(1)
      list!: ChildClazz[];

      constructor(arg?: ModelArg<TypeListFunction>) {
        super(arg);
      }
    }

    const testModel = new TypeListFunction({
      child: {
        nestedProp: 6,
      },
      list: ["test"],
    });

    const errs = testModel.hasErrors();
    expect(errs).toBeUndefined();
  });
});
