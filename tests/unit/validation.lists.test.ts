import {
  AsyncValidator,
  list,
  maxlength,
  minlength,
  Model,
  ModelArg,
  ModelErrorDefinition,
  propMetadata,
  required,
  validate,
  Validation,
  ValidationMetadata,
  validator,
} from "../../src";
import "reflect-metadata";

const CUSTOM_VALIDATION_KEY = "timeout";
const CUSTOM_VALIDATION_ERROR_MESSAGE = "Timeout reached";

@validator(CUSTOM_VALIDATION_KEY)
class TimeoutValidator extends AsyncValidator<{
  message: string;
  timeout?: number;
  async?: boolean;
}> {
  constructor(message: string = CUSTOM_VALIDATION_ERROR_MESSAGE) {
    super(message);
  }

  override async hasErrors(
    value: number,
    options?: { message: string; timeout?: number }
  ): Promise<string | undefined> {
    const delay = options?.timeout ?? 100;

    await new Promise((res) => setTimeout(res, delay));

    if (value > delay) {
      throw new Error(this.getMessage(options?.message));
    }

    return Promise.resolve(undefined);
  }
}

const timeout = (message: string = CUSTOM_VALIDATION_ERROR_MESSAGE) => {
  return propMetadata<ValidationMetadata>(
    Validation.key(CUSTOM_VALIDATION_KEY),
    {
      message: message,
      types: ["number"],
    }
  );
};

class TestModel extends Model {
  @timeout()
  delay!: number;

  constructor(model?: ModelArg<TestModel>) {
    super(model);
    Model.fromObject<TestModel>(this, model);
  }
}

const isPromise = (obj: any): obj is Promise<any> =>
  !!obj && typeof obj.then === "function" && typeof obj.catch === "function";

describe("validation-lists", () => {
  // Helper function to simulate delay
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  describe("validation sync lists", () => {
    class SyncItemModel extends Model {
      @required()
      name!: string;
    }

    class SyncRootModel extends Model {
      @list(SyncItemModel)
      @minlength(1)
      @maxlength(2)
      items!: SyncItemModel[];

      @list(Number)
      numbers!: number[];
    }

    it("should pass with correct data", () => {
      const model = new SyncRootModel();
      model.items = [new SyncItemModel({ name: "Item 1" })];
      model.numbers = [1, 2, 3]; // @maxlength not applied here

      const errors = validate(model, false);
      expect(errors).toBeUndefined();
    });

    it("should fail with more than 2 items (@maxlength)", () => {
      const model = new SyncRootModel();
      model.items = [
        new SyncItemModel({ name: "Item 1" }),
        new SyncItemModel({ name: "Item 2" }),
        new SyncItemModel({ name: "Item 3" }), // Exceeds maxlength
      ];

      const errors = validate(model, false);
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors?.errors["items"]).toContain("maxlength");
    });

    it("should fail if any SyncItemModel has empty name", () => {
      const model = new SyncRootModel();
      model.items = [new SyncItemModel({ name: "" })]; // Invalid name

      const errors = validate(model, false);
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors?.errors["items.0.name"]).toContain("required");
    });
  });

  describe("validation async lists", () => {
    class ItemModel extends Model {
      @timeout(100) // Simulates async validator with 100ms timeout
      value!: number;
    }

    class RootModel extends Model {
      @list(ItemModel)
      @minlength(1)
      @maxlength(2)
      items!: ItemModel[];

      @list(String)
      strings!: Set<string>;

      // Properties that should be ignored in tests
      numbers!: number[]; // Without @list - should be ignored via propsToIgnore

      @list(Number)
      invalidStrings!: string[]; // Wrong type - should be ignored

      @list(Number)
      invalidObject!: {}; // Wrong type - should be ignored
    }

    it("should pass with valid data", async () => {
      const model = new RootModel();
      model.items = [new ItemModel({ value: 1 }), new ItemModel({ value: 2 })];
      model.strings = new Set(["a", "b"]);

      // Invalid properties that should be ignored
      model.numbers = [1, 2, 3];
      model.invalidStrings = ["a", "b"] as any;
      model.invalidObject = {} as any;

      const errors = await validate(
        model,
        true,
        "numbers",
        "invalidStrings",
        "invalidObject"
      );
      expect(errors).toBeUndefined();
    });

    it("should fail if an ItemModel list item exceeds timeout", async () => {
      class SlowItemModel extends ItemModel {
        @timeout(10) // Very short timeout to simulate failure
        override value!: number;

        constructor(data: { value: number }) {
          super(data);
          // Simulates a long operation
          this.value = data.value;
          delay(100).then(() => {}); // Operation that will exceed timeout
        }
      }

      const model = new RootModel();
      model.items = [new SlowItemModel({ value: 1 })];
      model.strings = new Set(["valid"]);

      const errors = await validate(model, true);
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors?.errors["items.0.value"]).toContain("timeout");
    });
  });

  describe("validation edge cases", () => {
    it("should throw when Array has no @list decorator", () => {
      class InvalidModel extends Model {
        numbers!: number[]; // Missing @list decorator
      }

      const model = new InvalidModel();
      model.numbers = [1, 2, 3];

      expect(() => validate(model, false)).toThrow(
        "requires a @list decorator"
      );
    });

    it("should throw when @list property is neither Array nor Set", () => {
      class InvalidModel extends Model {
        @list(Number)
        notAnArray!: string; // Wrong type
      }

      const model = new InvalidModel();
      model.notAnArray = "not an array";

      expect(() => validate(model, false)).toThrow(
        "must be either an array or a Set"
      );
    });

    it("should validate Set<number> correctly", () => {
      class NumberSetModel extends Model {
        @list(Number)
        numbers!: Set<number>;
      }

      const model = new NumberSetModel();
      model.numbers = new Set([1, 2, 3]);

      const errors = validate(model, false);
      expect(errors).toBeUndefined();
    });

    it("should fail with wrong types in Set", () => {
      class InvalidSetModel extends Model {
        @list(Number)
        numbers!: Set<string>; // Wrong type
      }

      const model = new InvalidSetModel();
      model.numbers = new Set(["a", "b"] as any);

      const errors = validate(model, false);
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors?.errors["numbers"]).toBeDefined();
    });

    it("should handle mixed valid lists correctly", () => {
      class MixedModel extends Model {
        @list(String)
        strings!: string[];

        @list(Number)
        numbers!: number[];

        @list(SyncItemModel)
        @minlength(1)
        items!: SyncItemModel[];
      }

      const model = new MixedModel();
      model.strings = ["a", "b"];
      model.numbers = [1, 2, 3];
      model.items = [new SyncItemModel({ name: "Valid" })];

      const errors = validate(model, false);
      expect(errors).toBeUndefined();
    });

    it("should fail on empty Set with @minlength", () => {
      class MinLengthModel extends Model {
        @list(String)
        @minlength(1)
        strings!: Set<string>;
      }

      const model = new MinLengthModel();
      model.strings = new Set(); // Empty set

      const errors = validate(model, false);
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors?.errors["strings"]).toContain("minlength");
    });

    it("should fail on list exceeding @maxlength", () => {
      class MaxLengthModel extends Model {
        @list(Number)
        @maxlength(2)
        numbers!: number[];
      }

      const model = new MaxLengthModel();
      model.numbers = [1, 2, 3]; // Exceeds maxlength

      const errors = validate(model, false);
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors?.errors["numbers"]).toContain("maxlength");
    });

    it("should handle mixed invalid elements in @list(Model)", () => {
      class MixedElementsModel extends Model {
        @list(SyncItemModel)
        items!: (SyncItemModel | undefined | null | object)[];
      }

      const model = new MixedElementsModel();
      model.items = [
        new SyncItemModel({ name: "Valid" }),
        undefined,
        null,
        { not: "a model" },
        new SyncItemModel({ name: "" }), // Invalid model
      ];

      const errors = validate(model, false);
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors?.errors["items.1"]).toContain("validatable type");
      expect(errors?.errors["items.3"]).toContain("validatable type");
      expect(errors?.errors["items.4.name"]).toContain("required");
    });
  });
});
