/**
 * @description E2E tests for validation functionality
 * Tests hasErrors, validate, and error handling against src/lib/dist builds
 */
import {
  getLibrary,
  TEST_ROOT,
  // Decorators must be imported statically for TypeScript transpilation
  model,
  required,
  min,
  max,
  minlength,
  maxlength,
  email,
  list,
  type,
} from "./e2e.config";
import type {
  Model as ModelType,
  ModelArg,
  ModelErrorDefinition as ModelErrorDefinitionType,
} from "./e2e.config";

describe(`E2E Validation Tests [${TEST_ROOT}]`, () => {
  let lib: Awaited<ReturnType<typeof getLibrary>>;
  let Model: typeof ModelType;
  let ModelErrorDefinition: typeof ModelErrorDefinitionType;
  let validate: (typeof lib)["validate"];
  let ValidationKeys: (typeof lib)["ValidationKeys"];

  beforeAll(async () => {
    lib = await getLibrary();
    Model = lib.Model;
    ModelErrorDefinition = lib.ModelErrorDefinition;
    validate = lib.validate;
    ValidationKeys = lib.ValidationKeys;
  });

  describe("Basic Validation", () => {
    it("should return undefined for valid model", () => {
      @model()
      class ValidModel extends Model {
        @required()
        name!: string;

        @min(0)
        @max(100)
        age!: number;

        constructor(arg?: ModelArg<ValidModel>) {
          super(arg);
        }
      }

      const instance = new ValidModel({ name: "John", age: 25 });
      const errors = instance.hasErrors();
      expect(errors).toBeUndefined();
    });

    it("should return ModelErrorDefinition for invalid model", () => {
      @model()
      class InvalidModel extends Model {
        @required()
        name!: string;

        @min(0)
        @max(100)
        age!: number;

        constructor(arg?: ModelArg<InvalidModel>) {
          super(arg);
        }
      }

      const instance = new InvalidModel({ age: 150 });
      const errors = instance.hasErrors();

      expect(errors).toBeDefined();
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
    });

    it("should collect all validation errors", () => {
      @model()
      class MultiErrorModel extends Model {
        @required()
        @minlength(5)
        name!: string;

        @required()
        @min(0)
        @max(100)
        age!: number;

        @email()
        email!: string;

        constructor(arg?: ModelArg<MultiErrorModel>) {
          super(arg);
        }
      }

      const instance = new MultiErrorModel({
        name: "ab",
        age: 150,
        email: "invalid",
      });
      const errors = instance.hasErrors();

      expect(errors).toBeDefined();
      expect(errors?.["name"][ValidationKeys.MIN_LENGTH]).toBeDefined();
      expect(errors?.["age"][ValidationKeys.MAX]).toBeDefined();
      expect(errors?.["email"][ValidationKeys.EMAIL]).toBeDefined();
    });

    it("should format errors as string correctly", () => {
      @model()
      class StringErrorModel extends Model {
        @required()
        field1!: string;

        @min(10)
        field2!: number;

        constructor(arg?: ModelArg<StringErrorModel>) {
          super(arg);
        }
      }

      const instance = new StringErrorModel({ field2: 5 });
      const errors = instance.hasErrors();

      expect(errors).toBeDefined();
      const errorString = errors!.toString();
      expect(typeof errorString).toBe("string");
      expect(errorString).toContain("field1");
      expect(errorString).toContain("field2");
    });
  });

  describe("Validation with Exceptions", () => {
    it("should skip specified properties during validation", () => {
      @model()
      class ExceptionModel extends Model {
        @required()
        field1!: string;

        @required()
        field2!: string;

        @required()
        field3!: string;

        constructor(arg?: ModelArg<ExceptionModel>) {
          super(arg);
        }
      }

      const instance = new ExceptionModel();
      const allErrors = instance.hasErrors();
      expect(Object.keys(allErrors || {}).length).toBe(3);

      const partialErrors = instance.hasErrors("field2");
      expect(partialErrors?.["field1"]).toBeDefined();
      expect(partialErrors?.["field2"]).toBeUndefined();
      expect(partialErrors?.["field3"]).toBeDefined();

      const multiSkipErrors = instance.hasErrors("field1", "field3");
      expect(multiSkipErrors?.["field1"]).toBeUndefined();
      expect(multiSkipErrors?.["field2"]).toBeDefined();
      expect(multiSkipErrors?.["field3"]).toBeUndefined();
    });
  });

  describe("Nested Model Validation", () => {
    it("should validate nested models", () => {
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

      const invalidAddress = new Person({
        name: "John",
        address: { city: "Springfield" },
      });

      const errors = invalidAddress.hasErrors();
      expect(errors).toBeDefined();
      expect(
        errors?.["address.street"] || errors?.["address"]?.["street"]
      ).toBeDefined();
    });

    it("should validate deeply nested models", () => {
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

      const valid = new Level1({
        level2: {
          level3: {
            deepValue: "value",
          },
        },
      });

      expect(valid.hasErrors()).toBeUndefined();

      const invalid = new Level1({
        level2: {
          level3: {},
        },
      });

      expect(invalid.hasErrors()).toBeDefined();
    });
  });

  describe("List Validation", () => {
    it("should validate lists of primitives", () => {
      @model()
      class ListModel extends Model {
        @list(String)
        @minlength(2)
        @maxlength(5)
        @required()
        items!: string[];

        constructor(arg?: ModelArg<ListModel>) {
          super(arg);
        }
      }

      const tooFew = new ListModel({ items: ["a"] });
      expect(tooFew.hasErrors()).toBeDefined();

      const tooMany = new ListModel({
        items: ["a", "b", "c", "d", "e", "f"],
      });
      expect(tooMany.hasErrors()).toBeDefined();

      const valid = new ListModel({ items: ["a", "b", "c"] });
      expect(valid.hasErrors()).toBeUndefined();
    });

    it("should validate lists of models", () => {
      @model()
      class Item extends Model {
        @required()
        name!: string;

        @min(0)
        quantity!: number;

        constructor(arg?: ModelArg<Item>) {
          super(arg);
        }
      }

      @model()
      class Order extends Model {
        @list(Item)
        @minlength(1)
        @required()
        items!: Item[];

        constructor(arg?: ModelArg<Order>) {
          super(arg);
        }
      }

      const validOrder = new Order({
        items: [
          { name: "Item1", quantity: 5 },
          { name: "Item2", quantity: 10 },
        ],
      });
      expect(validOrder.hasErrors()).toBeUndefined();

      const invalidItemInList = new Order({
        items: [{ name: "Item1", quantity: -5 }],
      });
      const errors = invalidItemInList.hasErrors();
      expect(errors).toBeDefined();
    });

    it("should detect invalid list types", () => {
      @model()
      class TypedListModel extends Model {
        @list(Number)
        @required()
        numbers!: number[];

        constructor(arg?: ModelArg<TypedListModel>) {
          super(arg);
        }
      }

      const mixedTypes = new TypedListModel({
        numbers: [1, "two", 3] as any,
      });
      const errors = mixedTypes.hasErrors();
      expect(errors?.["numbers"]?.[ValidationKeys.LIST]).toBeDefined();
    });
  });

  describe("Validate Function", () => {
    it("should validate model synchronously", () => {
      @model()
      class SyncValidateModel extends Model {
        @required()
        name!: string;

        constructor(arg?: ModelArg<SyncValidateModel>) {
          super(arg);
        }
      }

      const instance = new SyncValidateModel();
      const errors = validate(instance, false);

      expect(errors).toBeDefined();
      expect(errors?.["name"]).toBeDefined();
    });

    it("should validate model asynchronously", async () => {
      @model()
      class AsyncValidateModel extends Model {
        @required()
        name!: string;

        constructor(arg?: ModelArg<AsyncValidateModel>) {
          super(arg);
        }
      }

      const instance = new AsyncValidateModel();
      const errors = await validate(instance, true);

      expect(errors).toBeDefined();
      expect(errors?.["name"]).toBeDefined();
    });
  });

  describe("Validation Error Structure", () => {
    it("should structure errors by property and validator", () => {
      @model()
      class StructuredErrorModel extends Model {
        @required()
        @minlength(5)
        @maxlength(10)
        name!: string;

        constructor(arg?: ModelArg<StructuredErrorModel>) {
          super(arg);
        }
      }

      const instance = new StructuredErrorModel({ name: "ab" });
      const errors = instance.hasErrors();

      expect(errors).toBeDefined();
      expect(errors?.["name"]).toBeDefined();
      expect(typeof errors?.["name"]).toBe("object");
      expect(errors?.["name"][ValidationKeys.MIN_LENGTH]).toBeDefined();
    });

    it("should provide meaningful error messages", () => {
      @model()
      class MessageModel extends Model {
        @required("Name is mandatory")
        name!: string;

        @min(0, "Age cannot be negative")
        @max(120, "Age seems unrealistic")
        age!: number;

        constructor(arg?: ModelArg<MessageModel>) {
          super(arg);
        }
      }

      const instance = new MessageModel({ age: -5 });
      const errors = instance.hasErrors();

      expect(errors?.["name"][ValidationKeys.REQUIRED]).toBe("Name is mandatory");
      expect(errors?.["age"][ValidationKeys.MIN]).toBe("Age cannot be negative");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined optional properties", () => {
      @model()
      class OptionalModel extends Model {
        @required()
        required!: string;

        optional?: string;

        @min(0)
        optionalNumber?: number;

        constructor(arg?: ModelArg<OptionalModel>) {
          super(arg);
        }
      }

      const instance = new OptionalModel({ required: "value" });
      expect(instance.hasErrors()).toBeUndefined();
    });

    it("should handle null values appropriately", () => {
      @model()
      class NullableModel extends Model {
        @required()
        required!: string;

        nullable: string | null = null;

        constructor(arg?: ModelArg<NullableModel>) {
          super(arg);
        }
      }

      const instance = new NullableModel({ required: "value" });
      expect(instance.hasErrors()).toBeUndefined();
    });

    it("should handle empty strings for required fields", () => {
      @model()
      class EmptyStringModel extends Model {
        @required()
        name!: string;

        constructor(arg?: ModelArg<EmptyStringModel>) {
          super(arg);
        }
      }

      const emptyString = new EmptyStringModel({ name: "" });
      const errors = emptyString.hasErrors();
      expect(errors?.["name"][ValidationKeys.REQUIRED]).toBeDefined();
    });

    it("should handle zero as valid numeric value", () => {
      @model()
      class ZeroModel extends Model {
        @required()
        @min(0)
        value!: number;

        constructor(arg?: ModelArg<ZeroModel>) {
          super(arg);
        }
      }

      const zeroValue = new ZeroModel({ value: 0 });
      expect(zeroValue.hasErrors()).toBeUndefined();
    });
  });

  describe("Inheritance Validation", () => {
    it("should validate inherited properties", () => {
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

      const missingBase = new DerivedModel({ derivedField: "value" });
      const errors = missingBase.hasErrors();
      expect(errors?.["baseField"]).toBeDefined();

      const valid = new DerivedModel({
        baseField: "base",
        derivedField: "derived",
      });
      expect(valid.hasErrors()).toBeUndefined();
    });

    it("should validate multi-level inheritance", () => {
      class Level1Model extends Model {
        @required()
        level1!: string;

        constructor(arg?: any) {
          super();
          Model.fromObject(this, arg);
        }
      }

      class Level2Model extends Level1Model {
        @required()
        level2!: string;

        constructor(arg?: any) {
          super(arg);
          Model.fromObject(this, arg);
        }
      }

      @model()
      class Level3Model extends Level2Model {
        @required()
        level3!: string;

        constructor(arg?: ModelArg<Level3Model>) {
          super(arg);
        }
      }

      const valid = new Level3Model({
        level1: "L1",
        level2: "L2",
        level3: "L3",
      });
      expect(valid.hasErrors()).toBeUndefined();

      const missing = new Level3Model({
        level3: "L3",
      });
      expect(missing.hasErrors()).toBeDefined();
    });
  });
});
