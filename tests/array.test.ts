import { isErr, isOk, ok, err } from "@railway-ts/core";
import { describe, test, expect } from "bun:test";

import { array, oneOf, stringEnum, numberArray, selectionArray } from "@/array";

import type { Validator, ValidationError } from "@/core";

describe("array - array validator", () => {
  // Sample item validator for testing
  const numberValidator: Validator<unknown, number> = (value) => {
    if (typeof value !== "number") {
      const error: ValidationError = { path: [], message: "Expected a number" };
      return err([error]);
    }
    return ok(value);
  };

  test("should pass valid arrays", () => {
    const validator = array(numberValidator);
    const result = validator([1, 2, 3]);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toEqual([1, 2, 3]);
    }
  });

  test("should reject non-array values", () => {
    const validator = array(numberValidator);
    const invalidInputs = [null, 42, "string", true, undefined, {}];

    for (const input of invalidInputs) {
      const result = validator(input);
      expect(isErr(result)).toBe(true);

      if (isErr(result)) {
        const error = result.error[0] || { path: [], message: "" };
        expect(error.message).toBe("Expected an array");
      }
    }
  });

  test("should validate array items and collect errors", () => {
    // Create a path-aware validator that properly uses the path parameter
    const pathAwareNumberValidator: Validator<unknown, number> = (value, path = []) => {
      if (typeof value !== "number") {
        const error: ValidationError = { path, message: "Expected a number" };
        return err([error]);
      }
      return ok(value);
    };

    const validator = array(pathAwareNumberValidator);
    const result = validator([1, "two", 3, "four"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.length).toBe(2); // Two invalid items

      // Check that errors contain the correct paths
      const paths = result.error.map((err) => err.path);
      expect(paths).toContainEqual(["1"]); // Index 1 ("two")
      expect(paths).toContainEqual(["3"]); // Index 3 ("four")
    }
  });

  test("should maintain parent path in error reports", () => {
    // Create a path-aware validator that properly uses the path parameter
    const pathAwareNumberValidator: Validator<unknown, number> = (value, path = []) => {
      if (typeof value !== "number") {
        const error: ValidationError = { path, message: "Expected a number" };
        return err([error]);
      }
      return ok(value);
    };

    const validator = array(pathAwareNumberValidator);
    const result = validator([1, "two"], ["items"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.path).toEqual(["items", "1"]); // Parent path + index
    }
  });

  test("should transform array items if validator transforms", () => {
    // A validator that doubles numbers
    const doubleNumberValidator: Validator<number, number> = (value) => {
      return ok(value * 2);
    };

    const validator = array(doubleNumberValidator);
    const result = validator([1, 2, 3]);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toEqual([2, 4, 6]);
    }
  });
});

describe("array - oneOf validator", () => {
  test("should pass values included in allowed list", () => {
    const validator = oneOf(["red", "green", "blue"]);
    const result = validator("green");

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe("green");
    }
  });

  test("should reject values not in allowed list", () => {
    const validator = oneOf(["red", "green", "blue"]);
    const result = validator("yellow");

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.message).toContain("Value must be one of");
    }
  });

  test("should accept custom error message", () => {
    const customMessage = "Invalid color selection";
    const validator = oneOf(["red", "green", "blue"], customMessage);
    const result = validator("yellow");

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.message).toBe(customMessage);
    }
  });

  test("should work with non-string values", () => {
    const validator = oneOf([1, 2, 3]);

    // Valid case
    const validResult = validator(2);
    expect(isOk(validResult)).toBe(true);

    // Invalid case
    const invalidResult = validator(4);
    expect(isErr(invalidResult)).toBe(true);
  });

  test("should maintain path information", () => {
    const validator = oneOf(["red", "green", "blue"]);
    const result = validator("yellow", ["theme", "color"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.path).toEqual(["theme", "color"]);
    }
  });
});

describe("array - stringEnum validator", () => {
  test("should pass string values in enum", () => {
    const validator = stringEnum(["admin", "user", "guest"]);
    const result = validator("admin");

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe("admin");
    }
  });

  test("should reject non-string values", () => {
    const validator = stringEnum(["admin", "user", "guest"]);
    const result = validator(123);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.message).toBe("Value must be a string");
    }
  });

  test("should reject string values not in enum", () => {
    const validator = stringEnum(["admin", "user", "guest"]);
    const result = validator("moderator");

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.message).toContain("Value must be one of");
    }
  });

  test("should accept custom error message", () => {
    const customMessage = "Invalid role";
    const validator = stringEnum(["admin", "user", "guest"], customMessage);
    const result = validator("moderator");

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.message).toBe(customMessage);
    }
  });

  test("should maintain path information", () => {
    const validator = stringEnum(["admin", "user", "guest"]);
    const result = validator("moderator", ["user", "role"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.path).toEqual(["user", "role"]);
    }
  });
});

describe("array - numberArray validator", () => {
  test("should validate arrays of numbers", () => {
    const validator = numberArray();
    const result = validator([1, 2, 3]);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toEqual([1, 2, 3]);
    }
  });

  test("should parse string numbers to actual numbers", () => {
    const validator = numberArray();
    const result = validator(["1", "2", "3"]);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toEqual([1, 2, 3]);
    }
  });

  test("should reject arrays with invalid number strings", () => {
    const validator = numberArray();
    const result = validator(["1", "two", "3"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.length).toBe(1);
      const error = result.error[0] || { path: [], message: "" };
      expect(error.path).toEqual(["1"]); // Index 1 ("two")
    }
  });

  test("should accept custom error message", () => {
    const customMessage = "Invalid number format";
    const validator = numberArray(customMessage);
    const result = validator(["1", "not-a-number"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.message).toBe(customMessage);
    }
  });
});

describe("array - selectionArray validator", () => {
  test("should validate arrays of valid selections", () => {
    const validator = selectionArray(["red", "green", "blue"]);
    const result = validator(["red", "blue"]);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toEqual(["red", "blue"]);
    }
  });

  test("should reject arrays with invalid selections", () => {
    const validator = selectionArray(["red", "green", "blue"]);
    const result = validator(["red", "yellow", "blue"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.length).toBe(1);
      const error = result.error[0] || { path: [], message: "" };
      expect(error.path).toEqual(["1"]); // Index 1 ("yellow")
    }
  });

  test("should reject non-string values in the array", () => {
    const validator = selectionArray(["red", "green", "blue"]);
    const result = validator(["red", 123, "blue"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.length).toBe(1);
      const error = result.error[0] || { path: [], message: "" };
      expect(error.path).toEqual(["1"]); // Index 1 (123)
    }
  });

  test("should accept custom error message", () => {
    const customMessage = "Invalid color selection";
    const validator = selectionArray(["red", "green", "blue"], customMessage);
    const result = validator(["red", "purple"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.message).toBe(customMessage);
    }
  });

  test("should maintain parent path in error reports", () => {
    const validator = selectionArray(["red", "green", "blue"]);
    const result = validator(["red", "purple"], ["theme", "colors"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.path).toEqual(["theme", "colors", "1"]); // Full path with index
    }
  });
});
