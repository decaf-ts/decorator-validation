import {
  list,
  maxlength,
  minlength,
  model,
  Model,
  ModelArg,
  ModelErrorDefinition,
  required,
  ValidationKeys,
} from "../../src";

@model()
class ConstructionTestModel extends Model {
  @required()
  prop1!: string;

  constructor(arg?: ModelArg<ConstructionTestModel>) {
    super(arg);
  }
}

@model()
class ParentConstructionTestModel extends Model {
  @required()
  child!: ConstructionTestModel;

  constructor(arg?: ModelArg<ConstructionTestModel>) {
    super(arg);
  }
}

@model()
class GrandParentConstructionTestModel extends Model {
  @required()
  parent!: ParentConstructionTestModel;

  constructor(arg?: ModelArg<GrandParentConstructionTestModel>) {
    super(arg);
  }
}

@model()
class TestModelWithList extends Model {
  @list(ConstructionTestModel)
  @required()
  @minlength(1)
  @maxlength(1)
  models!: ConstructionTestModel[];

  constructor(arg?: ModelArg<TestModelWithList>) {
    super(arg);
  }
}

describe("Construction", () => {
  it("auto constructs when configured", () => {
    Model.setBuilder(Model.fromObject);
    const model = new ConstructionTestModel({
      prop1: "test",
    });
    expect(model.hasErrors()).toBeUndefined();
    Model.setBuilder();
  });

  describe("Nested Construction", () => {
    const r = {
      child: {
        prop1: "test",
      },
    };

    it("Only builds the parent class with the normal Builder function", () => {
      Model.setBuilder(Model.fromObject);
      const model = new ParentConstructionTestModel(r);
      const errors = model.hasErrors();
      // expect(errors).toBeUndefined();
      expect(errors).toEqual(
        new ModelErrorDefinition({
          child: {
            [ValidationKeys.TYPE]:
              "Invalid type. Expected ConstructionTestModel, received object",
          },
        })
      );
      Model.setBuilder();
    });

    describe("Properly builds with the Model Builder Function", () => {
      beforeAll(() => {
        Model.setBuilder(Model.fromModel);
      });

      afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
      });

      afterAll(() => {
        Model.setBuilder();
      });

      it("Builds the Class Properly", () => {
        const model = new ParentConstructionTestModel(r);
        expect(model.child).toBeInstanceOf(ConstructionTestModel);

        const mock = jest.spyOn(model.child!, "hasErrors");

        expect(model.hasErrors()).toBeUndefined();
        expect(mock).toHaveBeenCalledTimes(1);
        expect(mock).toHaveReturnedWith(undefined);
      });

      it("Builds Another Class Properly", () => {
        const model = new GrandParentConstructionTestModel({
          parent: r,
        });
        expect(model.parent!).toBeInstanceOf(ParentConstructionTestModel);
        expect(model.parent!.child!).toBeInstanceOf(ConstructionTestModel);
        expect(model.hasErrors()).toBeUndefined();

        const mock = jest.spyOn(model.parent!.child!, "hasErrors");

        expect(model.hasErrors()).toBeUndefined();
        expect(mock).toHaveBeenCalledTimes(1);
        expect(mock).toHaveReturnedWith(undefined);
      });

      it("handles lists properly", () => {
        let model = new TestModelWithList();
        const errs = model.hasErrors();
        expect(errs).toBeDefined();
        expect(errs).toEqual(
          new ModelErrorDefinition({
            models: {
              [ValidationKeys.REQUIRED]: "This field is required",
            },
          })
        );

        model = new TestModelWithList({
          models: [
            {
              prop1: "test",
            },
          ],
        });

        expect(model.models![0]).toBeInstanceOf(ConstructionTestModel);

        const mock = jest.spyOn(model.models![0], "hasErrors");

        expect(model.hasErrors()).toBeUndefined();
        expect(mock).toHaveBeenCalledTimes(1);
        expect(mock).toHaveReturnedWith(undefined);
      });
    });
  });
});
