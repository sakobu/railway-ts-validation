import { ok, err, isOk, isErr } from "@railway-ts/core";
import { describe, test, expect } from "bun:test";

import { composeRight, validate, formatErrors } from "@/utils";

import type { Validator, ValidationError } from "@/core";

describe("utils - composeRight", () => {
  // Basic validators for testing
  const stringValidator: Validator<unknown, string> = (value) => {
    if (typeof value !== "string") {
      const error: ValidationError = { path: [], message: "Expected a string" };
      return err([error]);
    }
    return ok(value);
  };

  const minLengthValidator =
    (min: number): Validator<string, string> =>
    (value, path = []) => {
      if (value.length < min) {
        const error: ValidationError = { path, message: `Must be at least ${min} characters` };
        return err([error]);
      }
      return ok(value);
    };

  const toUpperCaseValidator: Validator<string, string> = (value) => {
    return ok(value.toUpperCase());
  };

  test("should pass through a valid value with single validator", () => {
    const validator = composeRight(stringValidator);
    const result = validator("test");

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe("test");
    }
  });

  test("should handle multiple validators in sequence", () => {
    const validator = composeRight(stringValidator, minLengthValidator(3), toUpperCaseValidator);

    const result = validator("test");

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe("TEST");
    }
  });

  test("should fail if first validator fails", () => {
    const validator = composeRight(stringValidator, minLengthValidator(3), toUpperCaseValidator);

    const result = validator(123);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.message).toBe("Expected a string");
    }
  });

  test("should fail if middle validator fails", () => {
    const validator = composeRight(stringValidator, minLengthValidator(3), toUpperCaseValidator);

    const result = validator("ab"); // Too short for minLengthValidator

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.message).toBe("Must be at least 3 characters");
    }
  });

  test("should maintain path information", () => {
    const minLengthWithPath =
      (min: number): Validator<string, string> =>
      (value, path = []) => {
        if (value.length < min) {
          const error: ValidationError = { path, message: `Must be at least ${min} characters` };
          return err([error]);
        }
        return ok(value);
      };

    const validator = composeRight(stringValidator, minLengthWithPath(3));

    const result = validator("ab", ["user", "name"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.path).toEqual(["user", "name"]);
    }
  });
});

describe("utils - validate", () => {
  test("should run the validator on the provided value", () => {
    const stringValidator: Validator<unknown, string> = (value) => {
      if (typeof value !== "string") {
        const error: ValidationError = { path: [], message: "Expected a string" };
        return err([error]);
      }
      return ok(value);
    };

    // Valid case
    const validResult = validate("test", stringValidator);
    expect(isOk(validResult)).toBe(true);
    if (isOk(validResult)) {
      expect(validResult.value).toBe("test");
    }

    // Invalid case
    const invalidResult = validate(123, stringValidator);
    expect(isErr(invalidResult)).toBe(true);
    if (isErr(invalidResult)) {
      const error = invalidResult.error[0] || { path: [], message: "" };
      expect(error.message).toBe("Expected a string");
    }
  });
});

describe("utils - formatErrors", () => {
  test("should format simple path errors", () => {
    const errors: ValidationError[] = [
      { path: ["name"], message: "Name is required" },
      { path: ["email"], message: "Invalid email format" },
    ];

    const formatted = formatErrors(errors);
    expect(formatted).toEqual({
      name: "Name is required",
      email: "Invalid email format",
    });
  });

  test("should format nested path errors with dot notation", () => {
    const errors: ValidationError[] = [
      { path: ["user", "name"], message: "Name is required" },
      { path: ["user", "contact", "email"], message: "Invalid email format" },
    ];

    const formatted = formatErrors(errors);
    expect(formatted).toEqual({
      "user.name": "Name is required",
      "user.contact.email": "Invalid email format",
    });
  });

  test("should format array index paths with bracket notation", () => {
    const errors: ValidationError[] = [
      { path: ["users", "0", "name"], message: "Name is required" },
      { path: ["addresses", "1", "zipCode"], message: "Invalid zip code" },
    ];

    const formatted = formatErrors(errors);
    expect(formatted).toEqual({
      "users[0].name": "Name is required",
      "addresses[1].zipCode": "Invalid zip code",
    });
  });

  test("should handle empty path arrays", () => {
    const errors: ValidationError[] = [{ path: [], message: "General error" }];

    const formatted = formatErrors(errors);
    expect(formatted).toEqual({
      "": "General error",
    });
  });

  test("should handle mixed path types", () => {
    const errors: ValidationError[] = [
      { path: ["users", "0", "addresses", "1", "street"], message: "Street is required" },
      { path: ["config", "settings", "notifications"], message: "Invalid setting" },
    ];

    const formatted = formatErrors(errors);
    expect(formatted).toEqual({
      "users[0].addresses[1].street": "Street is required",
      "config.settings.notifications": "Invalid setting",
    });
  });
});
