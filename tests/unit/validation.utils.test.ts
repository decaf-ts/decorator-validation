import { VALIDATION_PARENT_KEY } from "../../src";
import { getValueByPath } from "../../src/validation/Validators/utils";

describe("Validation Utils", () => {
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

  parent[VALIDATION_PARENT_KEY] = grandparent;

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

  testObj.array[1].deep[VALIDATION_PARENT_KEY] = testObj.array[1];

  test("should get direct property", () => {
    expect(getValueByPath(testObj, "name")).toBe("Test Object");
  });

  test("should get nested property", () => {
    expect(getValueByPath(testObj, "nested.value")).toBe("Nested Value");
  });

  test("should get array element from nested property", () => {
    expect(getValueByPath(testObj, "nested.array.2")).toBe(300);
  });

  test("should access parent value", () => {
    expect(getValueByPath(testObj, "../name")).toBe("Parent");
    expect(getValueByPath(testObj, "../value")).toBe("parent.value");
  });

  test("should access grandparent value", () => {
    expect(getValueByPath(testObj, "../../name")).toBe("Grandparent");
    expect(getValueByPath(testObj, "../../value")).toBe("Root Value");
  });

  test("should combine parent access and normal path", () => {
    expect(getValueByPath(testObj, "../child.value")).toBe(
      "parent.child.value"
    );
  });

  test("should work with array indices", () => {
    expect(getValueByPath(testObj, "array.1.id")).toBe(2);
    expect(getValueByPath(testObj, "array.1.name")).toBe("Second");
  });

  test("should work with parent access from array items", () => {
    expect(getValueByPath(testObj, "../array.0.id")).toBe("P0");
    expect(getValueByPath(testObj, "../array.0.name")).toBe("Parent Item 0");
  });

  test("should work with grandparent access from array items", () => {
    expect(getValueByPath(testObj, "../../array.1.id")).toBe("GP1");
    expect(getValueByPath(testObj, "../../array.1.name")).toBe(
      "GrandParent id GP1"
    );
  });

  test("should throw for non-existent property", () => {
    expect(() => getValueByPath(testObj, "nonexistent")).toThrow(
      "Failed to resolve path nonexistent: property 'nonexistent' does not exist."
    );
  });

  test("should throw for too many parent accesses", () => {
    expect(() => getValueByPath(testObj, "../../../tooFar")).toThrow(
      "Cannot access parent at level 3 for path '../../../tooFar': no parent available"
    );
  });

  test("should throw for invalid path type", () => {
    expect(() => getValueByPath(testObj, 123 as any)).toThrow(
      "Invalid path argument. Expected non-empty string but received: '123'"
    );
  });

  test("should throw for empty path", () => {
    expect(() => getValueByPath(testObj, "")).toThrow(
      "Invalid path argument. Expected non-empty string but received: ''"
    );

    expect(() => getValueByPath(testObj, " ")).toThrow(
      "Invalid path argument. Expected non-empty string but received: ' '"
    );
  });

  test("should throw when parent access is undefined", () => {
    const badObj = { test: "value", [VALIDATION_PARENT_KEY]: undefined };
    expect(() => getValueByPath(badObj, "../test")).toThrow(
      "Cannot access parent at level 1 for path '../test': no parent available"
    );
  });

  test("should throw when access hits non-object", () => {
    expect(() => getValueByPath("not-an-object" as any, "../test")).toThrow(
      "Cannot access parent at level 1 for path '../test': current context is not an object"
    );
  });

  test("should throw when parent access hits non-object", () => {
    const badObj = { test: "value", [VALIDATION_PARENT_KEY]: "not-an-object" };
    expect(() => getValueByPath(badObj, "../test")).toThrow(
      "Failed to resolve path ../test: property 'test' does not exist on parent."
    );

    const grandparentBadObj = { [VALIDATION_PARENT_KEY]: badObj };
    expect(() => getValueByPath(grandparentBadObj, "../../test")).toThrow(
      "Failed to resolve path ../../test: property 'test' does not exist after 2 parent level(s)."
    );
  });
});
