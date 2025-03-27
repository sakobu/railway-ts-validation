import { ok, err, isOk, isErr, type Result } from "@railway-ts/core/result";
import { pipe } from "@railway-ts/core/utils";
import { describe, test, expect } from "bun:test";

import {
  type FieldValidationError,
  combineValidation,
  combineAllValidations,
  combineFormValidations,
  andThen,
  required,
  minLength,
  isEmail,
  matches,
  parseNumber,
  min,
  integer,
  custom,
} from "@/index";

// Helper function to create a typed error result
const errResult = <T>(message: string): Result<T, string> => err(message);

describe("Validation Utils", () => {
  describe("andThen", () => {
    test("chains validators together", () => {
      // Create a validation pipeline like in the examples
      const validateUsername = (username: string) => {
        return pipe(
          ok<string, string>(username),
          andThen(required("Username is required")),
          andThen(minLength(3, "Username too short")),
          andThen(matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscore")),
        );
      };

      // Test valid input
      const validResult = validateUsername("john_doe");
      expect(isOk(validResult)).toBe(true);
      if (isOk(validResult)) {
        expect(validResult.value).toBe("john_doe");
      }

      // Test invalid inputs
      const emptyResult = validateUsername("");
      expect(isErr(emptyResult)).toBe(true);
      if (isErr(emptyResult)) {
        expect(emptyResult.error).toBe("Username is required");
      }

      const shortResult = validateUsername("jo");
      expect(isErr(shortResult)).toBe(true);
      if (isErr(shortResult)) {
        expect(shortResult.error).toBe("Username too short");
      }

      const invalidCharsResult = validateUsername("john@doe");
      expect(isErr(invalidCharsResult)).toBe(true);
      if (isErr(invalidCharsResult)) {
        expect(invalidCharsResult.error).toBe("Username can only contain letters, numbers and underscore");
      }
    });
  });

  describe("combineValidation", () => {
    test("returns Ok with array of values when all validations pass", () => {
      const results = [ok<string, string>("username"), ok<number, string>(25), ok<boolean, string>(true)];

      const combined = combineValidation(results);
      expect(isOk(combined)).toBe(true);
      if (isOk(combined)) {
        expect(combined.value).toEqual(["username", 25, true]);
      }
    });

    test("returns first Err when any validation fails", () => {
      const results = [
        ok<string, string>("username"),
        errResult<number>("Invalid age"),
        errResult<boolean>("Invalid flag"),
      ];

      const combined = combineValidation(results);
      expect(isErr(combined)).toBe(true);
      if (isErr(combined)) {
        expect(combined.error).toBe("Invalid age");
      }
    });

    test("works with realistic form validation scenario", () => {
      // Create validation functions like in the example
      const validateUsername = (username: string) =>
        pipe(
          ok<string, string>(username),
          andThen(required("Username is required")),
          andThen(minLength(3, "Username too short")),
        );

      const validateEmail = (email: string) =>
        pipe(
          ok<string, string>(email),
          andThen(required("Email is required")),
          andThen(isEmail("Invalid email format")),
        );

      const validateAge = (ageStr: string) =>
        pipe(
          ok<string, string>(ageStr),
          andThen(required("Age is required")),
          andThen(parseNumber("Please enter a valid number")),
          andThen(min(18, "Must be at least 18")),
          andThen(integer("Age must be a whole number")),
        );

      // Test with valid inputs
      const validResults = [validateUsername("john_doe"), validateEmail("john@example.com"), validateAge("25")];

      const validCombined = combineValidation(validResults);
      expect(isOk(validCombined)).toBe(true);

      // Test with invalid inputs
      const invalidResults = [
        validateUsername("john_doe"),
        validateEmail("invalid-email"), // This will fail
        validateAge("25"),
      ];

      const invalidCombined = combineValidation(invalidResults);
      expect(isErr(invalidCombined)).toBe(true);
      if (isErr(invalidCombined)) {
        expect(invalidCombined.error).toBe("Invalid email format");
      }
    });

    test("works with empty array", () => {
      const results: [] = [];
      const combined = combineValidation(results);
      expect(isOk(combined)).toBe(true);
      if (isOk(combined)) {
        expect(combined.value).toEqual([]);
      }
    });
  });

  describe("combineAllValidations", () => {
    test("returns Ok with array of values when all validations pass", () => {
      const results = [ok<string, string>("username"), ok<number, string>(25), ok<boolean, string>(true)];

      const combined = combineAllValidations(results);
      expect(isOk(combined)).toBe(true);
      if (isOk(combined)) {
        expect(combined.value).toEqual(["username", 25, true]);
      }
    });

    test("returns Err with array of all errors when any validation fails", () => {
      const results = [
        ok<string, string>("username"),
        errResult<number>("Invalid age"),
        errResult<boolean>("Invalid flag"),
      ];

      const combined = combineAllValidations(results);
      expect(isErr(combined)).toBe(true);
      if (isErr(combined)) {
        expect(combined.error).toEqual(["Invalid age", "Invalid flag"]);
      }
    });

    test("works with realistic form validation example", () => {
      // Create validation functions like in the example
      const validateUsername = (username: string) =>
        pipe(
          ok<string, string>(username),
          andThen(required("Username is required")),
          andThen(minLength(3, "Username too short")),
        );

      const validateEmail = (email: string) =>
        pipe(
          ok<string, string>(email),
          andThen(required("Email is required")),
          andThen(isEmail("Invalid email format")),
          andThen(custom((e) => !e.endsWith("gmail.com"), "Gmail addresses not accepted")),
        );

      const validateAge = (ageStr: string) =>
        pipe(
          ok<string, string>(ageStr),
          andThen(required("Age is required")),
          andThen(parseNumber("Please enter a valid number")),
          andThen(min(18, "Must be at least 18")),
        );

      // Test with multiple invalid inputs to collect all errors
      const invalidResults = [
        validateUsername("j"), // Too short
        validateEmail("user@gmail.com"), // Gmail not accepted
        validateAge("17"), // Under 18
      ];

      const invalidCombined = combineAllValidations(invalidResults);
      expect(isErr(invalidCombined)).toBe(true);
      if (isErr(invalidCombined)) {
        expect(invalidCombined.error).toEqual([
          "Username too short",
          "Gmail addresses not accepted",
          "Must be at least 18",
        ]);
      }
    });

    test("works with empty array", () => {
      const results: [] = [];
      const combined = combineAllValidations(results);
      expect(isOk(combined)).toBe(true);
      if (isOk(combined)) {
        expect(combined.value).toEqual([]);
      }
    });
  });

  describe("combineFormValidations", () => {
    test("returns Ok with object of values when all validations pass", () => {
      const validations = {
        username: ok<string, string>("john"),
        age: ok<number, string>(25),
        isAdmin: ok<boolean, string>(true),
      };

      const combined = combineFormValidations(validations);
      expect(isOk(combined)).toBe(true);
      if (isOk(combined)) {
        expect(combined.value).toEqual({
          username: "john",
          age: 25,
          isAdmin: true,
        });
      }
    });

    test("returns Err with field errors when any validation fails", () => {
      const validations = {
        username: ok<string, string>("john"),
        email: errResult<string>("Invalid email"),
        age: errResult<number>("Age must be at least 18"),
      };

      const combined = combineFormValidations(validations);
      expect(isErr(combined)).toBe(true);
      if (isErr(combined)) {
        const expectedErrors: FieldValidationError<string>[] = [
          { field: "email", error: "Invalid email" },
          { field: "age", error: "Age must be at least 18" },
        ];

        // Check that all expected errors are in the result
        // (not checking the order as it depends on object iteration)
        expect(combined.error).toHaveLength(2);
        expect(combined.error).toEqual(expect.arrayContaining(expectedErrors));
      }
    });

    test("works with realistic form validation scenario", () => {
      // Creating field validation functions like in the example
      const validateUsername = (username: string) =>
        pipe(
          ok<string, string>(username),
          andThen(required("Username is required")),
          andThen(minLength(3, "Username too short")),
        );

      const validateEmail = (email: string) =>
        pipe(
          ok<string, string>(email),
          andThen(required("Email is required")),
          andThen(isEmail("Invalid email format")),
        );

      const validateAge = (ageStr: string) =>
        pipe(
          ok<string, string>(ageStr),
          andThen(required("Age is required")),
          andThen(parseNumber("Please enter a valid number")),
          andThen(min(18, "Must be at least 18")),
        );

      // Test a valid form submission
      const validForm = combineFormValidations({
        username: validateUsername("john_doe"),
        email: validateEmail("john@example.com"),
        age: validateAge("25"),
      });

      expect(isOk(validForm)).toBe(true);
      if (isOk(validForm)) {
        expect(validForm.value).toEqual({
          username: "john_doe",
          email: "john@example.com",
          age: 25, // Notice this is converted to a number by parseNumber
        });
      }

      // Test an invalid form submission
      const invalidForm = combineFormValidations({
        username: validateUsername("j"),
        email: validateEmail("invalid-email"),
        age: validateAge("seventeen"),
      });

      expect(isErr(invalidForm)).toBe(true);
      if (isErr(invalidForm)) {
        const expectedErrors: FieldValidationError<string>[] = [
          { field: "username", error: "Username too short" },
          { field: "email", error: "Invalid email format" },
          { field: "age", error: "Please enter a valid number" },
        ];

        expect(invalidForm.error).toHaveLength(3);
        expect(invalidForm.error).toEqual(expect.arrayContaining(expectedErrors));
      }
    });

    test("works with empty object", () => {
      const validations = {};
      const combined = combineFormValidations(validations);
      expect(isOk(combined)).toBe(true);
      if (isOk(combined)) {
        expect(combined.value).toEqual({});
      }
    });
  });
});
