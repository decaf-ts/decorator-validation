import { Model } from "../../src";
import { required } from "../../src";
import type { ModelArg } from "../../src";
import { model } from "../../src";
import { list } from "../../src";
import { minlength, maxlength } from "../../src";

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
    const r = {
      prop1: "test",
    };
    const model = new ConstructionTestModel(r);
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
      expect(model.hasErrors()).toBeDefined();
      Model.setBuilder();
    });

    describe("Properly builds with the Model Builder Function", () => {
      const g = {
        parent: r,
      };

      beforeAll(() => {
        // bulkModelRegister(ConstructionTestModel, ParentConstructionTestModel, GrandParentConstructionTestModel)
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
        const model = new GrandParentConstructionTestModel(g);
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
        expect(model.hasErrors()).toBeDefined();

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
