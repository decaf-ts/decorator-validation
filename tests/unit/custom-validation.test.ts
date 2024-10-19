import "reflect-metadata";
import {
  constructFromObject,
  Model,
  ModelArg,
  propMetadata,
  ValidationMetadata,
  validator,
  Validator,
} from "../../src";
import { Validation } from "../../src/validation/Validation";
import { getValidationKey } from "../../src";

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

@validator(CUSTOM_VALIDATION_KEY)
class GtinValidator extends Validator {
  constructor(message: string = CUSTOM_VALIDATION_ERROR_MESSAGE) {
    super(message);
  }

  hasErrors(value: number | string, message?: string): string | undefined {
    if (value === undefined) return;
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
  return propMetadata<ValidationMetadata>(
    getValidationKey(CUSTOM_VALIDATION_KEY),
    {
      message: message,
      types: ["string", "number"],
    }
  );
};

class TestModel extends Model {
  @gtin()
  customProp!: number | string;

  constructor(model?: ModelArg<TestModel>) {
    super(model);
    constructFromObject<TestModel>(this, model);
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
      expect(errors.toString()).toBe("customProp - Not a valid Gtin");
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
