/**
 * @description E2E tests for serialization functionality
 * Tests serialize/deserialize and model registry against src/lib/dist builds
 */
import { prop } from "@decaf-ts/decoration";
import {
  getLibrary,
  TEST_ROOT,
  // Decorators must be imported statically for TypeScript transpilation
  model,
  required,
  list,
  type,
} from "./e2e.config";
import type { Model as ModelType, ModelArg } from "./e2e.config";

describe(`E2E Serialization Tests [${TEST_ROOT}]`, () => {
  let lib: Awaited<ReturnType<typeof getLibrary>>;
  let Model: typeof ModelType;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let Serialization: (typeof lib)["Serialization"];

  beforeAll(async () => {
    lib = await getLibrary();
    Model = lib.Model;
    Serialization = lib.Serialization;
  });

  describe("Basic Serialization", () => {
    it("should serialize a simple model to JSON string", () => {
      @model()
      class SimpleModel extends Model {
        @required()
        name!: string;

        @required()
        value!: number;

        constructor(arg?: ModelArg<SimpleModel>) {
          super(arg);
        }
      }

      const instance = new SimpleModel({ name: "test", value: 42 });
      const serialized = instance.serialize();

      expect(typeof serialized).toBe("string");
      expect(serialized).toContain("test");
      expect(serialized).toContain("42");
    });

    it("should deserialize JSON string back to model", () => {
      @model()
      class DeserializeModel extends Model {
        @required()
        title!: string;

        @required()
        count!: number;

        constructor(arg?: ModelArg<DeserializeModel>) {
          super(arg);
        }
      }

      const original = new DeserializeModel({ title: "Hello", count: 100 });
      const serialized = original.serialize();
      const deserialized = Model.deserialize(serialized);

      expect(deserialized).toBeDefined();
      expect(deserialized.title).toBe("Hello");
      expect(deserialized.count).toBe(100);
    });

    it("should maintain equality after serialization round-trip", () => {
      @model()
      class RoundTripModel extends Model {
        @required()
        id!: string;

        data?: Record<string, any>;

        constructor(arg?: ModelArg<RoundTripModel>) {
          super(arg);
        }
      }

      const original = new RoundTripModel({
        id: "unique-id",
        data: { nested: { value: 123 } },
      });
      const serialized = original.serialize();
      const deserialized = Model.deserialize(serialized);

      expect(original.equals(deserialized)).toBe(true);
      expect(original.hash()).toBe(deserialized.hash());
    });
  });

  describe("Nested Model Serialization", () => {
    it("should serialize nested models", () => {
      @model()
      class InnerModel extends Model {
        @required()
        innerValue!: string;

        constructor(arg?: ModelArg<InnerModel>) {
          super(arg);
        }
      }

      @model()
      class OuterModel extends Model {
        @required()
        outerValue!: string;

        @required()
        @type(InnerModel)
        inner!: InnerModel;

        constructor(arg?: ModelArg<OuterModel>) {
          super(arg);
        }
      }

      const instance = new OuterModel({
        outerValue: "outer",
        inner: { innerValue: "inner" },
      });

      expect(instance.inner).toBeInstanceOf(InnerModel);

      const serialized = instance.serialize();
      expect(serialized).toContain("outer");
      expect(serialized).toContain("inner");
    });

    it("should deserialize and reconstruct nested models", () => {
      @model()
      class ChildModel extends Model {
        @required()
        childName!: string;

        constructor(arg?: ModelArg<ChildModel>) {
          super(arg);
        }
      }

      @model()
      class ParentModel extends Model {
        @required()
        parentName!: string;

        @required()
        @type(ChildModel)
        child!: ChildModel;

        constructor(arg?: ModelArg<ParentModel>) {
          super(arg);
        }
      }

      const original = new ParentModel({
        parentName: "Parent",
        child: { childName: "Child" },
      });

      const serialized = original.serialize();
      const deserialized = Model.deserialize(serialized);
      const rebuilt = Model.build(deserialized);

      expect(rebuilt).toBeInstanceOf(ParentModel);
      expect(rebuilt.child).toBeInstanceOf(ChildModel);
      expect(rebuilt.parentName).toBe("Parent");
      expect(rebuilt.child.childName).toBe("Child");
    });

    it("should serialize deeply nested models", () => {
      @model()
      class Level3 extends Model {
        @required()
        level3Value!: string;

        constructor(arg?: ModelArg<Level3>) {
          super(arg);
        }
      }

      @model()
      class Level2 extends Model {
        @required()
        level2Value!: string;

        @type(Level3)
        level3?: Level3;

        constructor(arg?: ModelArg<Level2>) {
          super(arg);
        }
      }

      @model()
      class Level1 extends Model {
        @required()
        level1Value!: string;

        @type(Level2)
        level2?: Level2;

        constructor(arg?: ModelArg<Level1>) {
          super(arg);
        }
      }

      const instance = new Level1({
        level1Value: "L1",
        level2: {
          level2Value: "L2",
          level3: {
            level3Value: "L3",
          },
        },
      });

      const serialized = instance.serialize();
      const deserialized = Model.deserialize(serialized);

      expect(deserialized.level1Value).toBe("L1");
      expect(deserialized.level2?.level2Value).toBe("L2");
      expect(deserialized.level2?.level3?.level3Value).toBe("L3");
    });
  });

  describe("List Serialization", () => {
    it("should serialize models with lists of primitives", () => {
      @model()
      class ListPrimitiveModel extends Model {
        @list(String)
        @required()
        tags!: string[];

        @list(Number)
        scores?: number[];

        constructor(arg?: ModelArg<ListPrimitiveModel>) {
          super(arg);
        }
      }

      const instance = new ListPrimitiveModel({
        tags: ["a", "b", "c"],
        scores: [1, 2, 3],
      });

      const serialized = instance.serialize();
      const deserialized = Model.deserialize(serialized);

      expect(deserialized.tags).toEqual(["a", "b", "c"]);
      expect(deserialized.scores).toEqual([1, 2, 3]);
    });

    it("should serialize models with lists of models", () => {
      @model()
      class ItemModel extends Model {
        @required()
        name!: string;

        @required()
        quantity!: number;

        constructor(arg?: ModelArg<ItemModel>) {
          super(arg);
        }
      }

      @model()
      class OrderModel extends Model {
        @required()
        orderId!: string;

        @list(ItemModel)
        @required()
        items!: ItemModel[];

        constructor(arg?: ModelArg<OrderModel>) {
          super(arg);
        }
      }

      const instance = new OrderModel({
        orderId: "ORD-001",
        items: [
          { name: "Item 1", quantity: 2 },
          { name: "Item 2", quantity: 5 },
        ],
      });

      expect(instance.items[0]).toBeInstanceOf(ItemModel);

      const serialized = instance.serialize();
      const deserialized = Model.deserialize(serialized);
      const rebuilt = Model.build(deserialized);

      expect(rebuilt.items.length).toBe(2);
      expect(rebuilt.items[0]).toBeInstanceOf(ItemModel);
      expect(rebuilt.items[0].name).toBe("Item 1");
    });
  });

  describe("Model Registry", () => {
    it("should register models automatically with @model decorator", () => {
      @model()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class RegisteredModel extends Model {
        @required()
        prop!: string;

        constructor(arg?: ModelArg<RegisteredModel>) {
          super(arg);
        }
      }

      const Constructor = Model.get("RegisteredModel");
      expect(Constructor).toBeDefined();
      expect(Constructor?.name).toBe("RegisteredModel");
    });

    it("should build model from plain object using registry", () => {
      @model()
      class BuildableModel extends Model {
        @required()
        value!: string;

        constructor(arg?: ModelArg<BuildableModel>) {
          super(arg);
        }
      }

      const instance = new BuildableModel({ value: "test" });
      const serialized = instance.serialize();
      const deserialized = Model.deserialize(serialized);

      expect(Model.isModel(deserialized)).toBe(true);

      const rebuilt = Model.build(deserialized);
      expect(rebuilt).toBeInstanceOf(BuildableModel);
      expect(rebuilt.value).toBe("test");
    });

    it("should check if object is a model", () => {
      @model()
      class CheckModel extends Model {
        name?: string;

        constructor(arg?: ModelArg<CheckModel>) {
          super(arg);
        }
      }

      const instance = new CheckModel({ name: "test" });
      expect(Model.isModel(instance)).toBe(true);
      expect(Model.isModel(JSON.parse(JSON.stringify(instance)))).toBe(false);
      expect(Model.isModel(Model.deserialize(instance.serialize()))).toBe(true);
      expect(Model.isModel({})).toBe(false);
      expect(Model.isModel(null)).toBe(false);
    });
  });

  describe("Complex Types Serialization", () => {
    it("should serialize models with Date properties", () => {
      @model()
      class DateModel extends Model {
        @required()
        createdAt!: Date;

        updatedAt?: Date;

        constructor(arg?: ModelArg<DateModel>) {
          super(arg);
        }
      }

      const now = new Date();
      const instance = new DateModel({
        createdAt: now,
        updatedAt: new Date("2024-01-01"),
      });

      const serialized = instance.serialize();
      const deserialized = Model.deserialize(serialized);

      expect(new Date(deserialized.createdAt).getTime()).toBe(now.getTime());
    });

    it("should serialize models with optional properties", () => {
      @model()
      class OptionalModel extends Model {
        @required()
        required!: string;

        @prop()
        optional?: string;

        @prop()
        optionalNumber?: number;

        constructor(arg?: ModelArg<OptionalModel>) {
          super(arg);
        }
      }

      const withOptional = new OptionalModel({
        required: "value",
        optional: "optional",
      });
      const withoutOptional = new OptionalModel({ required: "value" });

      const serialized1 = withOptional.serialize();
      const serialized2 = withoutOptional.serialize();

      expect(serialized1).toContain("optional");
      expect(Model.deserialize(serialized1).optional).toBe("optional");
      expect(Model.deserialize(serialized2).optional).toBeUndefined();
    });

    it("should serialize models with default values", () => {
      @model()
      class DefaultValueModel extends Model {
        @required()
        name!: string;

        status: string = "pending";
        count: number = 0;

        constructor(arg?: ModelArg<DefaultValueModel>) {
          super(arg);
        }
      }

      const instance = new DefaultValueModel({ name: "test" });
      expect(instance.status).toBe("pending");
      expect(instance.count).toBe(0);

      const serialized = instance.serialize();
      const deserialized = Model.deserialize(serialized);

      expect(deserialized.status).toBe("pending");
      expect(deserialized.count).toBe(0);
    });
  });

  describe("Serialization Edge Cases", () => {
    it("should handle empty models", () => {
      @model()
      class EmptyModel extends Model {
        constructor(arg?: ModelArg<EmptyModel>) {
          super(arg);
        }
      }

      const instance = new EmptyModel();
      const serialized = instance.serialize();
      const deserialized = Model.deserialize(serialized);

      expect(deserialized).toBeDefined();
    });

    it("should handle models with null values", () => {
      @model()
      class NullableModel extends Model {
        value: string | null = null;

        constructor(arg?: ModelArg<NullableModel>) {
          super(arg);
        }
      }

      const instance = new NullableModel();
      const serialized = instance.serialize();
      const deserialized = Model.deserialize(serialized);

      expect(deserialized.value).toBeNull();
    });

    it("should handle models with special characters", () => {
      @model()
      class SpecialCharModel extends Model {
        @required()
        text!: string;

        constructor(arg?: ModelArg<SpecialCharModel>) {
          super(arg);
        }
      }

      const instance = new SpecialCharModel({
        text: 'Hello "World"! \n\t Special: \u0000',
      });

      const serialized = instance.serialize();
      const deserialized = Model.deserialize(serialized);

      expect(deserialized.text).toContain("Hello");
      expect(deserialized.text).toContain("World");
    });
  });
});
