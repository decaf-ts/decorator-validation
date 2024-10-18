import {
  findLastProtoBeforeObject,
  Model,
  model,
  ModelArg,
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

    // eslint-disable-next-line max-len
    it("still properly handles non Model based classes by injecting himself on the top of the prototype chain", () => {
      let model = new NonModel();
      expect(model.hasErrors()).toBeDefined();
      expect(model instanceof Model).toEqual(true);

      model = new NonModel({
        arg1: "non model",
      });
      expect(model.hasErrors()).toBeUndefined();
      expect(model.hash()).toBeDefined();
    });
  });
});
