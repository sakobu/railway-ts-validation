import { ok, type Result, isOk, isErr } from "@railway-ts/core/result";
import { pipe } from "@railway-ts/core/utils";
import { describe, test, expect } from "bun:test";

import {
  required,
  custom,
  equals,
  notEquals,
  oneOf,
  minLength,
  maxLength,
  exactLength,
  matches,
  isEmail,
  isUrl,
  min,
  max,
  integer,
  float,
  number,
  range,
  parseNumber,
  parseBoolean,
  parseDate,
  parseUTCDate,
  minItems,
  maxItems,
  validateArray,
  dateRange,
  andThen,
} from "@/index";

// Helper function to create a success result with a value
const makeOk = <T>(value: T) => ok<T, string>(value);

// Helper function to check if a validation returns an error
const expectError = <T>(result: Result<T, string>, expectedMessage?: string) => {
  expect(isErr(result)).toBe(true);
  if (isErr(result) && expectedMessage) {
    expect(result.error).toBe(expectedMessage);
  }
};

// Helper function to check if a validation returns a success with the right value
const expectValue = <T>(result: Result<T, string>, expectedValue: T) => {
  expect(isOk(result)).toBe(true);
  if (isOk(result)) {
    expect(result.value).toEqual(expectedValue);
  }
};

describe("Core/Generic Validators", () => {
  describe("required", () => {
    test("returns error for undefined values", () => {
      const validator = required();
      expectError(validator(undefined), "This field is required");
    });

    test("returns error for null values", () => {
      const validator = required();
      expectError(validator(null), "This field is required");
    });

    test("returns error for empty strings", () => {
      const validator = required();
      expectError(validator(""), "This field is required");
      expectError(validator("   "), "This field is required");
    });

    test("returns value for non-empty values", () => {
      const validator = required();
      expectValue(validator("test"), "test");
      expectValue(validator(0), 0);
      expectValue(validator(false), false);
    });

    test("accepts custom error message", () => {
      const validator = required("Custom message");
      expectError(validator(null), "Custom message");
    });
  });

  describe("custom", () => {
    test("returns error when predicate is false", () => {
      const validator = custom<number>((val) => val > 10, "Must be greater than 10");
      expectError(validator(5), "Must be greater than 10");
    });

    test("returns value when predicate is true", () => {
      const validator = custom<number>((val) => val > 10, "Must be greater than 10");
      expectValue(validator(15), 15);
    });
  });

  describe("equals", () => {
    test("returns error when values are not equal", () => {
      const validator = equals("password", "Passwords don't match");
      expectError(validator("passw0rd"), "Passwords don't match");
    });

    test("returns value when values are equal", () => {
      const validator = equals("password", "Passwords don't match");
      expectValue(validator("password"), "password");
    });
  });

  describe("notEquals", () => {
    test("returns error when values are equal", () => {
      const validator = notEquals("oldPassword", "New password must be different");
      expectError(validator("oldPassword"), "New password must be different");
    });

    test("returns value when values are not equal", () => {
      const validator = notEquals("oldPassword", "New password must be different");
      expectValue(validator("newPassword"), "newPassword");
    });
  });

  describe("oneOf", () => {
    const roles = ["admin", "user", "guest"] as const;
    type Role = (typeof roles)[number];

    test("returns error when value is not in allowed list", () => {
      const validator = oneOf(roles, "Invalid role");
      expectError(validator("manager" as unknown as Role), "Invalid role");
    });

    test("returns value when value is in allowed list", () => {
      const validator = oneOf(roles);
      expectValue(validator("admin"), "admin");
      expectValue(validator("user"), "user");
    });

    test("uses default error message when not provided", () => {
      const validator = oneOf(roles);
      expectError(validator("manager" as unknown as Role), "Must be one of: admin, user, guest");
    });
  });
});

describe("String Validators", () => {
  describe("minLength", () => {
    test("returns error when string is too short", () => {
      const validator = minLength(3);
      expectError(validator("ab"), "Must be at least 3 characters");
    });

    test("returns value when string is long enough", () => {
      const validator = minLength(3);
      expectValue(validator("abc"), "abc");
      expectValue(validator("abcdef"), "abcdef");
    });

    test("accepts custom error message", () => {
      const validator = minLength(3, "Username too short");
      expectError(validator("ab"), "Username too short");
    });
  });

  describe("maxLength", () => {
    test("returns error when string is too long", () => {
      const validator = maxLength(5);
      expectError(validator("abcdef"), "Must be at most 5 characters");
    });

    test("returns value when string is short enough", () => {
      const validator = maxLength(5);
      expectValue(validator("abcde"), "abcde");
      expectValue(validator("abc"), "abc");
    });
  });

  describe("exactLength", () => {
    test("returns error when string length doesn't match", () => {
      const validator = exactLength(6);
      expectError(validator("12345"), "Must be exactly 6 characters");
      expectError(validator("1234567"), "Must be exactly 6 characters");
    });

    test("returns value when string has exact length", () => {
      const validator = exactLength(6);
      expectValue(validator("123456"), "123456");
    });
  });

  describe("matches", () => {
    test("returns error when string doesn't match pattern", () => {
      const validator = matches(/^[A-Z][a-z]+$/, "Must start with uppercase and contain only letters");
      expectError(validator("lowercase"), "Must start with uppercase and contain only letters");
      expectError(validator("Mixed123"), "Must start with uppercase and contain only letters");
    });

    test("returns value when string matches pattern", () => {
      const validator = matches(/^[A-Z][a-z]+$/, "Must start with uppercase and contain only letters");
      expectValue(validator("Hello"), "Hello");
    });
  });

  describe("isEmail", () => {
    test("returns error for invalid email addresses", () => {
      const validator = isEmail();
      expectError(validator("not-an-email"), "Invalid email address");
      expectError(validator("missing@domain"), "Invalid email address");
      expectError(validator("@example.com"), "Invalid email address");
    });

    test("returns value for valid email addresses", () => {
      const validator = isEmail();
      expectValue(validator("user@example.com"), "user@example.com");
      expectValue(validator("name.surname@company.co.uk"), "name.surname@company.co.uk");
    });
  });

  describe("isUrl", () => {
    test("returns error for invalid URLs", () => {
      const validator = isUrl();
      expectError(validator("not-a-url"), "Invalid URL");
      expectError(validator("example.com"), "Invalid URL");
    });

    test("returns value for valid URLs", () => {
      const validator = isUrl();
      expectValue(validator("https://example.com"), "https://example.com");
      expectValue(validator("http://localhost:3000/path"), "http://localhost:3000/path");
    });
  });
});

describe("Number Validators", () => {
  describe("min", () => {
    test("returns error when number is below minimum", () => {
      const validator = min(18);
      expectError(validator(17), "Must be at least 18");
    });

    test("returns value when number meets minimum", () => {
      const validator = min(18);
      expectValue(validator(18), 18);
      expectValue(validator(21), 21);
    });
  });

  describe("max", () => {
    test("returns error when number exceeds maximum", () => {
      const validator = max(100);
      expectError(validator(101), "Must be at most 100");
    });

    test("returns value when number is within maximum", () => {
      const validator = max(100);
      expectValue(validator(100), 100);
      expectValue(validator(50), 50);
    });
  });

  describe("integer", () => {
    test("returns error for non-integer numbers", () => {
      const validator = integer();
      expectError(validator(10.5), "Must be a whole number");
    });

    test("returns value for integer numbers", () => {
      const validator = integer();
      expectValue(validator(10), 10);
      expectValue(validator(-5), -5);
    });
  });

  describe("float", () => {
    test("returns error for integer numbers", () => {
      const validator = float();
      expectError(validator(10), "Must be a decimal number");
    });

    test("returns value for floating point numbers", () => {
      const validator = float();
      expectValue(validator(10.5), 10.5);
      expectValue(validator(0.001), 0.001);
    });
  });

  describe("number", () => {
    test("returns error for NaN", () => {
      const validator = number();
      expectError(validator(Number.NaN), "Must be a valid number");
    });

    test("returns error for Infinity", () => {
      const validator = number();
      expectError(validator(Infinity), "Must be a valid number");
      expectError(validator(-Infinity), "Must be a valid number");
    });

    test("returns value for valid numbers", () => {
      const validator = number();
      expectValue(validator(42), 42);
      expectValue(validator(-3.14), -3.14);
    });
  });

  describe("range", () => {
    test("returns error when number is outside range", () => {
      const validator = range(18, 65);
      expectError(validator(17), "Must be between 18 and 65 inclusive");
      expectError(validator(66), "Must be between 18 and 65 inclusive");
    });

    test("returns value when number is within range", () => {
      const validator = range(18, 65);
      expectValue(validator(18), 18);
      expectValue(validator(42), 42);
      expectValue(validator(65), 65);
    });
  });
});

describe("Type Conversion Validators", () => {
  describe("parseNumber", () => {
    test("returns error for empty strings", () => {
      const validator = parseNumber();
      expectError(validator(""), "Invalid number");
    });

    test("returns error for non-numeric strings", () => {
      const validator = parseNumber();
      expectError(validator("abc"), "Invalid number");
    });

    test("returns parsed number for valid numeric strings", () => {
      const validator = parseNumber();
      expectValue(validator("42"), 42);
      expectValue(validator("-3.14"), -3.14);
    });
  });

  describe("parseBoolean", () => {
    test("returns error for invalid boolean strings", () => {
      const validator = parseBoolean();
      expectError(validator("maybe"), "Invalid boolean value");
      expectError(validator("2"), "Invalid boolean value");
    });

    test("returns true for truthy strings", () => {
      const validator = parseBoolean();
      expectValue(validator("true"), true);
      expectValue(validator("yes"), true);
      expectValue(validator("1"), true);
      expectValue(validator("on"), true);
      expectValue(validator(" Yes "), true);
    });

    test("returns false for falsy strings", () => {
      const validator = parseBoolean();
      expectValue(validator("false"), false);
      expectValue(validator("no"), false);
      expectValue(validator("0"), false);
      expectValue(validator("off"), false);
      expectValue(validator(" No "), false);
    });
  });

  describe("parseDate", () => {
    test("returns error for invalid date strings", () => {
      const validator = parseDate();
      expectError(validator("not-a-date"), "Invalid date");
      expectError(validator("2022-13-45"), "Invalid date");
    });

    test("returns Date object for valid date strings", () => {
      const validator = parseDate();
      const result = validator("2022-01-01");
      expect(isOk(result)).toBe(true);
      expect(isErr(result)).toBe(false);
      if (isOk(result)) {
        expect(result.value).toBeInstanceOf(Date);
        expect(result.value.toISOString().split("T")[0]).toBe("2022-01-01");
      }
    });
  });

  describe("parseUTCDate", () => {
    test("returns error for invalid date strings", () => {
      const validator = parseUTCDate();
      expectError(validator("not-a-date"), "Invalid UTC date");
    });

    test("returns Date object for ISO 8601 date strings", () => {
      const validator = parseUTCDate();
      const result = validator("2022-01-01");
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBeInstanceOf(Date);
      }
    });

    test("returns Date object for other date formats", () => {
      const validator = parseUTCDate();
      const result = validator("Jan 1, 2022");
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBeInstanceOf(Date);
      }
    });

    test("returns error for invalid ISO 8601 date strings that match the regex pattern", () => {
      const validator = parseUTCDate();
      // This matches regex but is not a valid date (month 13)
      const result = validator("2022-13-01");
      expect(isErr(result)).toBe(true);
    });
  });
});

describe("Array Validators", () => {
  describe("minItems", () => {
    test("returns error when array has too few items", () => {
      const validator = minItems(3);
      expectError(validator([1, 2]), "Must have at least 3 items");
    });

    test("returns array when it has enough items", () => {
      const validator = minItems(3);
      expectValue(validator([1, 2, 3]), [1, 2, 3]);
      expectValue(validator([1, 2, 3, 4]), [1, 2, 3, 4]);
    });
  });

  describe("maxItems", () => {
    test("returns error when array has too many items", () => {
      const validator = maxItems(2);
      expectError(validator([1, 2, 3]), "Must have at most 2 items");
    });

    test("returns array when it has acceptable number of items", () => {
      const validator = maxItems(2);
      expectValue(validator([1]), [1]);
      expectValue(validator([1, 2]), [1, 2]);
    });
  });

  describe("validateArray", () => {
    test("returns error when any item fails validation", () => {
      const emailValidator = validateArray(isEmail(), "One or more emails are invalid");
      expectError(emailValidator(["valid@example.com", "invalid"]), "One or more emails are invalid");
    });

    test("returns transformed array when all items pass validation", () => {
      const numberValidator = validateArray(parseNumber());
      expectValue(numberValidator(["1", "2", "3"]), [1, 2, 3]);
    });

    test("returns combined error messages when not providing a custom message", () => {
      const emailValidator = validateArray(isEmail());
      const result = emailValidator(["valid@example.com", "invalid", "also.invalid"]);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBe("Invalid email address; Invalid email address");
      }
    });

    test("works with empty arrays", () => {
      const emailValidator = validateArray(isEmail());
      expectValue(emailValidator([]), []);
    });
  });
});

describe("Date Validators", () => {
  describe("dateRange", () => {
    const minDate = new Date("2022-01-01");
    const maxDate = new Date("2022-12-31");

    test("returns error when date is before minimum", () => {
      const validator = dateRange(minDate, maxDate);
      const tooEarly = new Date("2021-12-31");
      expectError(validator(tooEarly));
    });

    test("returns error when date is after maximum", () => {
      const validator = dateRange(minDate, maxDate);
      const tooLate = new Date("2023-01-01");
      expectError(validator(tooLate));
    });

    test("returns date when within range", () => {
      const validator = dateRange(minDate, maxDate);
      const validDate = new Date("2022-06-15");
      expectValue(validator(validDate), validDate);
    });

    test("accepts custom error message", () => {
      const validator = dateRange(minDate, maxDate, "Date must be in 2022");
      const tooLate = new Date("2023-01-01");
      expectError(validator(tooLate), "Date must be in 2022");
    });
  });
});

describe("Validator composition", () => {
  test("validators can be chained with pipe and andThen", () => {
    const validateUsername = (username: string) =>
      pipe(
        makeOk(username),
        andThen(required("Username is required")),
        andThen(minLength(3, "Username too short")),
        andThen(maxLength(20, "Username too long")),
        andThen(matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscore")),
      );

    expectError(validateUsername(""), "Username is required");
    expectError(validateUsername("ab"), "Username too short");
    expectError(validateUsername("a".repeat(21)), "Username too long");
    expectError(validateUsername("invalid@username"), "Username can only contain letters, numbers and underscore");
    expectValue(validateUsername("valid_username123"), "valid_username123");
  });

  test("complex validation with type conversion", () => {
    const validateAge = (ageStr: string) =>
      pipe(
        makeOk(ageStr),
        andThen(required("Age is required")),
        andThen(parseNumber("Please enter a valid number")),
        andThen(integer("Age must be a whole number")),
        andThen(range(18, 120, "Age must be between 18 and 120")),
      );

    expectError(validateAge(""), "Age is required");
    expectError(validateAge("abc"), "Please enter a valid number");
    expectError(validateAge("17.5"), "Age must be a whole number");
    expectError(validateAge("17"), "Age must be between 18 and 120");
    expectError(validateAge("121"), "Age must be between 18 and 120");
    expectValue(validateAge("21"), 21);
  });
});
