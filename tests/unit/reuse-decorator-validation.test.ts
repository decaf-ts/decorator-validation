import "reflect-metadata";
import {
  Model,
  ModelArg,
  propMetadata,
  required,
  Validation,
  ValidationMetadata,
  Validator,
  validator,
  ValidatorOptions,
} from "../../src";
import { apply } from "@decaf-ts/reflection";

function generateGtin() {
  function pad(num: number, width: number, padding: string = "0") {
    const n = num + "";
    return n.length >= width
      ? n
      : new Array(width - n.length + 1).join(padding) + n;
  }

  const beforeChecksum = pad(Math.floor(Math.random() * 9999999999999), 13); // has to be 13. the checksum is the 4th digit
  const checksum = calculateGtinCheckSum(beforeChecksum);
  return `${beforeChecksum}${checksum}`;
}

// https://www.gs1.org/services/how-calculate-check-digit-manually
function calculateGtinCheckSum(digits: string): string {
  digits = "" + digits;
  if (digits.length !== 13) throw new Error("needs to received 13 digits");
  const multiplier = [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3];
  let sum = 0;
  try {
    // multiply each digit for its multiplier according to the table
    for (let i = 0; i < 13; i++)
      sum += parseInt(digits.charAt(i)) * multiplier[i];

    // Find the nearest equal or higher multiple of ten
    const remainder = sum % 10;
    let nearest;
    if (remainder === 0) nearest = sum;
    else nearest = sum - remainder + 10;

    return nearest - sum + "";
  } catch (e) {
    throw new Error(`Did this received numbers? ${e}`);
  }
}

const CUSTOM_VALIDATION_KEY = "gtin";
const CUSTOM_VALIDATION_ERROR_MESSAGE = "Not a valid Gtin";
const CUSTOM_VALIDATION_REQUIRED_ERROR_MESSAGE = "Gtin is required";

@validator(CUSTOM_VALIDATION_KEY)
class GtinValidator extends Validator {
  constructor(message: string = CUSTOM_VALIDATION_ERROR_MESSAGE) {
    super(message);
  }

  hasErrors(
    value: number | string,
    options?: ValidatorOptions
  ): string | undefined {
    if (value === undefined) return;

    const { message } = options || {};
    const gtin = value + "";
    if (!gtin.match(/\d{14}/g)) return this.getMessage(message || this.message);

    const digits = gtin.slice(0, 13);
    const checksum = calculateGtinCheckSum(digits);
    return parseInt(checksum) === parseInt(gtin.charAt(13))
      ? undefined
      : this.getMessage(message || this.message);
  }
}

const gtin = (message: string = CUSTOM_VALIDATION_ERROR_MESSAGE) => {
  return apply(
    required(CUSTOM_VALIDATION_REQUIRED_ERROR_MESSAGE),
    propMetadata<ValidationMetadata>(Validation.key(CUSTOM_VALIDATION_KEY), {
      message: message,
      types: [String.name, Number.name],
    })
  );
};

class TestModel extends Model {
  @gtin()
  customProp!: number | string;

  constructor(model?: ModelArg<TestModel>) {
    super();
    Model.fromObject<TestModel>(this, model);
  }
}

describe("Validation with custom decorators test", function () {
  const validGtin = generateGtin();
  const invalidGtin = "0000000000000";

  it("Invalid test", function () {
    const dm = new TestModel({
      customProp: invalidGtin,
    });

    const errors = dm.hasErrors();
    expect(errors).toBeDefined();
    if (errors) {
      expect(Object.keys(errors)).toBeInstanceOf(Array);
      expect(Object.keys(errors).length).toBe(1);
      expect(errors.toString()).toBe(
        "customProp - " + CUSTOM_VALIDATION_ERROR_MESSAGE
      );
    }
  });

  it("Invalid inner required test", function () {
    const dm = new TestModel();

    const errors = dm.hasErrors();
    expect(errors).toBeDefined();
    if (errors) {
      expect(Object.keys(errors)).toBeInstanceOf(Array);
      expect(Object.keys(errors).length).toBe(1);
      expect(errors.toString()).toBe(
        "customProp - " + CUSTOM_VALIDATION_REQUIRED_ERROR_MESSAGE
      );
    }
  });

  it("Valid test", function () {
    const dm = new TestModel({
      customProp: validGtin,
    });

    Validation.register(new GtinValidator() as Validator);

    const errors = dm.hasErrors();
    expect(errors).toBeUndefined();
  });
});
