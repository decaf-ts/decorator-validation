import "reflect-metadata";
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
  ValidationKeys,
  ValidationMetadata,
  validator,
  ValidatorOptions,
} from "../../src";

const TIMEOUT_VALIDATION_KEY = "timeout";
const TIMEOUT_ERROR_MESSAGE = "Timeout reached";
const CUSTOM_VALIDATION_ERROR_MESSAGE = "Custom validation error";

const isPromise = (obj: any): obj is Promise<any> =>
  !!obj && typeof obj.then === "function" && typeof obj.catch === "function";

export interface TimeoutValidatorOptions extends ValidatorOptions {
  timeout?: number;
}

@validator(TIMEOUT_VALIDATION_KEY)
class TimeoutValidator extends AsyncValidator<{
  message: string;
  timeout?: number;
  async?: boolean;
}> {
  constructor(message: string = TIMEOUT_ERROR_MESSAGE) {
    super(message);
  }

  async hasErrors(
    value: number,
    options?: TimeoutValidatorOptions
  ): Promise<string | undefined> {
    const delay = options?.timeout ?? 100;

    if (value > delay) {
      return this.getMessage(options?.message || this.message);
    }

    await new Promise((res) => setTimeout(res, delay));
    return undefined;
  }
}

const timeout = (message: string = TIMEOUT_ERROR_MESSAGE) => {
  return propMetadata<ValidationMetadata>(
    Validation.key(TIMEOUT_VALIDATION_KEY),
    {
      message: message,
      types: ["number"],
      async: true,
    }
  );
};

class TestChildModel extends Model<true> {
  @timeout()
  childDelayProp!: number;

  constructor(model?: ModelArg<TestChildModel>) {
    super(model, true);
    Model.fromObject<TestChildModel>(this, model);
  }
}

class TestModel extends Model<true> {
  @timeout(CUSTOM_VALIDATION_ERROR_MESSAGE)
  delay!: number;

  @required()
  childDelay!: TestChildModel;

  @list(TestChildModel)
  @minlength(2)
  @maxlength(3)
  models!: TestChildModel[];

  constructor(model?: ModelArg<TestModel>) {
    super(model, true);
    Model.fromObject<TestModel>(this, model);
  }
}

describe("Async Validation", () => {
  beforeAll(() => {
    Validation.register(new TimeoutValidator() as any);
  });

  describe("Promise Verification", () => {
    it("should return a Promise for async validation", async () => {
      const instance = new TestModel({
        delay: 500,
        // childDelay: new TestChildModel({ childDelayProp: 50 }),
        // models: [
        //   new TestChildModel({ childDelayProp: 50 }),
        //   new TestChildModel({ childDelayProp: 50 }),
        // ],
      });

      const validationResult = validate(instance, true);
      expect(isPromise(validationResult)).toBeTruthy();

      const result = await validationResult;
      expect(result).toBeDefined();
      expect(Object.keys(result).length > 0).toBeTruthy();
      expect(result instanceof ModelErrorDefinition).toBeTruthy();
    });

    it("should ignore async decorators when async validation is disabled", async () => {
      const instance = new TestModel({
        delay: 500,
      });

      const validationResult = validate(instance, false);
      expect(isPromise(validationResult)).toBeFalsy();
      expect(validationResult).toEqual(
        new ModelErrorDefinition({
          childDelay: {
            [ValidationKeys.REQUIRED]: "This field is required",
          },
        })
      );
    });

    it("should return a Promise for async model.hasErros validation", async () => {
      const instance = new TestModel({
        delay: 500,
      });

      const validationResult = instance.hasErrors();
      expect(isPromise(validationResult)).toBeTruthy();

      const result = await validationResult;
      expect(result).toBeDefined();
      expect(Object.keys(result).length > 0).toBeTruthy();
      expect(result instanceof ModelErrorDefinition).toBeTruthy();
    });

    it("should return a sync when async mode validation is disabled for model.hasErros validation", async () => {
      const instance = new TestModel({
        delay: 500,
      });

      const validationResult = instance.hasErrors(false);
      throw new Error("Not implemented yet");
      // expect(isPromise(validationResult)).toBeTruthy();
      //
      // const result = await validationResult;
      // expect(result).toBeDefined();
      // expect(Object.keys(result).length > 0).toBeTruthy();
      // expect(result instanceof ModelErrorDefinition).toBeTruthy();
    });
  });

  describe("Async Validation", () => {
    it("should pass validation", async () => {
      const instance = new TestModel({
        delay: 50,
        childDelay: new TestChildModel({ childDelayProp: 50 }),
        models: [
          new TestChildModel({ childDelayProp: 50 }),
          new TestChildModel({ childDelayProp: 50 }),
        ],
      });

      const validationResult = instance.hasErrors();
      expect(isPromise(validationResult)).toBeTruthy();
      expect(await validationResult).toBeUndefined();
    });

    it("should fail validation with timeout error", async () => {
      const instance = new TestModel({
        delay: 150, // Will fail
        childDelay: new TestChildModel({ childDelayProp: 200 }),
        models: [
          new TestChildModel({ childDelayProp: 250 }),
          new TestChildModel({ childDelayProp: 10 }),
          new TestChildModel({ childDelayProp: 500 }),
        ],
      });

      const validationPromise = instance.hasErrors();
      expect(isPromise(validationPromise)).toBeTruthy();

      const validationResult = await validationPromise;
      expect(validationResult).toBeDefined();
      expect(validationResult).toEqual(
        new ModelErrorDefinition({
          delay: {
            timeout: "Custom validation error",
          },
          "childDelay.childDelayProp": {
            timeout: "Timeout reached",
          },
          models: {
            list: [
              new ModelErrorDefinition({
                childDelayProp: { timeout: "Timeout reached" },
              }),
              undefined,
              new ModelErrorDefinition({
                childDelayProp: { timeout: "Timeout reached" },
              }),
            ] as any,
          },
        })
      );
    });

    it("should handle multiple async validations correctly", async () => {
      const instance = new TestModel({
        delay: 150, // Will fail
        childDelay: new TestChildModel({ childDelayProp: 150 }), // Will fail
        models: [
          new TestChildModel({ childDelayProp: 150 }), // Will fail
          new TestChildModel({ childDelayProp: 50 }),
        ],
      });

      const result = await validate(instance, true);
      expect(result).toBeInstanceOf(ModelErrorDefinition);
    });

    it("should fail validation with custom message", async () => {
      const instance = new TestModel({
        delay: 150, // Will fail
        childDelay: new TestChildModel({ childDelayProp: 200 }),
        models: [
          new TestChildModel({ childDelayProp: 250 }),
          new TestChildModel({ childDelayProp: 500 }),
        ],
      });

      const validationPromise = instance.hasErrors();
      expect(isPromise(validationPromise)).toBeTruthy();

      const validationResult = await validationPromise;
      expect(validationResult).toBeDefined();
      expect(validationResult).toMatchObject(
        new ModelErrorDefinition({
          delay: {
            timeout: "Custom validation error",
          },
          "childDelay.childDelayProp": {
            timeout: "Timeout reached",
          },
        })
      );
    });
  });

  describe("List Validation", () => {
    it("should validate all items in the list asynchronously", async () => {
      const instance = new TestModel({
        delay: 50,
        childDelay: new TestChildModel({ childDelayProp: 50 }),
        models: [
          new TestChildModel({ childDelayProp: 50 }),
          new TestChildModel({ childDelayProp: 150 }), // This one should fail
        ],
      });

      const result = await validate(instance, true);
      expect(result).toBeInstanceOf(ModelErrorDefinition);
    });
  });

  describe("Mixed Sync/Async Validation Scenarios", () => {
    describe("Sync Model with Async Validation", () => {
      class SyncOnlyModel extends Model<true> {
        @required()
        name!: string;

        @minlength(5)
        password!: string;

        constructor(model?: ModelArg<SyncOnlyModel>) {
          super(model, true);
          Model.fromObject<SyncOnlyModel>(this, model);
        }
      }

      it("should resolve sync validators when validate is called with async=true", async () => {
        const instance = new SyncOnlyModel({
          name: "John Doe",
          password: "12345",
        });

        const result = await validate(instance, true);
        expect(result).toBeUndefined();
      });

      it("should reject with sync validation errors when validate is called with async=true", async () => {
        const instance = new SyncOnlyModel({
          name: "", // Invalid
          password: "123", // Invalid
        });

        const result = await validate(instance, true);
        expect(result).toBeInstanceOf(ModelErrorDefinition);
        expect(result).toEqual(
          new ModelErrorDefinition({
            name: {
              [ValidationKeys.REQUIRED]: "This field is required",
            },
            password: {
              [ValidationKeys.MIN_LENGTH]: "The minimum length is 5",
            },
          })
        );
      });
    });

    describe("Async Model with Sync Validation", () => {
      it("should ignore async validators when validate is called with sync (false)", () => {
        const instance = new TestModel({
          delay: 150, // Would fail async validation
          childDelay: new TestChildModel({ childDelayProp: 150 }), // Would fail async validation
          models: [
            new TestChildModel({ childDelayProp: 50 }),
            new TestChildModel({ childDelayProp: 50 }),
          ],
        });

        // Should pass because async validators are ignored
        const result = validate(instance, false);
        expect(result).toBeUndefined();
      });

      it("should still apply sync validators when validate is called with sync (false)", () => {
        const instance = new TestModel({
          delay: 50,
          childDelay: undefined, // Invalid (required)
          models: [], // Invalid (minlength)
        });

        const result = validate(instance, false);
        expect(result).toBeInstanceOf(ModelErrorDefinition);
        expect(result).toEqual(
          new ModelErrorDefinition({
            childDelay: {
              [ValidationKeys.REQUIRED]: "This field is required",
            },
            models: {
              [ValidationKeys.MIN_LENGTH]: "The minimum length is 2",
            },
          })
        );
      });
    });
  });
});
