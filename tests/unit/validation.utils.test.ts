import {
  COMPARISON_ERROR_MESSAGES,
  getValueByPath,
  isGreaterThan,
  isLessThan,
  isValidForGteOrLteComparison,
  sf,
} from "../../src";
import { VALIDATION_PARENT_KEY } from "../../src/constants";

describe("Validation Utils", () => {
  describe("getValueByPath", () => {
    const parent = {
      name: "Parent",
      value: "parent.value",
      child: {
        value: "parent.child.value",
      },
      array: [
        { id: "P0", name: "Parent Item 0" },
        { id: "P1", name: "Parent Item 1" },
      ],
      [VALIDATION_PARENT_KEY]: null, // Will be set later
    };

    const grandparent = {
      name: "Grandparent",
      value: "Root Value",
      child: parent,
      array: [
        { id: "GP0", name: "GrandParent id GP0" },
        { id: "GP1", name: "GrandParent id GP1" },
      ],
    };

    (parent as any)[VALIDATION_PARENT_KEY] = grandparent;

    const testObj = {
      name: "Test Object",
      nested: {
        value: "Nested Value",
        array: [100, 200, 300],
      },
      array: [
        { id: 1, name: "First" },
        {
          id: 2,
          name: "Second",
          deep: {
            [VALIDATION_PARENT_KEY]: null, // Will be set later
          },
        },
      ],
      [VALIDATION_PARENT_KEY]: parent,
    };

    (testObj.array[1].deep as any)[VALIDATION_PARENT_KEY] = testObj.array[1];

    it("should get direct property", () => {
      expect(getValueByPath(testObj, "name")).toBe("Test Object");
    });

    it("should get nested property", () => {
      expect(getValueByPath(testObj, "nested.value")).toBe("Nested Value");
    });

    it("should get array element from nested property", () => {
      expect(getValueByPath(testObj, "nested.array.2")).toBe(300);
    });

    it("should access parent value", () => {
      expect(getValueByPath(testObj, "../name")).toBe("Parent");
      expect(getValueByPath(testObj, "../value")).toBe("parent.value");
    });

    it("should access grandparent value", () => {
      expect(getValueByPath(testObj, "../../name")).toBe("Grandparent");
      expect(getValueByPath(testObj, "../../value")).toBe("Root Value");
    });

    it("should combine parent access and normal path", () => {
      expect(getValueByPath(testObj, "../child.value")).toBe(
        "parent.child.value"
      );
    });

    it("should work with array indices", () => {
      expect(getValueByPath(testObj, "array.1.id")).toBe(2);
      expect(getValueByPath(testObj, "array.1.name")).toBe("Second");
    });

    it("should work with parent access from array items", () => {
      expect(getValueByPath(testObj, "../array.0.id")).toBe("P0");
      expect(getValueByPath(testObj, "../array.0.name")).toBe("Parent Item 0");
    });

    it("should work with grandparent access from array items", () => {
      expect(getValueByPath(testObj, "../../array.1.id")).toBe("GP1");
      expect(getValueByPath(testObj, "../../array.1.name")).toBe(
        "GrandParent id GP1"
      );
    });

    it("should throw for non-existent property", () => {
      expect(() => getValueByPath(testObj, "nonexistent")).toThrow(
        "Failed to resolve path nonexistent: property 'nonexistent' does not exist."
      );
    });

    it("should throw for too many parent accesses", () => {
      expect(() => getValueByPath(testObj, "../../../tooFar")).toThrow(
        "Unable to access parent at level 3 for path '../../../tooFar': no parent available"
      );
    });

    it("should throw for invalid path type", () => {
      expect(() => getValueByPath(testObj, 123 as any)).toThrow(
        "Invalid path argument. Expected non-empty string but received: '123'"
      );
    });

    it("should throw for empty path", () => {
      expect(() => getValueByPath(testObj, "")).toThrow(
        "Invalid path argument. Expected non-empty string but received: ''"
      );

      expect(() => getValueByPath(testObj, " ")).toThrow(
        "Invalid path argument. Expected non-empty string but received: ' '"
      );
    });

    it("should throw when parent access is undefined", () => {
      const badObj = { test: "value", [VALIDATION_PARENT_KEY]: undefined };
      expect(() => getValueByPath(badObj, "../test")).toThrow(
        "Unable to access parent at level 1 for path '../test': no parent available"
      );
    });

    it("should throw when access hits non-object", () => {
      expect(() => getValueByPath("not-an-object" as any, "../test")).toThrow(
        "Unable to access parent at level 1 for path '../test': current context is not an object"
      );
    });

    it("should throw when parent access hits non-object", () => {
      const badObj = {
        test: "value",
        [VALIDATION_PARENT_KEY]: "not-an-object",
      };
      expect(() => getValueByPath(badObj, "../test")).toThrow(
        "Failed to resolve path ../test: property 'test' does not exist on parent."
      );

      const grandparentBadObj = { [VALIDATION_PARENT_KEY]: badObj };
      expect(() => getValueByPath(grandparentBadObj, "../../test")).toThrow(
        "Failed to resolve path ../../test: property 'test' does not exist after 2 parent level(s)."
      );
    });
  });

  describe("isValidForGteOrLteComparison", () => {
    it("should return true for supported types", () => {
      // number
      expect(isValidForGteOrLteComparison(5, 10)).toBe(true);

      // bigint
      expect(isValidForGteOrLteComparison(BigInt(100), BigInt(200))).toBe(true);

      // Date
      const date1 = new Date("2023-01-01");
      const date2 = new Date("2023-01-02");
      expect(isValidForGteOrLteComparison(date1, date2)).toBe(true);

      //  vs undefined
      expect(isValidForGteOrLteComparison(undefined, undefined)).toBe(true);
      expect(isValidForGteOrLteComparison(5, undefined)).toBe(true);
      expect(isValidForGteOrLteComparison(new Date(), undefined)).toBe(true);
      expect(isValidForGteOrLteComparison(BigInt(100), undefined)).toBe(true);

      // invalid Date vs valid Date
      expect(
        isValidForGteOrLteComparison(new Date("invalid"), new Date())
      ).toBe(true);
    });

    it("should throw TypeError for unsupported types", () => {
      // string
      expect(() => isValidForGteOrLteComparison("text", 5)).toThrow(
        new TypeError("Unsupported types for comparison: 'string' and 'number'")
      );

      // object
      expect(() => isValidForGteOrLteComparison({}, new Date())).toThrow(
        new TypeError("Unsupported types for comparison: 'object' and 'Date'")
      );

      // null
      expect(() => isValidForGteOrLteComparison(null, BigInt(100))).toThrow(
        new TypeError("Unsupported types for comparison: 'null' and 'bigint'")
      );

      // array
      expect(() => isValidForGteOrLteComparison([1, 2, 3], 5)).toThrow(
        new TypeError("Unsupported types for comparison: 'array' and 'number'")
      );

      // boolean
      expect(() => isValidForGteOrLteComparison(true, new Date())).toThrow(
        new TypeError("Unsupported types for comparison: 'boolean' and 'Date'")
      );

      // symbol
      expect(() => isValidForGteOrLteComparison(Symbol(), 123)).toThrow(
        new TypeError("Unsupported types for comparison: 'symbol' and 'number'")
      );

      // NaN
      expect(() => isValidForGteOrLteComparison(NaN, 123)).toThrow(
        new TypeError("Unsupported types for comparison: 'NaN' and 'number'")
      );

      // Infinity
      expect(() => isValidForGteOrLteComparison(Infinity, 10)).toThrow(
        new TypeError(
          "Unsupported types for comparison: 'Infinity' and 'number'"
        )
      );

      // -Infinity
      expect(() => isValidForGteOrLteComparison(-Infinity, 10)).toThrow(
        new TypeError(
          "Unsupported types for comparison: '-Infinity' and 'number'"
        )
      );
    });
  });

  describe("isLessThan", () => {
    it("should correctly compare numbers", () => {
      expect(isLessThan(5, 10)).toBe(true);
      expect(isLessThan(10, 5)).toBe(false);
      expect(isLessThan(5, 5)).toBe(false);

      // negative
      expect(isLessThan(-5, 0)).toBe(true);
      expect(isLessThan(-10, -5)).toBe(true);
      expect(isLessThan(-5, -10)).toBe(false);

      // decimal
      expect(isLessThan(1.5, 1.6)).toBe(true);
      expect(isLessThan(1.6, 1.5)).toBe(false);

      // Infinity
      expect(isLessThan(Number.MAX_VALUE, Infinity)).toBe(true);
      expect(isLessThan(Number.MIN_VALUE, Infinity)).toBe(true);
      expect(isLessThan(-Infinity, Number.MAX_VALUE)).toBe(true);
      expect(isLessThan(-Infinity, Number.MIN_VALUE)).toBe(true);

      // edge case
      expect(isLessThan(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).toBe(
        true
      );
    });

    it("should handle number-bigint comparisons", () => {
      // number < bigint
      expect(isLessThan(5, BigInt(10))).toBe(true);
      expect(
        isLessThan(
          Number.MAX_SAFE_INTEGER,
          BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1)
        )
      ).toBe(true);

      // bigint < number
      expect(isLessThan(BigInt(5), 10)).toBe(true);
      expect(isLessThan(BigInt(5), 3)).toBe(false);

      // edge case
      expect(
        isLessThan(
          BigInt(Number.MAX_SAFE_INTEGER),
          BigInt(Number.MAX_SAFE_INTEGER + 1)
        )
      ).toBe(true);
    });

    describe("should correctly compare Dates", () => {
      const date1 = new Date("2023-01-01");
      const date2 = new Date("2023-01-02");

      it("valid dates", () => {
        expect(isLessThan(date1, date2)).toBe(true);
        expect(isLessThan(date2, date1)).toBe(false);
        expect(isLessThan(date1, date1)).toBe(false);

        // edge case
        const minDate = new Date(-8640000000000000);
        const maxDate = new Date(8640000000000000);
        expect(isLessThan(minDate, maxDate)).toBe(true);
      });

      it("invalid dates should throw", () => {
        const invalidDate = new Date("invalid");
        expect(() => isLessThan(date1, invalidDate)).toThrow(
          COMPARISON_ERROR_MESSAGES.INVALID_DATE_COMPARISON
        );
        expect(() => isLessThan(invalidDate, date1)).toThrow(
          COMPARISON_ERROR_MESSAGES.INVALID_DATE_COMPARISON
        );
      });
    });

    describe("should throw errors for invalid comparisons", () => {
      it("null or undefined values", () => {
        expect(() => isLessThan(null, 5)).toThrow(
          COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON
        );
        expect(() => isLessThan(5, undefined)).toThrow(
          COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON
        );
        expect(() => isLessThan(null, null)).toThrow(
          COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON
        );
      });

      it("NaN values", () => {
        expect(() => isLessThan(NaN, 5)).toThrow(
          COMPARISON_ERROR_MESSAGES.NAN_COMPARISON
        );
        expect(() => isLessThan(5, NaN)).toThrow(
          COMPARISON_ERROR_MESSAGES.NAN_COMPARISON
        );
      });

      it("incompatible types", () => {
        expect(() => isLessThan("5", 5)).toThrow(
          sf(
            COMPARISON_ERROR_MESSAGES.TYPE_MISMATCH_COMPARISON,
            "string",
            "number"
          )
        );
        expect(() => isLessThan({}, [])).toThrow(
          sf(
            COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
            "object",
            "array"
          )
        );
      });

      it("unsupported types", () => {
        expect(() => isLessThan(true, false)).toThrow(
          sf(
            COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
            "boolean",
            "boolean"
          )
        );
        expect(() => isLessThan(Symbol("a"), Symbol("b"))).toThrow(
          sf(
            COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
            "symbol",
            "symbol"
          )
        );
      });
    });
  });

  describe("isGreaterThan", () => {
    it("should correctly compare numbers", () => {
      expect(isGreaterThan(10, 5)).toBe(true);
      expect(isGreaterThan(5, 10)).toBe(false);
      expect(isGreaterThan(5, 5)).toBe(false);

      // negative
      expect(isGreaterThan(0, -5)).toBe(true);
      expect(isGreaterThan(-5, -10)).toBe(true);
      expect(isGreaterThan(-10, -5)).toBe(false);

      // decimal
      expect(isGreaterThan(1.6, 1.5)).toBe(true);
      expect(isGreaterThan(1.5, 1.6)).toBe(false);

      // Infinity
      expect(isGreaterThan(Infinity, Number.MAX_VALUE)).toBe(true);
      expect(isGreaterThan(Infinity, Number.MIN_VALUE)).toBe(true);
      expect(isGreaterThan(Number.MAX_VALUE, -Infinity)).toBe(true);
      expect(isGreaterThan(Number.MIN_VALUE, -Infinity)).toBe(true);

      // edge case
      expect(
        isGreaterThan(Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER)
      ).toBe(true);
    });

    it("should handle number-bigint comparisons", () => {
      // number > bigint
      expect(isGreaterThan(10, BigInt(5))).toBe(true);
      expect(
        isGreaterThan(
          BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1),
          Number.MAX_SAFE_INTEGER
        )
      ).toBe(true);

      // bigint > number
      expect(isGreaterThan(BigInt(10), 5)).toBe(true);
      expect(isGreaterThan(BigInt(3), 5)).toBe(false);

      // edge case
      expect(
        isGreaterThan(
          BigInt(Number.MAX_SAFE_INTEGER + 1),
          BigInt(Number.MAX_SAFE_INTEGER)
        )
      ).toBe(true);
    });

    describe("should correctly compare Dates", () => {
      const date1 = new Date("2023-01-01");
      const date2 = new Date("2023-01-02");

      it("valid dates", () => {
        expect(isGreaterThan(date2, date1)).toBe(true);
        expect(isGreaterThan(date1, date2)).toBe(false);
        expect(isGreaterThan(date1, date1)).toBe(false);

        // edge case
        const minDate = new Date(-8640000000000000);
        const maxDate = new Date(8640000000000000);
        expect(isGreaterThan(maxDate, minDate)).toBe(true);
      });

      it("invalid dates should throw", () => {
        const invalidDate = new Date("invalid");
        expect(() => isGreaterThan(date1, invalidDate)).toThrow(
          COMPARISON_ERROR_MESSAGES.INVALID_DATE_COMPARISON
        );
        expect(() => isGreaterThan(invalidDate, date1)).toThrow(
          COMPARISON_ERROR_MESSAGES.INVALID_DATE_COMPARISON
        );
      });
    });

    describe("should throw errors for invalid comparisons", () => {
      it("null or undefined values", () => {
        expect(() => isGreaterThan(null, 5)).toThrow(
          COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON
        );
        expect(() => isGreaterThan(5, undefined)).toThrow(
          COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON
        );
        expect(() => isGreaterThan(null, null)).toThrow(
          COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON
        );
      });

      it("NaN values", () => {
        expect(() => isGreaterThan(NaN, 5)).toThrow(
          COMPARISON_ERROR_MESSAGES.NAN_COMPARISON
        );
        expect(() => isGreaterThan(5, NaN)).toThrow(
          COMPARISON_ERROR_MESSAGES.NAN_COMPARISON
        );
      });

      it("incompatible types", () => {
        expect(() => isGreaterThan("5", 5)).toThrow(
          sf(
            COMPARISON_ERROR_MESSAGES.TYPE_MISMATCH_COMPARISON,
            "string",
            "number"
          )
        );
        expect(() => isGreaterThan({}, [])).toThrow(
          sf(
            COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
            "object",
            "array"
          )
        );
      });

      it("unsupported types", () => {
        expect(() => isGreaterThan(true, false)).toThrow(
          sf(
            COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
            "boolean",
            "boolean"
          )
        );
        expect(() => isGreaterThan(Symbol("a"), Symbol("b"))).toThrow(
          sf(
            COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
            "symbol",
            "symbol"
          )
        );
      });
    });
  });
});
