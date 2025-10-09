import { Constructor, Metadata } from "@decaf-ts/decoration";
import type { ModelArg } from "../../src";
import {
  COMPARISON_ERROR_MESSAGES,
  date,
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

describe("Comparison Validators", () => {
  describe("Child Comparison", () => {
    @model()
    class LessThanTestModel extends Model {
      @required()
      mirrorNumberValue: number = 0;

      @required()
      mirrorDateValue: Date = new Date(0);

      constructor(model?: ModelArg<LessThanTestModel>) {
        super(model);
      }
    }

    describe("LessThanValidator", () => {
      @model()
      class InvalidPropertyModel extends Model {
        @lt("mirror.invalidField")
        numberValue: number = 0;

        @type(LessThanTestModel)
        mirror?: LessThanTestModel;

        constructor(model?: ModelArg<InvalidPropertyModel>) {
          super(model);
        }
      }

      it("should fail if target property does not exist", () => {
        const model = new InvalidPropertyModel({
          numberValue: 10,
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.numberValue).toEqual({
          [ValidationKeys.LESS_THAN]: sf(
            COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_EXIST,
            "invalidField"
          ),
        });
        expect(Object.keys(errors || {}).length).toEqual(1);
      });
    });

    describe("GreaterThanValidator", () => {
      @model()
      class MirrorTestModel extends Model {
        @required()
        mirrorNumberValue: number = 0;

        @required()
        mirrorDateValue: Date = new Date();

        constructor(model?: ModelArg<MirrorTestModel>) {
          super(model);
        }
      }

      @model()
      class InvalidPropertyModel extends Model {
        @gt("inexistentField")
        numberValue: number = 0;
        compareValue = 3;

        @type(MirrorTestModel)
        mirror?: MirrorTestModel;

        constructor(model?: ModelArg<InvalidPropertyModel>) {
          super(model);
        }
      }

      it("should return validation error if compared property does not exist", () => {
        const model = new InvalidPropertyModel({
          numberValue: 10,
        });

        const meta = Metadata.get(model.constructor as any);

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.numberValue).toEqual({
          [ValidationKeys.GREATER_THAN]: sf(
            COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_EXIST,
            "inexistentField"
          ),
        });
      });
    });
  });
});
