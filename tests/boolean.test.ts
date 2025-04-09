import { isErr, isOk, ok, err } from "@railway-ts/core";
import { describe, expect, test } from "bun:test";

import { boolean, isFalse, isNullable, matches, mustBeChecked } from "@/boolean";

import type { ValidationError, Validator } from "@/core";

describe("boolean - validators", () => {
  // Custom boolean validator for testing
  const booleanValidator: Validator<unknown, boolean> = (value, path = []) => {
    if (typeof value !== "boolean") {
      const error: ValidationError = { path, message: "Expected a boolean" };
      return err([error]);
    }
    return ok(value);
  };
  // Test our custom validator first to establish the pattern
  describe("booleanValidator", () => {
    test("should validate boolean values", () => {
      // Valid cases
      const trueResult = booleanValidator(true);
      expect(isOk(trueResult)).toBe(true);
      if (isOk(trueResult)) {
        expect(trueResult.value).toBe(true);
      }

      const falseResult = booleanValidator(false);
      expect(isOk(falseResult)).toBe(true);
      if (isOk(falseResult)) {
        expect(falseResult.value).toBe(false);
      }

      // Invalid cases
      const invalidInputs = ["string", 123, null, undefined, {}, []];
      for (const input of invalidInputs) {
        const result = booleanValidator(input);
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Expected a boolean");
        }
      }
    });

    test("should include path in error", () => {
      const path = ["user", "settings", "notifications"];
      const result = booleanValidator("not a boolean", path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("boolean()", () => {
    test("should validate boolean values", () => {
      const validator = boolean();

      // Valid cases
      const trueResult = validator(true);
      expect(isOk(trueResult)).toBe(true);
      if (isOk(trueResult)) {
        expect(trueResult.value).toBe(true);
      }

      const falseResult = validator(false);
      expect(isOk(falseResult)).toBe(true);
      if (isOk(falseResult)) {
        expect(falseResult.value).toBe(false);
      }

      // Invalid cases
      const invalidInputs = [null, 42, "string", {}, [], undefined];

      for (const input of invalidInputs) {
        const result = validator(input);
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Must be a boolean");
        }
      }
    });

    test("should use custom error message", () => {
      const customMessage = "Please provide a boolean value";
      const validator = boolean(customMessage);

      const result = validator("not a boolean");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should maintain path information", () => {
      const validator = boolean();
      const path = ["user", "preferences", "darkMode"];

      const result = validator("not a boolean", path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("mustBeChecked()", () => {
    test("should validate checked status", () => {
      const validator = mustBeChecked();

      // Valid case - checked
      const checkedResult = validator(true);
      expect(isOk(checkedResult)).toBe(true);
      if (isOk(checkedResult)) {
        expect(checkedResult.value).toBe(true);
      }

      // Invalid case - not checked
      const uncheckedResult = validator(false);
      expect(isErr(uncheckedResult)).toBe(true);
      if (isErr(uncheckedResult)) {
        expect(uncheckedResult.error[0]?.message || "").toBe("You must check this field");
      }
    });

    test("should use custom error message", () => {
      const customMessage = "Please accept the terms and conditions";
      const validator = mustBeChecked(customMessage);

      const result = validator(false);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should maintain path information", () => {
      const validator = mustBeChecked();
      const path = ["user", "agreements", "termsAccepted"];

      const result = validator(false, path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("isFalse()", () => {
    test("should validate false values", () => {
      const validator = isFalse();

      // Valid case - false
      const falseResult = validator(false);
      expect(isOk(falseResult)).toBe(true);
      if (isOk(falseResult)) {
        expect(falseResult.value).toBe(false);
      }

      // Invalid case - true
      const trueResult = validator(true);
      expect(isErr(trueResult)).toBe(true);
      if (isErr(trueResult)) {
        expect(trueResult.error[0]?.message || "").toBe("Value must be false");
      }
    });

    test("should use custom error message", () => {
      const customMessage = "This option must be disabled";
      const validator = isFalse(customMessage);

      const result = validator(true);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should maintain path information", () => {
      const validator = isFalse();
      const path = ["settings", "notifications", "enabled"];

      const result = validator(true, path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("matches()", () => {
    test("should validate matching boolean values", () => {
      // Test with expected = true
      const trueValidator = matches(true);

      const trueMatch = trueValidator(true);
      expect(isOk(trueMatch)).toBe(true);
      if (isOk(trueMatch)) {
        expect(trueMatch.value).toBe(true);
      }

      const trueNoMatch = trueValidator(false);
      expect(isErr(trueNoMatch)).toBe(true);
      if (isErr(trueNoMatch)) {
        expect(trueNoMatch.error[0]?.message || "").toBe("Value must be true");
      }

      // Test with expected = false
      const falseValidator = matches(false);

      const falseMatch = falseValidator(false);
      expect(isOk(falseMatch)).toBe(true);
      if (isOk(falseMatch)) {
        expect(falseMatch.value).toBe(false);
      }

      const falseNoMatch = falseValidator(true);
      expect(isErr(falseNoMatch)).toBe(true);
      if (isErr(falseNoMatch)) {
        expect(falseNoMatch.error[0]?.message || "").toBe("Value must be false");
      }
    });

    test("should use custom error message", () => {
      const customMessage = "Value must match the expected boolean";
      const validator = matches(true, customMessage);

      const result = validator(false);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should use default error message with expected value", () => {
      const validator = matches(true);

      const result = validator(false);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe("Value must be true");
      }
    });

    test("should maintain path information", () => {
      const validator = matches(true);
      const path = ["user", "settings", "active"];

      const result = validator(false, path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("isNullable()", () => {
    test("should validate boolean or null values", () => {
      const validator = isNullable();

      // Valid cases
      const trueResult = validator(true);
      expect(isOk(trueResult)).toBe(true);
      if (isOk(trueResult)) {
        expect(trueResult.value).toBe(true);
      }

      const falseResult = validator(false);
      expect(isOk(falseResult)).toBe(true);
      if (isOk(falseResult)) {
        expect(falseResult.value).toBe(false);
      }

      const nullResult = validator(null);
      expect(isOk(nullResult)).toBe(true);
      if (isOk(nullResult)) {
        expect(nullResult.value).toBe(null);
      }

      // Invalid cases
      const invalidInputs = ["true", 0, {}, [], undefined];

      for (const input of invalidInputs) {
        const result = validator(input);
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Must be a boolean or null");
        }
      }
    });

    test("should use custom error message", () => {
      const customMessage = "Please provide a boolean value or null";
      const validator = isNullable(customMessage);

      const result = validator("not valid");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should maintain path information", () => {
      const validator = isNullable();
      const path = ["user", "preferences", "receiveEmails"];

      const result = validator("not valid", path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });
});
