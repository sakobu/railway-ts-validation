import { isErr, isOk, ok, err } from "@railway-ts/core";
import { describe, test, expect } from "bun:test";

import { object, required, optional, type Validator, type ValidationError } from "@/core";

describe("core - object validator", () => {
  const stringValidator: Validator<unknown, string> = (value) => {
    if (typeof value !== "string") {
      return err([{ path: [], message: "Expected a string" }]);
    }
    return ok(value);
  };

  const numberValidator: Validator<unknown, number> = (value) => {
    if (typeof value !== "number") {
      const error: ValidationError = { path: [], message: "Expected a number" };
      return err([error]);
    }
    return ok(value);
  };

  test("should validate a valid object", () => {
    const schema = object({
      name: stringValidator,
      age: numberValidator,
    });

    const input = { name: "John", age: 30 };
    const result = schema(input);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toEqual(input);
    }
  });

  test("should reject non-object values", () => {
    const schema = object({
      name: stringValidator,
    });

    const invalidInputs = [null, 42, "string", true, undefined];

    for (const input of invalidInputs) {
      const result = schema(input);
      expect(isErr(result)).toBe(true);

      if (isErr(result)) {
        expect(result.error[0]?.message || "").toContain("Expected an object");
      }
    }
  });

  test("should reject invalid field values", () => {
    const schema = object({
      name: stringValidator,
      age: numberValidator,
    });

    const input = { name: 123, age: "thirty" };
    const result = schema(input);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.length).toBe(2);
    }
  });

  test("should reject extra fields in strict mode", () => {
    const schema = object(
      {
        name: stringValidator,
      },
      { strict: true },
    );

    const input = { name: "John", extra: "field" };
    const result = schema(input);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error[0]?.message || "").toContain("Unexpected field");
    }
  });

  test("should allow extra fields in non-strict mode", () => {
    const schema = object(
      {
        name: stringValidator,
      },
      { strict: false },
    );

    const input = { name: "John", extra: "field" };
    const result = schema(input);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toEqual({ name: "John" });
    }
  });

  test("should use default strict=true when options not provided", () => {
    const schema = object({
      name: stringValidator,
    });

    const input = { name: "John", extra: "field" };
    const result = schema(input);

    expect(isErr(result)).toBe(true);
  });

  test("should maintain path information", () => {
    const nestedSchema = object({
      name: (value, path = []) => {
        if (typeof value !== "string") {
          const error: ValidationError = { path, message: "Expected a string" };
          return err([error]);
        }
        return ok(value);
      },
    });

    const middleSchema = object({
      details: nestedSchema,
    });

    const schema = object({
      user: middleSchema,
    });

    const input = { user: { details: { name: 123 } } };
    const result = schema(input);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.path).toEqual(["user", "details", "name"]);
    }
  });
});

describe("core - required validator", () => {
  const stringValidator: Validator<unknown, string> = (value) => {
    if (typeof value !== "string") {
      const error: ValidationError = { path: [], message: "Expected a string" };
      return err([error]);
    }
    return ok(value);
  };

  test("should pass through valid values", () => {
    const validator = required(stringValidator);
    const result = validator("test");

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe("test");
    }
  });

  test("should reject undefined values", () => {
    const validator = required(stringValidator);
    const result = validator(undefined);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error[0]?.message || "").toBe("Field is required");
    }
  });

  test("should reject null values", () => {
    const validator = required(stringValidator);
    const result = validator(null);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error[0]?.message || "").toBe("Field is required");
    }
  });

  test("should use custom error message", () => {
    const customMessage = "This field cannot be empty";
    const validator = required(stringValidator, customMessage);
    const result = validator(undefined);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error[0]?.message || "").toBe(customMessage);
    }
  });

  test("should maintain path information", () => {
    const validator = required(stringValidator);
    const result = validator(undefined, ["user", "name"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.path).toEqual(["user", "name"]);
    }
  });
});

describe("core - optional validator", () => {
  const stringValidator: Validator<unknown, string> = (value) => {
    if (typeof value !== "string") {
      const error: ValidationError = { path: [], message: "Expected a string" };
      return err([error]);
    }
    return ok(value);
  };

  test("should pass through valid values", () => {
    const validator = optional(stringValidator);
    const result = validator("test");

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe("test");
    }
  });

  test("should return undefined for undefined values", () => {
    const validator = optional(stringValidator);
    const result = validator(undefined);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBeUndefined();
    }
  });

  test("should return undefined for null values", () => {
    const validator = optional(stringValidator);
    const result = validator(null);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBeUndefined();
    }
  });

  test("should validate non-null/undefined values", () => {
    const validator = optional(stringValidator);
    const result = validator(123);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.message).toBe("Expected a string");
    }
  });

  test("should maintain path information", () => {
    // Define a validator that properly handles path parameter
    const pathAwareValidator: Validator<unknown, string> = (value, path = []) => {
      if (typeof value !== "string") {
        const error: ValidationError = { path, message: "Expected a string" };
        return err([error]);
      }
      return ok(value);
    };

    const validator = optional(pathAwareValidator);
    const result = validator(123, ["user", "name"]);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      const error = result.error[0] || { path: [], message: "" };
      expect(error.path).toEqual(["user", "name"]);
    }
  });
});
