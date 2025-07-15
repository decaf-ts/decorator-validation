import * as fc from "fast-check";
import {
  Model,
  required,
  min,
  max,
  minlength,
  maxlength,
  pattern,
  email,
  url,
  date,
  model,
} from "../../src";

// Test Model with basic validation decorators
@model()
class FuzzTestModel extends Model {
  @required()
  @minlength(1)
  @maxlength(100)
  name!: string;

  @required()
  @min(0)
  @max(150)
  age!: number;

  @email()
  emailAddress?: string;

  @url()
  website?: string;

  @pattern(/^[a-zA-Z0-9_]+$/)
  username?: string;

  @date()
  birthDate?: Date;

  constructor(data?: any) {
    super(data);
    if (data) {
      Model.fromModel(this, data);
    }
  }
}

describe("FuzzTestModel - Basic Validation", () => {
  // Property-based test for valid model creation
  test("should create valid models with generated data", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          age: fc.integer({ min: -150, max: 150 }),
          emailAddress: fc.option(fc.emailAddress()),
          website: fc.option(fc.webUrl()),
          username: fc.option(
            fc.string().filter((s) => /^[a-zA-Z0-9_]+$/.test(s))
          ),
          birthDate: fc.option(fc.date()),
        }),
        (data) => {
          const model = new FuzzTestModel(data);
          const errors = model.hasErrors();
          expect(errors).toBeUndefined();
        }
      ),
      { verbose: 1, numRuns: 1000 }
    );
  });

  // Fuzz test for invalid data scenarios
  test("should handle invalid string lengths gracefully", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.oneof(
            fc.string({ minLength: 101 }), // Too long
            fc.constant("") // Empty string
          ),
          age: fc.integer({ min: 0, max: 150 }),
        }),
        (data) => {
          const model = new FuzzTestModel(data);
          const errors = model.hasErrors();
          expect(errors).toBeDefined();
          expect(typeof errors).toBe("object");
        }
      ),
      { verbose: 1, numRuns: 500 }
    );
  });

  // Fuzz test for invalid age values
  test("should handle invalid age values gracefully", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          age: fc.oneof(
            fc.integer({ min: -1000, max: -1 }), // Negative
            fc.integer({ min: 151, max: 1000 }) // Too high
          ),
        }),
        (data) => {
          const model = new FuzzTestModel(data);
          const errors = model.hasErrors();
          expect(errors).toBeDefined();
        }
      ),
      { verbose: 1, numRuns: 500 }
    );
  });

  // Fuzz test for invalid email formats
  test("should handle invalid email formats gracefully", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          age: fc.integer({ min: 0, max: 150 }),
          emailAddress: fc.string().filter((s) => !s.includes("@")),
        }),
        (data) => {
          const model = new FuzzTestModel(data);
          const errors = model.hasErrors();
          // Should have email validation error if emailAddress is provided but invalid
          if (data.emailAddress) {
            expect(errors).toBeDefined();
          }
        }
      ),
      { verbose: 1, numRuns: 500 }
    );
  });

  // Fuzz test for edge cases with undefined/null values
  test("should handle null and undefined values appropriately", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.oneof(
            fc.string({ minLength: 1, maxLength: 100 }),
            fc.constant(null),
            fc.constant(undefined)
          ),
          age: fc.oneof(
            fc.integer({ min: 0, max: 150 }),
            fc.constant(null),
            fc.constant(undefined)
          ),
          emailAddress: fc.oneof(
            fc.emailAddress(),
            fc.constant(null),
            fc.constant(undefined)
          ),
        }),
        (data) => {
          expect(() => {
            const model = new FuzzTestModel(data);
            model.hasErrors(); // Should not throw
          }).not.toThrow();
        }
      ),
      { verbose: 1, numRuns: 1000 }
    );
  });

  // Test with completely random data structure
  test("should handle arbitrary data structures without crashing", () => {
    fc.assert(
      fc.property(fc.anything(), (data) => {
        expect(() => {
          const model = new FuzzTestModel(data);
          model.hasErrors();
        }).not.toThrow();
      }),
      { verbose: 1, numRuns: 1000 }
    );
  });
});
