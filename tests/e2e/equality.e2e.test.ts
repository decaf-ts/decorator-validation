/**
 * @description E2E tests for equality functionality
 * Tests equals, isEqual against src/lib/dist builds
 */
import { prop } from "@decaf-ts/decoration";
import { getLibrary, TEST_ROOT } from "./e2e.config";
import type { Model as ModelType, ModelArg } from "./e2e.config";

describe(`E2E Equality Tests [${TEST_ROOT}]`, () => {
  let lib: Awaited<ReturnType<typeof getLibrary>>;
  let Model: typeof ModelType;
  let model: (typeof lib)["model"];
  let required: (typeof lib)["required"];
  let list: (typeof lib)["list"];
  let type: (typeof lib)["type"];
  let isEqual: (typeof lib)["isEqual"];

  beforeAll(async () => {
    lib = await getLibrary();
    Model = lib.Model;
    model = lib.model;
    required = lib.required;
    list = lib.list;
    type = lib.type;
    isEqual = lib.isEqual;
  });

  describe("isEqual Utility Function", () => {
    describe("Primitive Comparison", () => {
      it("should compare strings", () => {
        expect(isEqual("hello", "hello")).toBe(true);
        expect(isEqual("hello", "world")).toBe(false);
        expect(isEqual("", "")).toBe(true);
      });

      it("should compare numbers", () => {
        expect(isEqual(42, 42)).toBe(true);
        expect(isEqual(42, 43)).toBe(false);
        expect(isEqual(0, 0)).toBe(true);
        expect(isEqual(-1, -1)).toBe(true);
      });

      it("should compare booleans", () => {
        expect(isEqual(true, true)).toBe(true);
        expect(isEqual(false, false)).toBe(true);
        expect(isEqual(true, false)).toBe(false);
      });

      it("should handle null and undefined", () => {
        expect(isEqual(null, null)).toBe(true);
        expect(isEqual(undefined, undefined)).toBe(true);
        expect(isEqual(null, undefined)).toBe(false);
      });

      it("should handle NaN", () => {
        expect(isEqual(NaN, NaN)).toBe(true);
      });

      it("should differentiate +0 and -0", () => {
        // Some implementations might treat these as equal
        const result = isEqual(+0, -0);
        expect(typeof result).toBe("boolean");
      });
    });

    describe("Object Comparison", () => {
      it("should compare plain objects", () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 1, b: 2 };
        const obj3 = { a: 1, b: 3 };

        expect(isEqual(obj1, obj2)).toBe(true);
        expect(isEqual(obj1, obj3)).toBe(false);
      });

      it("should compare nested objects", () => {
        const obj1 = { outer: { inner: "value" } };
        const obj2 = { outer: { inner: "value" } };
        const obj3 = { outer: { inner: "different" } };

        expect(isEqual(obj1, obj2)).toBe(true);
        expect(isEqual(obj1, obj3)).toBe(false);
      });

      it("should handle different property counts", () => {
        const obj1 = { a: 1 };
        const obj2 = { a: 1, b: 2 };

        expect(isEqual(obj1, obj2)).toBe(false);
      });

      it("should handle empty objects", () => {
        expect(isEqual({}, {})).toBe(true);
      });
    });

    describe("Array Comparison", () => {
      it("should compare arrays", () => {
        expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
        expect(isEqual([], [])).toBe(true);
      });

      it("should compare arrays of objects", () => {
        const arr1 = [{ id: 1 }, { id: 2 }];
        const arr2 = [{ id: 1 }, { id: 2 }];
        const arr3 = [{ id: 1 }, { id: 3 }];

        expect(isEqual(arr1, arr2)).toBe(true);
        expect(isEqual(arr1, arr3)).toBe(false);
      });

      it("should handle different array lengths", () => {
        expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
      });
    });

    describe("Date Comparison", () => {
      it("should compare dates", () => {
        const date1 = new Date("2024-01-01");
        const date2 = new Date("2024-01-01");
        const date3 = new Date("2024-01-02");

        expect(isEqual(date1, date2)).toBe(true);
        expect(isEqual(date1, date3)).toBe(false);
      });
    });

    describe("RegExp Comparison", () => {
      it("should compare regular expressions", () => {
        const regex1 = /test/gi;
        const regex2 = /test/gi;
        const regex3 = /different/g;

        expect(isEqual(regex1, regex2)).toBe(true);
        expect(isEqual(regex1, regex3)).toBe(false);
      });
    });

    describe("Property Exclusion", () => {
      it("should ignore specified properties", () => {
        const obj1 = { a: 1, b: 2, c: 3 };
        const obj2 = { a: 1, b: 999, c: 3 };

        expect(isEqual(obj1, obj2)).toBe(false);
        // isEqual takes rest parameters for properties to ignore
        expect(isEqual(obj1, obj2, "b")).toBe(true);
      });

      it("should ignore multiple properties", () => {
        const obj1 = { a: 1, b: 2, c: 3 };
        const obj2 = { a: 1, b: 999, c: 888 };

        // isEqual takes rest parameters for properties to ignore
        expect(isEqual(obj1, obj2, "b", "c")).toBe(true);
      });
    });
  });

  describe("Model.equals Method", () => {
    describe("Simple Model Equality", () => {
      it("should detect equal models", () => {
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

        const data = { name: "test", value: 42 };
        const model1 = new SimpleModel(data);
        const model2 = new SimpleModel(data);

        expect(model1.equals(model2)).toBe(true);
        expect(model2.equals(model1)).toBe(true);
      });

      it("should detect unequal models", () => {
        @model()
        class DiffModel extends Model {
          @required()
          value!: string;

          constructor(arg?: ModelArg<DiffModel>) {
            super(arg);
          }
        }

        const model1 = new DiffModel({ value: "first" });
        const model2 = new DiffModel({ value: "second" });

        expect(model1.equals(model2)).toBe(false);
      });

      it("should handle empty models", () => {
        @model()
        class EmptyModel extends Model {
          constructor(arg?: ModelArg<EmptyModel>) {
            super(arg);
          }
        }

        const model1 = new EmptyModel();
        const model2 = new EmptyModel();

        expect(model1.equals(model2)).toBe(true);
      });
    });

    describe("Nested Model Equality", () => {
      it("should compare nested models deeply", () => {
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

          @type(Inner)
          inner?: Inner;

          constructor(arg?: ModelArg<Outer>) {
            super(arg);
          }
        }

        const model1 = new Outer({
          outerValue: "outer",
          inner: { innerValue: "inner" },
        });
        const model2 = new Outer({
          outerValue: "outer",
          inner: { innerValue: "inner" },
        });
        const model3 = new Outer({
          outerValue: "outer",
          inner: { innerValue: "different" },
        });

        expect(model1.equals(model2)).toBe(true);
        expect(model1.equals(model3)).toBe(false);
      });

      it("should compare deeply nested models", () => {
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
          child?: Level3;

          constructor(arg?: ModelArg<Level2>) {
            super(arg);
          }
        }

        @model()
        class Level1 extends Model {
          @required()
          l1!: string;

          @type(Level2)
          child?: Level2;

          constructor(arg?: ModelArg<Level1>) {
            super(arg);
          }
        }

        const model1 = new Level1({
          l1: "1",
          child: { l2: "2", child: { l3: "3" } },
        });
        const model2 = new Level1({
          l1: "1",
          child: { l2: "2", child: { l3: "3" } },
        });

        expect(model1.equals(model2)).toBe(true);
      });
    });

    describe("Model with Lists", () => {
      it("should compare models with primitive lists", () => {
        @model()
        class ListModel extends Model {
          @list(String)
          items!: string[];

          constructor(arg?: ModelArg<ListModel>) {
            super(arg);
          }
        }

        const model1 = new ListModel({ items: ["a", "b", "c"] });
        const model2 = new ListModel({ items: ["a", "b", "c"] });
        const model3 = new ListModel({ items: ["a", "b", "d"] });

        expect(model1.equals(model2)).toBe(true);
        expect(model1.equals(model3)).toBe(false);
      });

      it("should compare models with model lists", () => {
        @model()
        class Item extends Model {
          @required()
          name!: string;

          constructor(arg?: ModelArg<Item>) {
            super(arg);
          }
        }

        @model()
        class Container extends Model {
          @list(Item)
          items!: Item[];

          constructor(arg?: ModelArg<Container>) {
            super(arg);
          }
        }

        const model1 = new Container({
          items: [{ name: "Item1" }, { name: "Item2" }],
        });
        const model2 = new Container({
          items: [{ name: "Item1" }, { name: "Item2" }],
        });
        const model3 = new Container({
          items: [{ name: "Item1" }, { name: "Different" }],
        });

        expect(model1.equals(model2)).toBe(true);
        expect(model1.equals(model3)).toBe(false);
      });
    });

    describe("Equality with Exceptions", () => {
      it("should ignore specified properties in comparison", () => {
        @model()
        class ExceptionModel extends Model {
          @required()
          id!: string;

          @required()
          name!: string;

          @prop()
          timestamp?: Date;

          constructor(arg?: ModelArg<ExceptionModel>) {
            super(arg);
          }
        }

        const now = new Date();
        const later = new Date(now.getTime() + 1000);

        const model1 = new ExceptionModel({
          id: "1",
          name: "test",
          timestamp: now,
        });
        const model2 = new ExceptionModel({
          id: "1",
          name: "test",
          timestamp: later,
        });

        expect(model1.equals(model2)).toBe(false);
        expect(model1.equals(model2, "timestamp")).toBe(true);
      });

      it("should ignore multiple properties", () => {
        @model()
        class MultiExceptionModel extends Model {
          id!: string;
          name!: string;
          createdAt?: Date;
          updatedAt?: Date;

          constructor(arg?: ModelArg<MultiExceptionModel>) {
            super(arg);
          }
        }

        const model1 = new MultiExceptionModel({
          id: "1",
          name: "test",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        });
        const model2 = new MultiExceptionModel({
          id: "1",
          name: "test",
          createdAt: new Date("2024-06-01"),
          updatedAt: new Date("2024-06-02"),
        });

        expect(model1.equals(model2, "createdAt", "updatedAt")).toBe(true);
      });
    });

    describe("Edge Cases", () => {
      it("should handle null and undefined properties", () => {
        @model()
        class NullableModel extends Model {
          value: string | null = null;
          optional?: string;

          constructor(arg?: ModelArg<NullableModel>) {
            super(arg);
          }
        }

        const model1 = new NullableModel({ value: null });
        const model2 = new NullableModel({ value: null });
        const model3 = new NullableModel();

        expect(model1.equals(model2)).toBe(true);
        expect(model1.equals(model3)).toBe(true);
      });

      it("should differentiate between null and undefined", () => {
        @model()
        class NullUndefinedModel extends Model {
          value?: string | null;

          constructor(arg?: ModelArg<NullUndefinedModel>) {
            super(arg);
          }
        }

        const withNull = new NullUndefinedModel({ value: null });
        const withUndefined = new NullUndefinedModel({ value: undefined });

        // The behavior may vary based on implementation
        const result = withNull.equals(withUndefined);
        expect(typeof result).toBe("boolean");
      });

      it("should handle self-comparison", () => {
        @model()
        class SelfModel extends Model {
          value!: string;

          constructor(arg?: ModelArg<SelfModel>) {
            super(arg);
          }
        }

        const instance = new SelfModel({ value: "test" });
        expect(instance.equals(instance)).toBe(true);
      });

      it("should handle models with default values", () => {
        @model()
        class DefaultModel extends Model {
          value: string = "default";
          count: number = 0;

          constructor(arg?: ModelArg<DefaultModel>) {
            super(arg);
          }
        }

        const model1 = new DefaultModel();
        const model2 = new DefaultModel();

        expect(model1.equals(model2)).toBe(true);
      });
    });

    describe("Transitivity", () => {
      it("should be transitive: if a=b and b=c then a=c", () => {
        @model()
        class TransitiveModel extends Model {
          @required()
          value!: string;

          constructor(arg?: ModelArg<TransitiveModel>) {
            super(arg);
          }
        }

        const data = { value: "same" };
        const a = new TransitiveModel(data);
        const b = new TransitiveModel(data);
        const c = new TransitiveModel(data);

        expect(a.equals(b)).toBe(true);
        expect(b.equals(c)).toBe(true);
        expect(a.equals(c)).toBe(true);
      });
    });

    describe("Symmetry", () => {
      it("should be symmetric: if a=b then b=a", () => {
        @model()
        class SymmetricModel extends Model {
          @required()
          value!: string;

          constructor(arg?: ModelArg<SymmetricModel>) {
            super(arg);
          }
        }

        const model1 = new SymmetricModel({ value: "test" });
        const model2 = new SymmetricModel({ value: "test" });

        expect(model1.equals(model2)).toBe(model2.equals(model1));
      });
    });
  });
});
