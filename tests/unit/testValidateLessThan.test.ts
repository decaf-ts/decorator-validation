import type { ModelArg } from "../../src";
import {
  COMPARISON_ERROR_MESSAGES,
  date,
  DEFAULT_ERROR_MESSAGES,
  diff,
  eq,
  gt,
  gte,
  list,
  lt,
  lte,
  model,
  Model,
  ModelErrorDefinition,
  required,
  sf,
  type,
  VALIDATION_PARENT_KEY,
  ValidationKeys,
} from "../../src";

describe("LessThan Validator", () => {
  it("should validate all LessThanError cases", () => {
    @model()
    class TestModelLT extends Model {
      @required()
      comparisonValue!: number;

      @lt("comparisonValue")
      testValue!: string;

      constructor(model?: ModelArg<TestModelLT>) {
        super();
        Model.fromObject(this, model);
      }
    }

    // NaN values
    const nanModel = new TestModelLT({
      testValue: NaN,
      comparisonValue: 10,
    });

    expect(nanModel.hasErrors()).toEqual(
      new ModelErrorDefinition({
        testValue: {
          [ValidationKeys.TYPE]:
            "Invalid type. Expected String, received number",
          [ValidationKeys.LESS_THAN]: expect.stringContaining(
            COMPARISON_ERROR_MESSAGES.NAN_COMPARISON
          ),
        },
      })
    );
  });
});
