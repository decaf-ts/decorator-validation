/**
 * @description E2E tests for comparison functionality
 * Tests Model.compare method against src/lib/dist builds
 */
import { prop } from "@decaf-ts/decoration";
import { getLibrary, TEST_ROOT } from "./e2e.config";
import type { Model as ModelType, ModelArg } from "./e2e.config";

describe(`E2E Comparison Tests [${TEST_ROOT}]`, () => {
  let lib: Awaited<ReturnType<typeof getLibrary>>;
  let Model: typeof ModelType;
  let model: (typeof lib)["model"];
  let required: (typeof lib)["required"];
  let list: (typeof lib)["list"];
  let type: (typeof lib)["type"];
  let email: (typeof lib)["email"];
  let minlength: (typeof lib)["minlength"];

  beforeAll(async () => {
    lib = await getLibrary();
    Model = lib.Model;
    model = lib.model;
    required = lib.required;
    list = lib.list;
    type = lib.type;
    email = lib.email;
    minlength = lib.minlength;
  });

  describe("Basic Comparison", () => {
    it("should return undefined for identical models", () => {
      @model()
      class IdenticalModel extends Model {
        @required()
        name!: string;

        @required()
        value!: number;

        constructor(arg?: ModelArg<IdenticalModel>) {
          super(arg);
        }
      }

      const data = { name: "test", value: 42 };
      const model1 = new IdenticalModel(data);
      const model2 = new IdenticalModel(data);

      const comparison = model1.compare(model2);
      expect(comparison).toBeUndefined();
    });

    it("should detect differences in single property", () => {
      @model()
      class SingleDiffModel extends Model {
        @required()
        name!: string;

        @required()
        value!: number;

        constructor(arg?: ModelArg<SingleDiffModel>) {
          super(arg);
        }
      }

      const model1 = new SingleDiffModel({ name: "first", value: 1 });
      const model2 = new SingleDiffModel({ name: "second", value: 1 });

      const comparison = model1.compare(model2);
      expect(comparison).toBeDefined();
      expect(comparison?.name).toEqual({
        current: "first",
        other: "second",
      });
      expect(comparison?.value).toBeUndefined();
    });

    it("should detect differences in multiple properties", () => {
      @model()
      class MultiDiffModel extends Model {
        @required()
        name!: string;

        @required()
        age!: number;

        @email()
        email!: string;

        constructor(arg?: ModelArg<MultiDiffModel>) {
          super(arg);
        }
      }

      const model1 = new MultiDiffModel({
        name: "John",
        age: 30,
        email: "john@example.com",
      });
      const model2 = new MultiDiffModel({
        name: "Jane",
        age: 25,
        email: "jane@example.com",
      });

      const comparison = model1.compare(model2);
      expect(comparison).toBeDefined();
      expect(comparison?.name).toEqual({ current: "John", other: "Jane" });
      expect(comparison?.age).toEqual({ current: 30, other: 25 });
      expect(comparison?.email).toEqual({
        current: "john@example.com",
        other: "jane@example.com",
      });
    });
  });

  describe("Nested Model Comparison", () => {
    it("should detect differences in nested models", () => {
      @model()
      class Address extends Model {
        @required()
        street!: string;

        @required()
        city!: string;

        constructor(arg?: ModelArg<Address>) {
          super(arg);
        }
      }

      @model()
      class Person extends Model {
        @required()
        name!: string;

        @required()
        @type(Address)
        address!: Address;

        constructor(arg?: ModelArg<Person>) {
          super(arg);
        }
      }

      const person1 = new Person({
        name: "John",
        address: { street: "123 Main St", city: "Springfield" },
      });
      const person2 = new Person({
        name: "John",
        address: { street: "456 Oak Ave", city: "Shelbyville" },
      });

      const comparison = person1.compare(person2);
      expect(comparison).toBeDefined();
      expect(comparison?.address).toBeDefined();
      expect(comparison?.address?.street).toEqual({
        current: "123 Main St",
        other: "456 Oak Ave",
      });
      expect(comparison?.address?.city).toEqual({
        current: "Springfield",
        other: "Shelbyville",
      });
    });

    it("should return undefined for identical nested models", () => {
      @model()
      class Inner extends Model {
        @required()
        value!: string;

        constructor(arg?: ModelArg<Inner>) {
          super(arg);
        }
      }

      @model()
      class Outer extends Model {
        @required()
        @type(Inner)
        inner!: Inner;

        constructor(arg?: ModelArg<Outer>) {
          super(arg);
        }
      }

      const data = { inner: { value: "same" } };
      const model1 = new Outer(data);
      const model2 = new Outer(data);

      expect(model1.compare(model2)).toBeUndefined();
    });

    it("should detect deeply nested differences", () => {
      @model()
      class Level3 extends Model {
        @required()
        deepValue!: string;

        constructor(arg?: ModelArg<Level3>) {
          super(arg);
        }
      }

      @model()
      class Level2 extends Model {
        @required()
        @type(Level3)
        level3!: Level3;

        constructor(arg?: ModelArg<Level2>) {
          super(arg);
        }
      }

      @model()
      class Level1 extends Model {
        @required()
        @type(Level2)
        level2!: Level2;

        constructor(arg?: ModelArg<Level1>) {
          super(arg);
        }
      }

      const model1 = new Level1({
        level2: { level3: { deepValue: "original" } },
      });
      const model2 = new Level1({
        level2: { level3: { deepValue: "modified" } },
      });

      const comparison = model1.compare(model2);
      expect(comparison).toBeDefined();
      expect(comparison?.level2?.level3?.deepValue).toEqual({
        current: "original",
        other: "modified",
      });
    });
  });

  describe("List Comparison", () => {
    it("should return undefined for identical lists", () => {
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

      expect(model1.compare(model2)).toBeUndefined();
    });

    it("should detect differences in list items", () => {
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
        items: [{ name: "Item1" }, { name: "Changed" }],
      });

      const comparison = model1.compare(model2);
      expect(comparison).toBeDefined();
      expect(comparison?.items).toBeDefined();
    });

    it("should detect differences in list lengths", () => {
      @model()
      class Item extends Model {
        @required()
        name!: string;

        constructor(arg?: ModelArg<Item>) {
          super(arg);
        }
      }

      @model()
      class ListLengthModel extends Model {
        @list(Item)
        items!: Item[];

        constructor(arg?: ModelArg<ListLengthModel>) {
          super(arg);
        }
      }

      const model1 = new ListLengthModel({
        items: [{ name: "Item1" }],
      });
      const model2 = new ListLengthModel({
        items: [{ name: "Item1" }, { name: "Item2" }],
      });

      const comparison = model1.compare(model2);
      expect(comparison).toBeDefined();
      expect(comparison?.items).toBeDefined();
    });
  });

  describe("Comparison with Exceptions", () => {
    it("should skip specified properties from comparison", () => {
      @model()
      class ExceptionModel extends Model {
        @required()
        id!: string;

        @required()
        name!: string;

        updatedAt?: Date;

        constructor(arg?: ModelArg<ExceptionModel>) {
          super(arg);
        }
      }

      const model1 = new ExceptionModel({
        id: "1",
        name: "John",
        updatedAt: new Date("2024-01-01"),
      });
      const model2 = new ExceptionModel({
        id: "1",
        name: "Jane",
        updatedAt: new Date("2024-06-01"),
      });

      // Without exceptions, should find differences
      const fullComparison = model1.compare(model2);
      expect(fullComparison?.name).toBeDefined();

      // With name exception, should only find updatedAt difference
      const partialComparison = model1.compare(model2, "name");
      expect(partialComparison?.name).toBeUndefined();
    });

    it("should skip multiple properties", () => {
      @model()
      class MultiExceptionModel extends Model {
        @prop()
        id!: string;

        @prop()
        name!: string;

        @prop()
        email!: string;

        @prop()
        age!: number;

        constructor(arg?: ModelArg<MultiExceptionModel>) {
          super(arg);
        }
      }

      const model1 = new MultiExceptionModel({
        id: "1",
        name: "John",
        email: "john@example.com",
        age: 30,
      });
      const model2 = new MultiExceptionModel({
        id: "1",
        name: "Jane",
        email: "jane@example.com",
        age: 25,
      });

      const comparison = model1.compare(model2, "name", "email");
      expect(comparison?.name).toBeUndefined();
      expect(comparison?.email).toBeUndefined();
      expect(comparison?.age).toBeDefined();
    });
  });

  describe("Type Differences", () => {
    it("should detect type differences in values", () => {
      @model()
      class TypeDiffModel extends Model {
        @prop()
        value!: any;

        constructor(arg?: ModelArg<TypeDiffModel>) {
          super(arg);
        }
      }

      const stringValue = new TypeDiffModel({ value: "42" });
      const numberValue = new TypeDiffModel({ value: 42 });

      const comparison = stringValue.compare(numberValue);
      expect(comparison).toBeDefined();
      expect(comparison?.value).toEqual({
        current: "42",
        other: 42,
      });
    });
  });

  describe("Null and Undefined Handling", () => {
    it("should treat null and undefined as equivalent for comparison", () => {
      @model()
      class NullableModel extends Model {
        @prop()
        value?: string | null;

        constructor(arg?: ModelArg<NullableModel>) {
          super(arg);
        }
      }

      const withNull = new NullableModel({ value: null });
      const withUndefined = new NullableModel({ value: undefined });

      // Library treats null and undefined as equivalent
      const comparison = withNull.compare(withUndefined);
      expect(comparison).toBeUndefined();
    });

    it("should detect value vs undefined differences", () => {
      @model()
      class ValueNullModel extends Model {
        @prop()
        value?: string | null;

        constructor(arg?: ModelArg<ValueNullModel>) {
          super(arg);
        }
      }

      const withValue = new ValueNullModel({ value: "test" });
      const withUndefined = new ValueNullModel({ value: undefined });

      const comparison = withValue.compare(withUndefined);
      expect(comparison).toBeDefined();
      expect(comparison?.value).toEqual({
        current: "test",
        other: undefined,
      });
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle comprehensive model comparison", () => {
      @model()
      class Tag extends Model {
        @required()
        name!: string;

        constructor(arg?: ModelArg<Tag>) {
          super(arg);
        }
      }

      @model()
      class Author extends Model {
        @required()
        @minlength(2)
        name!: string;

        @email()
        email!: string;

        constructor(arg?: ModelArg<Author>) {
          super(arg);
        }
      }

      @model()
      class Article extends Model {
        @required()
        title!: string;

        content!: string;

        @type(Author)
        author!: Author;

        @list(Tag)
        tags!: Tag[];

        constructor(arg?: ModelArg<Article>) {
          super(arg);
        }
      }

      const article1 = new Article({
        title: "Original Title",
        content: "Original content",
        author: { name: "John", email: "john@example.com" },
        tags: [{ name: "tech" }, { name: "programming" }],
      });

      const article2 = new Article({
        title: "Modified Title",
        content: "Original content",
        author: { name: "John", email: "john@different.com" },
        tags: [{ name: "tech" }, { name: "coding" }],
      });

      const comparison = article1.compare(article2);

      expect(comparison).toBeDefined();
      expect(comparison?.title).toEqual({
        current: "Original Title",
        other: "Modified Title",
      });
      expect(comparison?.content).toBeUndefined(); // Same content
      expect(comparison?.author?.email).toEqual({
        current: "john@example.com",
        other: "john@different.com",
      });
    });

    it("should be consistent with equals method", () => {
      @model()
      class ConsistencyModel extends Model {
        @required()
        value!: string;

        constructor(arg?: ModelArg<ConsistencyModel>) {
          super(arg);
        }
      }

      const model1 = new ConsistencyModel({ value: "same" });
      const model2 = new ConsistencyModel({ value: "same" });
      const model3 = new ConsistencyModel({ value: "different" });

      // When equals is true, compare should be undefined
      expect(model1.equals(model2)).toBe(true);
      expect(model1.compare(model2)).toBeUndefined();

      // When equals is false, compare should have differences
      expect(model1.equals(model3)).toBe(false);
      expect(model1.compare(model3)).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty models", () => {
      @model()
      class EmptyModel extends Model {
        constructor(arg?: ModelArg<EmptyModel>) {
          super(arg);
        }
      }

      const model1 = new EmptyModel();
      const model2 = new EmptyModel();

      expect(model1.compare(model2)).toBeUndefined();
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
      expect(instance.compare(instance)).toBeUndefined();
    });

    it("should handle models with default values", () => {
      @model()
      class DefaultModel extends Model {
        @prop()
        value: string = "default";

        @prop()
        count: number = 0;

        constructor(arg?: ModelArg<DefaultModel>) {
          super(arg);
        }
      }

      const model1 = new DefaultModel();
      const model2 = new DefaultModel({ value: "custom", count: 10 });

      const comparison = model1.compare(model2);
      expect(comparison?.value).toEqual({
        current: "default",
        other: "custom",
      });
      expect(comparison?.count).toEqual({ current: 0, other: 10 });
    });
  });
});
