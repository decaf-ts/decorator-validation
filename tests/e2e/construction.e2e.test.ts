/**
 * @description E2E tests for construction functionality
 * Tests Model construction, builders, and fromObject/fromModel against src/lib/dist builds
 */
import { prop } from "@decaf-ts/decoration";
import { getLibrary, TEST_ROOT } from "./e2e.config";
import type { Model as ModelType, ModelArg } from "./e2e.config";

describe(`E2E Construction Tests [${TEST_ROOT}]`, () => {
  let lib: Awaited<ReturnType<typeof getLibrary>>;
  let Model: typeof ModelType;
  let model: (typeof lib)["model"];
  let required: (typeof lib)["required"];
  let list: (typeof lib)["list"];
  let type: (typeof lib)["type"];
  let minlength: (typeof lib)["minlength"];
  let maxlength: (typeof lib)["maxlength"];

  beforeAll(async () => {
    lib = await getLibrary();
    Model = lib.Model;
    model = lib.model;
    required = lib.required;
    list = lib.list;
    type = lib.type;
    minlength = lib.minlength;
    maxlength = lib.maxlength;
  });

  afterEach(() => {
    // Reset builder to default after each test
    Model.setBuilder?.();
  });

  describe("Basic Construction", () => {
    it("should construct model with no arguments", () => {
      @model()
      class EmptyConstructModel extends Model {
        name?: string;

        constructor(arg?: ModelArg<EmptyConstructModel>) {
          super(arg);
        }
      }

      const instance = new EmptyConstructModel();
      expect(instance).toBeInstanceOf(EmptyConstructModel);
      expect(instance).toBeInstanceOf(Model);
    });

    it("should construct model with partial data", () => {
      @model()
      class PartialModel extends Model {
        @required()
        name!: string;

        optional?: string;

        constructor(arg?: ModelArg<PartialModel>) {
          super(arg);
        }
      }

      const instance = new PartialModel({ name: "John" });
      expect(instance.name).toBe("John");
      expect(instance.optional).toBeUndefined();
    });

    it("should construct model with full data", () => {
      @model()
      class FullModel extends Model {
        @required()
        name!: string;

        @required()
        value!: number;

        @prop()
        optional?: boolean;

        constructor(arg?: ModelArg<FullModel>) {
          super(arg);
        }
      }

      const instance = new FullModel({
        name: "Test",
        value: 42,
        optional: true,
      });

      expect(instance.name).toBe("Test");
      expect(instance.value).toBe(42);
      expect(instance.optional).toBe(true);
    });

    it("should preserve property types during construction", () => {
      @model()
      class TypedModel extends Model {
        @prop()
        stringProp!: string;

        @prop()
        numberProp!: number;

        @prop()
        booleanProp!: boolean;

        @prop()
        dateProp!: Date;

        constructor(arg?: ModelArg<TypedModel>) {
          super(arg);
        }
      }

      const date = new Date();
      const instance = new TypedModel({
        stringProp: "hello",
        numberProp: 123,
        booleanProp: true,
        dateProp: date,
      });

      expect(typeof instance.stringProp).toBe("string");
      expect(typeof instance.numberProp).toBe("number");
      expect(typeof instance.booleanProp).toBe("boolean");
      expect(instance.dateProp).toBeInstanceOf(Date);
    });
  });

  describe("Construction with Default Values", () => {
    it("should respect default values when not provided", () => {
      @model()
      class DefaultValueModel extends Model {
        @required()
        name!: string;

        status: string = "pending";
        count: number = 0;
        active: boolean = true;

        constructor(arg?: ModelArg<DefaultValueModel>) {
          super(arg);
        }
      }

      const instance = new DefaultValueModel({ name: "Test" });

      expect(instance.name).toBe("Test");
      expect(instance.status).toBe("pending");
      expect(instance.count).toBe(0);
      expect(instance.active).toBe(true);
    });

    it("should override default values when provided", () => {
      @model()
      class OverrideDefaultModel extends Model {
        @prop()
        status: string = "pending";

        @prop()
        count: number = 0;

        constructor(arg?: ModelArg<OverrideDefaultModel>) {
          super(arg);
        }
      }

      const instance = new OverrideDefaultModel({
        status: "active",
        count: 10,
      });

      expect(instance.status).toBe("active");
      expect(instance.count).toBe(10);
    });

    it("should validate models with default values", () => {
      @model()
      class ValidatedDefaultModel extends Model {
        @required()
        requiredField!: string;

        @required()
        defaultRequired: string = "default";

        constructor(arg?: ModelArg<ValidatedDefaultModel>) {
          super(arg);
        }
      }

      const instance = new ValidatedDefaultModel({
        requiredField: "value",
      });

      expect(instance.hasErrors()).toBeUndefined();
    });
  });

  describe("Nested Model Construction", () => {
    it("should construct nested models automatically", () => {
      @model()
      class Inner extends Model {
        @required()
        innerValue!: string;

        constructor(arg?: ModelArg<Inner>) {
          super(arg);
        }
      }

      @model()
      class Outer extends Model {
        @required()
        outerValue!: string;

        @required()
        @type(Inner)
        inner!: Inner;

        constructor(arg?: ModelArg<Outer>) {
          super(arg);
        }
      }

      const instance = new Outer({
        outerValue: "outer",
        inner: { innerValue: "inner" },
      });

      expect(instance.inner).toBeInstanceOf(Inner);
      expect(instance.inner.innerValue).toBe("inner");
    });

    it("should construct deeply nested models", () => {
      @model()
      class Level3 extends Model {
        @required()
        l3!: string;

        constructor(arg?: ModelArg<Level3>) {
          super(arg);
        }
      }

      @model()
      class Level2 extends Model {
        @required()
        l2!: string;

        @type(Level3)
        child!: Level3;

        constructor(arg?: ModelArg<Level2>) {
          super(arg);
        }
      }

      @model()
      class Level1 extends Model {
        @required()
        l1!: string;

        @type(Level2)
        child!: Level2;

        constructor(arg?: ModelArg<Level1>) {
          super(arg);
        }
      }

      const instance = new Level1({
        l1: "L1",
        child: {
          l2: "L2",
          child: {
            l3: "L3",
          },
        },
      });

      expect(instance.child).toBeInstanceOf(Level2);
      expect(instance.child.child).toBeInstanceOf(Level3);
      expect(instance.child.child.l3).toBe("L3");
    });

    it("should validate nested models after construction", () => {
      @model()
      class NestedChild extends Model {
        @required()
        childValue!: string;

        constructor(arg?: ModelArg<NestedChild>) {
          super(arg);
        }
      }

      @model()
      class NestedParent extends Model {
        @required()
        @type(NestedChild)
        child!: NestedChild;

        constructor(arg?: ModelArg<NestedParent>) {
          super(arg);
        }
      }

      const valid = new NestedParent({
        child: { childValue: "value" },
      });
      expect(valid.hasErrors()).toBeUndefined();

      const invalid = new NestedParent({
        child: {},
      });
      expect(invalid.hasErrors()).toBeDefined();
    });
  });

  describe("List Construction", () => {
    it("should construct lists of primitives", () => {
      @model()
      class PrimitiveListModel extends Model {
        @list(String)
        strings!: string[];

        @list(Number)
        numbers!: number[];

        constructor(arg?: ModelArg<PrimitiveListModel>) {
          super(arg);
        }
      }

      const instance = new PrimitiveListModel({
        strings: ["a", "b", "c"],
        numbers: [1, 2, 3],
      });

      expect(instance.strings).toEqual(["a", "b", "c"]);
      expect(instance.numbers).toEqual([1, 2, 3]);
    });

    it("should construct lists of models", () => {
      @model()
      class ListItem extends Model {
        @required()
        name!: string;

        constructor(arg?: ModelArg<ListItem>) {
          super(arg);
        }
      }

      @model()
      class ListContainer extends Model {
        @list(ListItem)
        @required()
        items!: ListItem[];

        constructor(arg?: ModelArg<ListContainer>) {
          super(arg);
        }
      }

      const instance = new ListContainer({
        items: [{ name: "Item 1" }, { name: "Item 2" }, { name: "Item 3" }],
      });

      expect(instance.items.length).toBe(3);
      expect(instance.items[0]).toBeInstanceOf(ListItem);
      expect(instance.items[1]).toBeInstanceOf(ListItem);
      expect(instance.items[2]).toBeInstanceOf(ListItem);
    });

    it("should validate list items after construction", () => {
      @model()
      class ValidatedItem extends Model {
        @required()
        value!: string;

        constructor(arg?: ModelArg<ValidatedItem>) {
          super(arg);
        }
      }

      @model()
      class ValidatedListModel extends Model {
        @list(ValidatedItem)
        @minlength(1)
        @maxlength(3)
        @required()
        items!: ValidatedItem[];

        constructor(arg?: ModelArg<ValidatedListModel>) {
          super(arg);
        }
      }

      const valid = new ValidatedListModel({
        items: [{ value: "a" }, { value: "b" }],
      });
      expect(valid.hasErrors()).toBeUndefined();

      const tooFew = new ValidatedListModel({ items: [] });
      expect(tooFew.hasErrors()).toBeDefined();
    });
  });

  describe("Builder Functions", () => {
    it("should use fromObject builder", () => {
      @model()
      class ObjectBuilderModel extends Model {
        @required()
        name!: string;

        constructor(arg?: ModelArg<ObjectBuilderModel>) {
          super(arg);
        }
      }

      Model.setBuilder?.(Model.fromObject);

      const instance = new ObjectBuilderModel({ name: "test" });
      expect(instance.name).toBe("test");
    });

    it("should use fromModel builder", () => {
      @model()
      class ModelBuilderModel extends Model {
        @required()
        name!: string;

        constructor(arg?: ModelArg<ModelBuilderModel>) {
          super(arg);
        }
      }

      Model.setBuilder?.(Model.fromModel);

      const instance = new ModelBuilderModel({ name: "test" });
      expect(instance.name).toBe("test");
      expect(instance.hasErrors()).toBeUndefined();
    });

    it("should construct nested models with fromModel builder", () => {
      @model()
      class BuilderChild extends Model {
        @required()
        value!: string;

        constructor(arg?: ModelArg<BuilderChild>) {
          super(arg);
        }
      }

      @model()
      class BuilderParent extends Model {
        @required()
        @type(BuilderChild)
        child!: BuilderChild;

        constructor(arg?: ModelArg<BuilderParent>) {
          super(arg);
        }
      }

      Model.setBuilder?.(Model.fromModel);

      const instance = new BuilderParent({
        child: { value: "nested" },
      });

      expect(instance.child).toBeInstanceOf(BuilderChild);
      expect(instance.hasErrors()).toBeUndefined();
    });
  });

  describe("Construction from Other Models", () => {
    it("should construct model from another model instance", () => {
      @model()
      class CopyModel extends Model {
        @required()
        name!: string;

        @prop()
        value!: number;

        constructor(arg?: ModelArg<CopyModel>) {
          super(arg);
        }
      }

      const original = new CopyModel({ name: "Original", value: 42 });
      const copy = new CopyModel(original);

      expect(copy.name).toBe("Original");
      expect(copy.value).toBe(42);
      expect(copy).not.toBe(original);
      expect(copy.equals(original)).toBe(true);
    });

    it("should produce equal models when constructed from same data", () => {
      @model()
      class EqualConstructModel extends Model {
        @required()
        id!: string;

        @required()
        data!: string;

        constructor(arg?: ModelArg<EqualConstructModel>) {
          super(arg);
        }
      }

      const data = { id: "1", data: "test" };
      const model1 = new EqualConstructModel(data);
      const model2 = new EqualConstructModel(data);

      expect(model1.equals(model2)).toBe(true);
      expect(model1.hash()).toBe(model2.hash());
    });
  });

  describe("Inheritance Construction", () => {
    it("should construct inherited models correctly", () => {
      class BaseModel extends Model {
        @required()
        baseField!: string;

        constructor(arg?: any) {
          super();
          Model.fromObject(this, arg);
        }
      }

      @model()
      class DerivedModel extends BaseModel {
        @required()
        derivedField!: string;

        constructor(arg?: ModelArg<DerivedModel>) {
          super(arg);
        }
      }

      const instance = new DerivedModel({
        baseField: "base",
        derivedField: "derived",
      });

      expect(instance.baseField).toBe("base");
      expect(instance.derivedField).toBe("derived");
      expect(instance).toBeInstanceOf(DerivedModel);
      expect(instance).toBeInstanceOf(BaseModel);
      expect(instance).toBeInstanceOf(Model);
    });

    it("should validate inherited properties", () => {
      class InheritedBase extends Model {
        @required()
        baseRequired!: string;

        constructor(arg?: any) {
          super();
          Model.fromObject(this, arg);
        }
      }

      @model()
      class InheritedDerived extends InheritedBase {
        @required()
        derivedRequired!: string;

        constructor(arg?: ModelArg<InheritedDerived>) {
          super(arg);
        }
      }

      const valid = new InheritedDerived({
        baseRequired: "base",
        derivedRequired: "derived",
      });
      expect(valid.hasErrors()).toBeUndefined();

      const missingBase = new InheritedDerived({
        derivedRequired: "derived",
      });
      expect(missingBase.hasErrors()).toBeDefined();
    });

    it("should maintain prototype chain", () => {
      class Level1 extends Model {
        l1!: string;

        constructor(arg?: any) {
          super();
          Model.fromObject(this, arg);
        }
      }

      class Level2 extends Level1 {
        l2!: string;

        constructor(arg?: any) {
          super(arg);
          Model.fromObject(this, arg);
        }
      }

      @model()
      class Level3 extends Level2 {
        l3!: string;

        constructor(arg?: ModelArg<Level3>) {
          super(arg);
        }
      }

      const instance = new Level3({
        l1: "L1",
        l2: "L2",
        l3: "L3",
      });

      expect(instance).toBeInstanceOf(Level3);
      expect(instance).toBeInstanceOf(Level2);
      expect(instance).toBeInstanceOf(Level1);
      expect(instance).toBeInstanceOf(Model);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty constructor arguments", () => {
      @model()
      class EmptyArgModel extends Model {
        value?: string;

        constructor(arg?: ModelArg<EmptyArgModel>) {
          super(arg);
        }
      }

      const instance = new EmptyArgModel({});
      expect(instance.value).toBeUndefined();
    });

    it("should handle null/undefined values in constructor", () => {
      @model()
      class NullableConstructModel extends Model {
        value1: string | null = null;
        value2?: string;

        constructor(arg?: ModelArg<NullableConstructModel>) {
          super(arg);
        }
      }

      const instance = new NullableConstructModel({
        value1: null,
        value2: undefined,
      });

      expect(instance.value1).toBeNull();
      expect(instance.value2).toBeUndefined();
    });

    it("should ignore extra properties not in model", () => {
      @model()
      class StrictModel extends Model {
        @prop()
        defined!: string;

        constructor(arg?: ModelArg<StrictModel>) {
          super(arg);
        }
      }

      const instance = new StrictModel({
        defined: "value",
        extra: "should be ignored",
      } as any);

      expect(instance.defined).toBe("value");
      expect((instance as any).extra).toBeUndefined();
    });

    it("should handle models with only optional properties", () => {
      @model()
      class AllOptionalModel extends Model {
        @prop()
        opt1?: string;

        @prop()
        opt2?: number;

        @prop()
        opt3?: boolean;

        constructor(arg?: ModelArg<AllOptionalModel>) {
          super(arg);
        }
      }

      const empty = new AllOptionalModel();
      expect(empty.hasErrors()).toBeUndefined();

      const partial = new AllOptionalModel({ opt1: "value" });
      expect(partial.opt1).toBe("value");
      expect(partial.opt2).toBeUndefined();
    });
  });
});
