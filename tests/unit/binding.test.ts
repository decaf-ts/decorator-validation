import type { ModelArg } from "../../src";
import {
  findLastProtoBeforeObject,
  Model,
  model,
  ModelErrorDefinition,
  required,
} from "../../src";

describe("decorating non model classes", () => {
  describe("Binding", () => {
    class TestModel extends Model {
      constructor() {
        super();
      }
    }

    it("Finds the last in the prototype chain before object", () => {
      const date = new TestModel();
      const lastPrototype = findLastProtoBeforeObject(date);
      expect(lastPrototype.constructor.name).toEqual(Model.name);
    });
  });

  describe("Non Model classes", () => {
    @model()
    class NonModel implements Model {
      @required()
      arg1?: string = undefined;

      constructor(arg?: ModelArg<NonModel>) {
        Model.fromObject(this, arg);
      }

      equals(obj: any, ...exceptions: string[]): boolean {
        return Model.equals(this, obj, ...exceptions);
      }

      hasErrors(...exceptions: any[]): ModelErrorDefinition | undefined {
        return Model.hasErrors(this, ...exceptions);
      }

      serialize(): string {
        return Model.serialize(this);
      }

      hash(): string {
        return Model.hash(this);
      }
    }

    it("still properly handles non Model based classes by injecting himself on the top of the prototype chain", () => {
      let model = new NonModel();
      const errs = model.hasErrors();
      expect(errs).toBeDefined();
      expect(errs).toEqual(
        new ModelErrorDefinition({
          arg1: {
            required: "This field is required",
          },
        })
      );
      expect(model instanceof Model).toEqual(true);

      model = new NonModel({
        arg1: "non model",
      });
      expect(model.hasErrors()).toBeUndefined();
      expect(model.hash()).toBeDefined();
    });
  });

  describe("Non Model classes with a 2+ level prototype chain", () => {
    class RootNonModel {
      root?: string = undefined;
    }

    class MiddleNonModel extends RootNonModel {
      middle?: string = undefined;
    }

    @model()
    class DeepNonModel extends MiddleNonModel implements Model {
      @required()
      arg1?: string = undefined;

      constructor(arg?: ModelArg<DeepNonModel>) {
        super();
        Model.fromObject(this, arg);
      }

      equals(obj: any, ...exceptions: string[]): boolean {
        return Model.equals(this, obj, ...exceptions);
      }

      hasErrors(...exceptions: any[]): ModelErrorDefinition | undefined {
        return Model.hasErrors(this, ...exceptions);
      }

      serialize(): string {
        return Model.serialize(this);
      }

      hash(): string {
        return Model.hash(this);
      }
    }

    it("terminates construction and binds Model at the root of a 2+ level non-Model chain", () => {
      const instance = new DeepNonModel();

      expect(instance).toBeInstanceOf(DeepNonModel);
      expect(instance).toBeInstanceOf(MiddleNonModel);
      expect(instance).toBeInstanceOf(RootNonModel);
      expect(instance instanceof Model).toEqual(true);
      expect(
        Object.getPrototypeOf(RootNonModel.prototype) === Model.prototype
      ).toEqual(true);
    });

    it("validates the bound instance across the deep chain", () => {
      const empty = new DeepNonModel();
      const errs = empty.hasErrors();
      expect(errs).toBeDefined();
      expect(errs).toEqual(
        new ModelErrorDefinition({
          arg1: {
            required: "This field is required",
          },
        })
      );

      const populated = new DeepNonModel({ arg1: "deep non model" });
      expect(populated.hasErrors()).toBeUndefined();
      expect(populated.hash()).toBeDefined();
      expect(populated instanceof Model).toEqual(true);
    });
  });
});
