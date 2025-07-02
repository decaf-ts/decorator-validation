import "reflect-metadata";
import {
  AsyncValidator,
  Model,
  ModelArg,
  propMetadata,
  Validation,
  ValidationMetadata,
  validator,
} from "../../src";

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
describe("AsyncValidator", () => {
  beforeAll(() => {
    Validation.register(new TimeoutValidator() as any);
  });

  it("should be a promise", async () => {
    const instance = new TestModel({
      delay: 500,
    });

    const errors = instance.hasErrors();
    const timeoutError = errors["delay"]["timeout"];
    expect(isPromise(timeoutError)).toBeTruthy();
    await expect(timeoutError).rejects.toThrow(CUSTOM_VALIDATION_ERROR_MESSAGE);
  });

  it("should pass", async () => {
    const instance = new TestModel({
      delay: 50,
    });
    const errors = await instance.hasErrors();
    expect(errors).toBeUndefined();
  });

  it("should fail", async () => {
    const instance = new TestModel({
      delay: 50,
    });
    const errors = await instance.hasErrors();
    expect(errors).toBeDefined();
  });
});
