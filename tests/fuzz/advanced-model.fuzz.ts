import * as fc from "fast-check";
import {
  Model,
  required,
  min,
  eq,
  gt,
  gte,
  list,
  set,
  type,
  model,
} from "../../src";

// Test nested model validation
@model()
class NestedModel extends Model {
  @required()
  @min(1)
  id!: number;

  @required()
  name!: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      Model.fromModel(this, data);
    }
  }
}

// Test model with comparison validators and collections
@model()
class AdvancedTestModel extends Model {
  @required()
  @min(0)
  minValue!: number;

  @required()
  @gte("minValue")
  maxValue!: number;

  @required()
  startDate!: Date;

  @required()
  @gt("startDate")
  endDate!: Date;

  @required()
  password!: string;

  @required()
  @eq("password")
  confirmPassword!: string;

  @list(NestedModel)
  items?: NestedModel[];

  @set(NestedModel)
  uniqueItems?: Set<NestedModel>;

  @type("string")
  description?: string;

  constructor(data?: any) {
    super(data);
    if (data) {
      Model.fromModel(this, data);
    }
  }
}

describe("AdvancedTestModel - Complex Validation", () => {
  // Test comparison validators with valid data
  test("should validate comparison constraints correctly", () => {
    fc.assert(
      fc.property(
        fc
          .record({
            minValue: fc.integer({ min: 0, max: 100 }),
            password: fc.string({ minLength: 8 }),
          })
          .chain(({ minValue, password }) =>
            fc
              .record({
                minValue: fc.constant(minValue),
                maxValue: fc.integer({ min: minValue, max: minValue + 100 }),
                startDate: fc.date({
                  min: new Date("2020-01-01"),
                  max: new Date("2023-12-31"),
                }),
                password: fc.constant(password),
                confirmPassword: fc.constant(password),
              })
              .chain(
                ({
                  minValue,
                  maxValue,
                  startDate,
                  password,
                  confirmPassword,
                }) =>
                  fc.record({
                    minValue: fc.constant(minValue),
                    maxValue: fc.constant(maxValue),
                    startDate: fc.constant(startDate),
                    endDate: fc.date({
                      min: new Date(startDate.getTime() + 86400000),
                    }), // At least 1 day later
                    password: fc.constant(password),
                    confirmPassword: fc.constant(confirmPassword),
                  })
              )
          ),
        (data) => {
          const model = new AdvancedTestModel(data);
          const errors = model.hasErrors();
          expect(errors).toBeUndefined();
        }
      ),
      { verbose: 1, numRuns: 500 }
    );
  });

  // Test comparison validators with invalid data
  test("should detect comparison constraint violations", () => {
    fc.assert(
      fc.property(
        fc.record({
          minValue: fc.integer({ min: 50, max: 100 }),
          maxValue: fc.integer({ min: 0, max: 49 }), // maxValue < minValue
          startDate: fc.date({
            min: new Date("2020-01-01"),
            max: new Date("2023-12-31"),
          }),
          endDate: fc.date({
            min: new Date("2020-01-01"),
            max: new Date("2023-12-31"),
          }),
          password: fc.string({ minLength: 8 }),
          confirmPassword: fc.string({ minLength: 8 }),
        }),
        (data) => {
          const model = new AdvancedTestModel(data);
          const errors = model.hasErrors();
          // Should have validation errors for comparison constraints
          expect(errors).toBeDefined();
        }
      ),
      { verbose: 1, numRuns: 500 }
    );
  });

  // Test list validation with nested models
  test("should validate nested model lists correctly", () => {
    fc.assert(
      fc.property(
        fc
          .record({
            minValue: fc.integer({ min: 0, max: 50 }),
            password: fc.string({ minLength: 8 }),
          })
          .chain(({ minValue, password }) =>
            fc
              .record({
                minValue: fc.constant(minValue),
                maxValue: fc.integer({ min: minValue, max: minValue + 50 }),
                startDate: fc.date({
                  min: new Date("2020-01-01"),
                  max: new Date("2023-12-31"),
                }),
                password: fc.constant(password),
                confirmPassword: fc.constant(password),
                items: fc.array(
                  fc.record({
                    id: fc.integer({ min: 1, max: 1000 }),
                    name: fc.string({ minLength: 1, maxLength: 50 }),
                  }),
                  { minLength: 0, maxLength: 10 }
                ),
              })
              .chain(
                ({
                  minValue,
                  maxValue,
                  startDate,
                  password,
                  confirmPassword,
                  items,
                }) =>
                  fc.record({
                    minValue: fc.constant(minValue),
                    maxValue: fc.constant(maxValue),
                    startDate: fc.constant(startDate),
                    endDate: fc.date({
                      min: new Date(startDate.getTime() + 86400000),
                    }),
                    password: fc.constant(password),
                    confirmPassword: fc.constant(confirmPassword),
                    items: fc.constant(items),
                  })
              )
          ),
        (data) => {
          const model = new AdvancedTestModel(data);
          const errors = model.hasErrors();
          expect(errors).toBeUndefined();
        }
      ),
      { verbose: 1, numRuns: 300 }
    );
  });

  // Test with malformed nested model data
  test("should handle malformed nested model data gracefully", () => {
    fc.assert(
      fc.property(
        fc.record({
          minValue: fc.integer({ min: 0, max: 50 }),
          maxValue: fc.integer({ min: 51, max: 100 }),
          startDate: fc.date(),
          endDate: fc.date(),
          password: fc.string({ minLength: 8 }),
          confirmPassword: fc.string({ minLength: 8 }),
          items: fc.array(fc.anything(), { maxLength: 5 }), // Random data as nested items
        }),
        (data) => {
          expect(() => {
            const model = new AdvancedTestModel(data);
            model.hasErrors();
          }).not.toThrow();
        }
      ),
      { verbose: 1, numRuns: 500 }
    );
  });

  // Test type validation with various data types
  test("should validate type constraints correctly", () => {
    fc.assert(
      fc.property(
        fc.record({
          minValue: fc.integer({ min: 0, max: 50 }),
          maxValue: fc.integer({ min: 51, max: 100 }),
          startDate: fc.date(),
          endDate: fc.date(),
          password: fc.string({ minLength: 8 }),
          confirmPassword: fc.string({ minLength: 8 }),
          description: fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.object(),
            fc.array(fc.anything())
          ),
        }),
        (data) => {
          const model = new AdvancedTestModel(data);
          const errors = model.hasErrors();

          // If description is not a string, there should be a type validation error
          if (
            data.description !== undefined &&
            typeof data.description !== "string"
          ) {
            expect(errors).toBeDefined();
          }
        }
      ),
      { verbose: 1, numRuns: 500 }
    );
  });

  // Stress test with deeply nested and complex data
  test("should handle deeply nested complex data structures", () => {
    fc.assert(
      fc.property(fc.object({ maxDepth: 5 }), (data) => {
        expect(() => {
          const model = new AdvancedTestModel(data);
          model.hasErrors();
        }).not.toThrow();
      }),
      { verbose: 1, numRuns: 200 }
    );
  });
});
