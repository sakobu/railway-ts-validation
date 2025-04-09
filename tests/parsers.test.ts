import { isErr, isOk, ok, err } from "@railway-ts/core";
import { describe, expect, test } from "bun:test";

import {
  parseNumber,
  parseString,
  parseDate,
  parseBool,
  parseJSON,
  parseInteger,
  parseISODate,
  parseURL,
  parsePhoneNumber,
} from "@/parsers";

import type { ValidationError, Validator } from "@/core";

describe("parsers", () => {
  // Custom string parser for testing
  const stringParser: Validator<unknown, string> = (value, path = []) => {
    if (typeof value !== "string") {
      const error: ValidationError = { path, message: "Expected a string" };
      return err([error]);
    }
    return ok(value);
  };

  // Test our custom parser to establish the pattern
  describe("stringParser", () => {
    test("should validate strings", () => {
      // Valid cases
      const validInputs = ["hello", "", "123", "true"];
      for (const input of validInputs) {
        const result = stringParser(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toBe(input);
        }
      }

      // Invalid cases
      const invalidInputs = [123, true, false, null, undefined, {}, []];
      for (const input of invalidInputs) {
        const result = stringParser(input);
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Expected a string");
        }
      }
    });

    test("should include path in error", () => {
      const path = ["user", "name"];
      const result = stringParser(123, path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("parseNumber()", () => {
    test("should parse valid numbers", () => {
      const validator = parseNumber();

      // Valid cases - already numbers
      const numericInputs = [0, 42, -1, 3.14, Number.MAX_SAFE_INTEGER];
      for (const input of numericInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toBe(input);
        }
      }

      // Valid cases - strings that can be parsed as numbers
      const validStringInputs = [
        { input: "42", expected: 42 },
        { input: "-10", expected: -10 },
        { input: "3.14", expected: 3.14 },
        { input: "0", expected: 0 },
        { input: " 123 ", expected: 123 }, // with spaces
      ];

      for (const { input, expected } of validStringInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toBe(expected);
        }
      }

      // Invalid cases
      const invalidInputs = ["not a number", "12x", "", " ", true, false, null, undefined, {}, []];

      for (const input of invalidInputs) {
        const result = validator(input);
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Must be a valid number");
        }
      }
    });

    test("should allow custom error message", () => {
      const customMessage = "Please provide a numeric value";
      const validator = parseNumber(customMessage);

      const result = validator("not a number");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should include path in error", () => {
      const validator = parseNumber();
      const path = ["product", "price"];

      const result = validator("not a number", path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("parseString()", () => {
    test("should parse values to strings", () => {
      const validator = parseString();

      // Valid cases - already strings
      const stringInputs = ["hello", "", "true", "123"];
      for (const input of stringInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toBe(input);
        }
      }

      // Valid cases - values that can be converted to strings
      const convertibleInputs = [
        { input: 42, expected: "42" },
        { input: true, expected: "true" },
        { input: false, expected: "false" },
        { input: 0, expected: "0" },
        { input: [], expected: "" },
        { input: {}, expected: "[object Object]" },
      ];

      for (const { input, expected } of convertibleInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toBe(expected);
        }
      }

      // Invalid cases
      const invalidInputs = [null, undefined];
      for (const input of invalidInputs) {
        const result = validator(input);
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Must be convertible to string");
        }
      }
    });

    test("should allow custom error message", () => {
      const customMessage = "Cannot convert to string";
      const validator = parseString(customMessage);

      const result = validator(null);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should include path in error", () => {
      const validator = parseString();
      const path = ["user", "name"];

      const result = validator(null, path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("parseDate()", () => {
    test("should parse valid dates", () => {
      const validator = parseDate();
      const referenceDate = new Date("2023-05-15T12:00:00Z");

      // Valid cases - already Date objects
      const result1 = validator(referenceDate);
      expect(isOk(result1)).toBe(true);
      if (isOk(result1)) {
        expect(result1.value).toEqual(referenceDate);
      }

      // Valid cases - strings that can be parsed as dates
      const validStringInputs = ["2023-05-15", "2023-05-15T12:00:00Z", "May 15, 2023"];

      for (const input of validStringInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value instanceof Date).toBe(true);
          expect(Number.isNaN(result.value.getTime())).toBe(false);
        }
      }

      // Valid cases - numbers (timestamps)
      const timestamp = referenceDate.getTime();
      const result2 = validator(timestamp);
      expect(isOk(result2)).toBe(true);
      if (isOk(result2)) {
        expect(result2.value.getTime()).toBe(timestamp);
      }

      // Invalid cases
      const invalidInputs = [
        "not a date",
        "2023-99-99", // invalid date format
        true,
        false,
        null,
        undefined,
        {},
        [],
      ];

      for (const input of invalidInputs) {
        const result = validator(input);
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Must be a valid date");
        }
      }
    });

    test("should allow custom error message", () => {
      const customMessage = "Please provide a valid date";
      const validator = parseDate(customMessage);

      const result = validator("not a date");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should include path in error", () => {
      const validator = parseDate();
      const path = ["user", "birthdate"];

      const result = validator("not a date", path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("parseBool()", () => {
    test("should parse values to booleans", () => {
      const validator = parseBool();

      // Valid cases - already booleans
      const booleanInputs = [true, false];
      for (const input of booleanInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toBe(input);
        }
      }

      // Valid cases - strings that can be parsed as true
      const trueStringInputs = ["true", "TRUE", "True", "yes", "YES", "Yes", "1", " true "];
      for (const input of trueStringInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toBe(true);
        }
      }

      // Valid cases - strings that can be parsed as false
      const falseStringInputs = ["false", "FALSE", "False", "no", "NO", "No", "0", " false "];
      for (const input of falseStringInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toBe(false);
        }
      }

      // Valid cases - numbers
      const result1 = validator(1);
      expect(isOk(result1)).toBe(true);
      if (isOk(result1)) {
        expect(result1.value).toBe(true);
      }

      const result0 = validator(0);
      expect(isOk(result0)).toBe(true);
      if (isOk(result0)) {
        expect(result0.value).toBe(false);
      }

      // Invalid cases
      const invalidInputs = ["not a boolean", "truthy", "falsey", 2, -1, null, undefined, {}, []];

      for (const input of invalidInputs) {
        const result = validator(input);
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Must be a valid boolean value");
        }
      }
    });

    test("should allow custom error message", () => {
      const customMessage = "Please enter 'yes' or 'no'";
      const validator = parseBool(customMessage);

      const result = validator("maybe");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should include path in error", () => {
      const validator = parseBool();
      const path = ["user", "agreeToTerms"];

      const result = validator("maybe", path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("parseJSON()", () => {
    test("should parse valid JSON strings", () => {
      const validator = parseJSON();

      // Valid cases - JSON strings
      const validJsonInputs = [
        { input: '{"name":"John"}', expected: { name: "John" } },
        { input: "[1,2,3]", expected: [1, 2, 3] },
        { input: '"hello"', expected: "hello" },
        { input: "42", expected: 42 },
        { input: "true", expected: true },
      ];

      for (const { input, expected } of validJsonInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toEqual(expected);
        }
      }

      // Valid cases - already objects
      const validObjectInputs = [{ name: "John" }, [1, 2, 3]];

      for (const input of validObjectInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toEqual(input);
        }
      }

      // Invalid cases
      const invalidInputs = [
        "{invalid json}", // malformed JSON
        "{'name': 'John'}", // single quotes not valid in JSON
        "[1, 2,", // incomplete JSON
        true,
        false,
        42,
        null, // Based on the implementation, null is treated as invalid
        undefined,
      ];

      for (const input of invalidInputs) {
        const result = validator(input);
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Must be valid JSON");
        }
      }
    });

    test("should allow custom error message", () => {
      const customMessage = "Please provide valid JSON data";
      const validator = parseJSON(customMessage);

      const result = validator("{invalid]");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should include path in error", () => {
      const validator = parseJSON();
      const path = ["api", "payload"];

      const result = validator("{invalid]", path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("parseInteger()", () => {
    test("should parse valid integers", () => {
      const validator = parseInteger();

      // Valid cases - already integers
      const integerInputs = [0, 42, -1, 1000, Number.MAX_SAFE_INTEGER];
      for (const input of integerInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toBe(input);
        }
      }

      // Valid cases - strings that can be parsed as integers
      const validStringInputs = [
        { input: "42", expected: 42 },
        { input: "-10", expected: -10 },
        { input: "0", expected: 0 },
        { input: " 123 ", expected: 123 }, // with spaces
      ];

      for (const { input, expected } of validStringInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toBe(expected);
        }
      }

      // Invalid cases - non-integers
      const nonIntegerInputs = [3.14, 1.5, -2.5];
      for (const input of nonIntegerInputs) {
        const result = validator(input);
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Must be a valid integer");
        }
      }

      // Invalid cases - non-numbers
      const invalidInputs = [
        "not a number",
        "12x",
        "3.14", // decimal string
        "",
        " ",
        true,
        false,
        null,
        undefined,
        {},
        [],
      ];

      for (const input of invalidInputs) {
        const result = validator(input);
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Must be a valid integer");
        }
      }
    });

    test("should allow custom error message", () => {
      const customMessage = "Please enter a whole number";
      const validator = parseInteger(customMessage);

      const result = validator("3.14");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should include path in error", () => {
      const validator = parseInteger();
      const path = ["product", "quantity"];

      const result = validator("3.14", path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("parseISODate()", () => {
    test("should parse valid ISO date strings", () => {
      const validator = parseISODate();

      // Valid cases - ISO date strings
      const validIsoDateInputs = [
        "2023-05-15",
        "2023-01-01",
        "2023-12-31",
        "2023-05-15T12:00:00Z",
        "2023-05-15T12:00:00.000Z",
      ];

      for (const input of validIsoDateInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value instanceof Date).toBe(true);
          expect(Number.isNaN(result.value.getTime())).toBe(false);

          // Check that the date components match what we expect
          const inputDate = new Date(input);
          expect(result.value.getUTCFullYear()).toBe(inputDate.getUTCFullYear());
          expect(result.value.getUTCMonth()).toBe(inputDate.getUTCMonth());
          expect(result.value.getUTCDate()).toBe(inputDate.getUTCDate());
        }
      }

      // Invalid cases
      const invalidInputs = [
        "2023/05/15", // wrong format
        "15-05-2023", // wrong format
        "2023-13-01", // invalid month
        "2023-01-32", // invalid day
        "2023-02-30", // invalid day for month
        "05-15-2023", // wrong format
        "not a date",
        "May 15, 2023", // not ISO format
        "20230515", // missing separators
        true,
        false,
        42,
        null,
        undefined,
        {},
        [],
        new Date(), // must be string
      ];

      for (const input of invalidInputs) {
        const result = validator(input);
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Must be a valid ISO date string");
        }
      }
    });

    test("should allow custom error message", () => {
      const customMessage = "Please provide a date in YYYY-MM-DD format";
      const validator = parseISODate(customMessage);

      const result = validator("05/15/2023");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should include path in error", () => {
      const validator = parseISODate();
      const path = ["event", "date"];

      const result = validator("05/15/2023", path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("parseURL()", () => {
    test("should parse valid URLs", () => {
      const validator = parseURL();

      // Valid cases - URL strings
      const validUrlInputs = [
        "https://example.com",
        "http://localhost:3000",
        "https://sub.example.com/path?query=value#hash",
        "ftp://example.com",
        "file:///path/to/file.txt",
      ];

      for (const input of validUrlInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value instanceof URL).toBe(true);
          // URLs are normalized, so we can't directly compare the string
          expect(result.value.toString()).toBeTruthy();
        }
      }

      // Invalid cases
      const invalidInputs = [
        "not a url",
        "example.com", // missing protocol
        "http://", // missing domain
        "",
        " ",
        true,
        false,
        42,
        null,
        undefined,
        {},
        [],
      ];

      for (const input of invalidInputs) {
        const result = validator(input);
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Must be a valid URL");
        }
      }
    });

    test("should allow custom error message", () => {
      const customMessage = "Please enter a valid web address";
      const validator = parseURL(customMessage);

      const result = validator("not a url");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should include path in error", () => {
      const validator = parseURL();
      const path = ["website", "url"];

      const result = validator("not a url", path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });

  describe("parsePhoneNumber()", () => {
    test("should parse valid phone numbers", () => {
      const validator = parsePhoneNumber();

      // Valid cases - phone numbers matching the default pattern
      const validPhoneInputs = [
        "+1234567890",
        "123-456-7890",
        "(123) 456-7890",
        "123 456 7890",
        "1234567890",
        "+44 1234 567890",
      ];

      for (const input of validPhoneInputs) {
        const result = validator(input);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toBe(input);
        }
      }

      // Invalid cases
      const invalidInputs = [
        "not a phone",
        "123", // too short
        "abcdefghij", // not numeric
        "",
        " ",
        true,
        false,
        42,
        null,
        undefined,
        {},
        [],
      ];

      for (const input of invalidInputs) {
        const result = validator(input);
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error[0]?.message || "").toBe("Invalid phone number format");
        }
      }
    });

    test("should support custom pattern", () => {
      // Pattern for US phone numbers with exactly 10 digits
      const usPhonePattern = /^[0-9]{10}$/;
      const validator = parsePhoneNumber(usPhonePattern);

      // Valid case for custom pattern
      const result1 = validator("1234567890");
      expect(isOk(result1)).toBe(true);

      // Invalid case for custom pattern
      const result2 = validator("+1-234-567-890");
      expect(isErr(result2)).toBe(true);
    });

    test("should allow custom error message", () => {
      const customMessage = "Please enter a valid phone number";
      const validator = parsePhoneNumber(undefined, customMessage);

      const result = validator("abc");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.message || "").toBe(customMessage);
      }
    });

    test("should include path in error", () => {
      const validator = parsePhoneNumber();
      const path = ["contact", "phone"];

      const result = validator("abc", path);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error[0]?.path || []).toEqual(path);
      }
    });
  });
});
