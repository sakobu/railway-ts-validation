import { type Result, ok, err, isErr } from "@railway-ts/core/result";

// ===================================================
// Core/Generic Validators
// ===================================================

/**
 * Creates a validator that checks if a value is defined (not null/undefined)
 *
 * @example
 * ```ts
 * // In a validation pipeline
 * pipe(
 *   ok<string, string>(username),
 *   andThen(required("Username is required")),
 *   // other validations...
 * );
 * ```
 *
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const required = <T>(message = "This field is required") => {
  return (value: T): Result<T, string> => {
    if (value === undefined || value === null) return err(message);
    if (typeof value === "string" && value.trim() === "") return err(message);
    return ok(value);
  };
};

/**
 * Creates a validator with a custom validation function
 *
 * @example
 * ```ts
 * // Email domain validation
 * const hasCorporateDomain = custom<string>(
 *   (email) => email.endsWith('@company.com'),
 *   "Email must be a company address"
 * );
 *
 * pipe(
 *   ok<string, string>(email),
 *   andThen(required("Email is required")),
 *   andThen(isEmail()),
 *   andThen(hasCorporateDomain),
 * );
 * ```
 *
 * @param predicate - A function that returns true if validation passes
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const custom = <T>(predicate: (value: T) => boolean, message: string) => {
  return (value: T): Result<T, string> => {
    if (!predicate(value)) {
      return err(message);
    }
    return ok(value);
  };
};

/**
 * Creates a validator for comparing two values (useful for password confirmation)
 *
 * @example
 * ```ts
 * // Password confirmation validation
 * const validatePasswordConfirmation = (password: string, confirmation: string) => {
 *   return pipe(
 *     ok<string, string>(confirmation),
 *     andThen(required("Please confirm your password")),
 *     andThen(equals(password, "Passwords do not match")),
 *   );
 * };
 * ```
 *
 * @param comparison - The value to compare against
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const equals = <T>(comparison: T, message: string) => {
  return (value: T): Result<T, string> => {
    if (value !== comparison) {
      return err(message);
    }
    return ok(value);
  };
};

/**
 * Creates a validator that checks if a value is not equal to another value
 *
 * @example
 * ```ts
 * // Ensure new password is different from old password
 * pipe(
 *   ok<string, string>(newPassword),
 *   andThen(required("New password is required")),
 *   andThen(notEquals(oldPassword, "New password must be different from the old one")),
 *   // other validations...
 * );
 * ```
 *
 * @param comparison - The value to compare against
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const notEquals = <T>(comparison: T, message: string) => {
  return (value: T): Result<T, string> => {
    if (value === comparison) {
      return err(message);
    }
    return ok(value);
  };
};

/**
 * Creates a validator that checks if a value is one of the allowed values
 *
 * @example
 * ```ts
 * // Role validation
 * pipe(
 *   ok<string, string>(role),
 *   andThen(oneOf(['admin', 'user', 'guest'], "Invalid role selected")),
 *   // other validations...
 * );
 * ```
 *
 * @param allowedValues - Array of allowed values
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const oneOf = <T>(allowedValues: readonly T[], message?: string) => {
  return (value: T): Result<T, string> => {
    if (!allowedValues.includes(value)) {
      return err(message || `Must be one of: ${allowedValues.join(", ")}`);
    }
    return ok(value);
  };
};

// ===================================================
// String Validators
// ===================================================

/**
 * Creates a validator for minimum string length
 *
 * @example
 * ```ts
 * // In a validation pipeline
 * pipe(
 *   ok<string, string>(username),
 *   andThen(required("Username is required")),
 *   andThen(minLength(3, "Username too short")),
 *   // other validations...
 * );
 * ```
 *
 * @param min - The minimum length required
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const minLength = (min: number, message?: string) => {
  return (value: string): Result<string, string> => {
    if (value.length < min) {
      return err(message || `Must be at least ${min} characters`);
    }
    return ok(value);
  };
};

/**
 * Creates a validator for maximum string length
 *
 * @example
 * ```ts
 * // In a validation pipeline
 * pipe(
 *   ok<string, string>(value),
 *   andThen(maxLength(50, "Description too long")),
 *   // other validations...
 * );
 * ```
 *
 * @param max - The maximum length allowed
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const maxLength = (max: number, message?: string) => {
  return (value: string): Result<string, string> => {
    if (value.length > max) {
      return err(message || `Must be at most ${max} characters`);
    }
    return ok(value);
  };
};

/**
 * Creates a validator that checks if a string has an exact length
 *
 * @example
 * ```ts
 * // Verification code validation
 * pipe(
 *   ok<string, string>(verificationCode),
 *   andThen(required("Verification code is required")),
 *   andThen(exactLength(6, "Verification code must be exactly 6 characters")),
 *   // other validations...
 * );
 * ```
 *
 * @param length - The exact length required
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const exactLength = (length: number, message?: string) => {
  return (value: string): Result<string, string> => {
    if (value.length !== length) {
      return err(message || `Must be exactly ${length} characters`);
    }
    return ok(value);
  };
};

/**
 * Creates a validator that checks a string against a regex pattern
 *
 * @example
 * ```ts
 * // Validate username format
 * pipe(
 *   ok<string, string>(username),
 *   andThen(matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscore")),
 *   // other validations...
 * );
 *
 * // Password complexity validation
 * pipe(
 *   ok<string, string>(password),
 *   andThen(matches(/[A-Z]/, "Password must contain an uppercase letter")),
 *   andThen(matches(/[a-z]/, "Password must contain a lowercase letter")),
 *   andThen(matches(/[0-9]/, "Password must contain a number")),
 *   // other validations...
 * );
 * ```
 *
 * @param regex - The regex pattern to match
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const matches = (regex: RegExp, message: string) => {
  return (value: string): Result<string, string> => {
    if (!regex.test(value)) {
      return err(message);
    }
    return ok(value);
  };
};

/**
 * Email validator
 *
 * @example
 * ```ts
 * // Email validation
 * pipe(
 *   ok<string, string>(email),
 *   andThen(required("Email is required")),
 *   andThen(isEmail()),
 *   // other validations...
 * );
 * ```
 *
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const isEmail = (message = "Invalid email address") => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return (value: string): Result<string, string> => {
    if (!emailRegex.test(value)) {
      return err(message);
    }
    return ok(value);
  };
};

/**
 * URL validator
 *
 * @example
 * ```ts
 * // Website URL validation
 * pipe(
 *   ok<string, string>(websiteUrl),
 *   andThen(required("Website URL is required")),
 *   andThen(isUrl()),
 *   // other validations...
 * );
 * ```
 *
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const isUrl = (message = "Invalid URL") => {
  return (value: string): Result<string, string> => {
    try {
      new URL(value);
      return ok(value);
    } catch {
      return err(message);
    }
  };
};

// ===================================================
// Number Validators
// ===================================================

/**
 * Creates a validator for minimum numeric value
 *
 * @example
 * ```ts
 * // Age validation
 * pipe(
 *   ok<number, string>(age),
 *   andThen(min(18, "You must be at least 18 years old")),
 *   // other validations...
 * );
 * ```
 *
 * @param minimum - The minimum value required
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const min = (minimum: number, message?: string) => {
  return (value: number): Result<number, string> => {
    if (value < minimum) {
      return err(message || `Must be at least ${minimum}`);
    }
    return ok(value);
  };
};

/**
 * Creates a validator for maximum numeric value
 *
 * @example
 * ```ts
 * // Price validation
 * pipe(
 *   ok<number, string>(price),
 *   andThen(max(1000, "Price cannot exceed $1000")),
 *   // other validations...
 * );
 * ```
 *
 * @param maximum - The maximum value allowed
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const max = (maximum: number, message?: string) => {
  return (value: number): Result<number, string> => {
    if (value > maximum) {
      return err(message || `Must be at most ${maximum}`);
    }
    return ok(value);
  };
};

/**
 * Creates a validator that checks for integer values
 *
 * @example
 * ```ts
 * // Age validation
 * pipe(
 *   ok<number, string>(age),
 *   andThen(integer("Age must be a whole number")),
 *   // other validations...
 * );
 * ```
 *
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const integer = (message = "Must be a whole number") => {
  return (value: number): Result<number, string> => {
    if (!Number.isInteger(value)) {
      return err(message);
    }
    return ok(value);
  };
};

/**
 * Creates a validator that checks for decimal/float values
 *
 * @example
 * ```ts
 * // Price validation requiring cents
 * pipe(
 *   ok<number, string>(price),
 *   andThen(float("Price must include cents (e.g., 10.99)")),
 *   // other validations...
 * );
 *
 * // Weight validation requiring precision
 * pipe(
 *   ok<string, string>(weightStr),
 *   andThen(required("Weight is required")),
 *   andThen(parseNumber("Please enter a valid number")),
 *   andThen(float("Weight must include decimal precision")),
 *   andThen(min(0.1, "Weight must be greater than 0.1")),
 *   // other validations...
 * );
 * ```
 *
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const float = (message = "Must be a decimal number") => {
  return (value: number): Result<number, string> => {
    if (Number.isInteger(value)) {
      return err(message);
    }
    return ok(value);
  };
};

/**
 * Creates a validator that checks for valid number values (not NaN or Infinity)
 *
 * @example
 * ```ts
 * // Generic number validation
 * pipe(
 *   ok<string, string>(inputStr),
 *   andThen(required("Input is required")),
 *   andThen(parseNumber("Please enter a valid number")),
 *   andThen(number("Must be a finite number")),
 *   // other validations...
 * );
 *
 * // Calculation result validation
 * const calculateValue = (input: number): number => {
 *   // Some calculation that might result in NaN or Infinity
 *   return input / (input - 100);
 * };
 *
 * pipe(
 *   ok<number, string>(calculateValue(userInput)),
 *   andThen(number("Calculation produced an invalid result")),
 *   // other validations...
 * );
 * ```
 *
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const number = (message = "Must be a valid number") => {
  return (value: number): Result<number, string> => {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      return err(message);
    }
    return ok(value);
  };
};

/**
 * Creates a validator that checks if a number is within a specified range
 *
 * @example
 * ```ts
 * // Age validation for a specific range
 * pipe(
 *   ok<number, string>(age),
 *   andThen(range(18, 65, "Age must be between 18 and 65")),
 *   // other validations...
 * );
 * ```
 *
 * @param minimum - The minimum value allowed
 * @param maximum - The maximum value allowed
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const range = (minimum: number, maximum: number, message?: string) => {
  return (value: number): Result<number, string> => {
    if (value < minimum || value > maximum) {
      return err(message || `Must be between ${minimum} and ${maximum} inclusive`);
    }
    return ok(value);
  };
};

// ===================================================
// Type Conversions
// ===================================================

/**
 * Converts string to number and validates
 *
 * @example
 * ```ts
 * // Age validation from string input
 * pipe(
 *   ok<string, string>(ageStr),
 *   andThen(required("Age is required")),
 *   andThen(parseNumber("Please enter a valid number")),
 *   andThen(min(18, "You must be at least 18 years old")),
 *   // other validations...
 * );
 * ```
 *
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const parseNumber = (message = "Invalid number") => {
  return (value: string): Result<number, string> => {
    if (value === "") return err(message);
    const num = Number(value);
    if (Number.isNaN(num)) {
      return err(message);
    }
    return ok(num);
  };
};

/**
 * Converts a string to a boolean and validates
 *
 * @example
 * ```ts
 * // Convert string checkbox value to boolean
 * pipe(
 *   ok<string, string>(termsAccepted),
 *   andThen(parseBoolean("Invalid boolean value")),
 *   // other validations...
 * );
 * ```
 *
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const parseBoolean = (message = "Invalid boolean value") => {
  return (value: string): Result<boolean, string> => {
    const normalized = value.toLowerCase().trim();

    if (["true", "yes", "1", "on"].includes(normalized)) {
      return ok(true);
    }

    if (["false", "no", "0", "off"].includes(normalized)) {
      return ok(false);
    }

    return err(message);
  };
};

/**
 * Converts string to date and validates
 *
 * @example
 * ```ts
 * // Date validation
 * pipe(
 *   ok<string, string>(dateStr),
 *   andThen(required("Date is required")),
 *   andThen(parseDate("Please enter a valid date")),
 *   // other validations...
 * );
 * ```
 *
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const parseDate = (message = "Invalid date") => {
  return (value: string): Result<Date, string> => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return err(message);
    }
    return ok(date);
  };
};

/**
 * Converts string to UTC date and validates
 *
 * @example
 * ```ts
 * // UTC date validation
 * pipe(
 *   ok<string, string>(dateStr),
 *   andThen(required("Date is required")),
 *   andThen(parseUTCDate("Please enter a valid UTC date")),
 *   // other validations...
 * );
 * ```
 *
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const parseUTCDate = (message = "Invalid UTC date") => {
  return (value: string): Result<Date, string> => {
    // Handle ISO 8601 date format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // When date is in YYYY-MM-DD format, it's interpreted as UTC
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return ok(date);
      }
    }

    // Parse as regular date and check validity
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return err(message);
    }
    return ok(date);
  };
};

// ===================================================
// Array Validators
// ===================================================

/**
 * Validates minimum number of items in an array
 *
 * @example
 * ```ts
 * // Validate that a user has selected at least 2 options
 * pipe(
 *   ok<string[], string>(selectedOptions),
 *   andThen(minItems(2, "Please select at least 2 options")),
 *   // other validations...
 * );
 * ```
 *
 * @param min - The minimum number of items required
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const minItems = <T>(min: number, message?: string) => {
  return (value: T[]): Result<T[], string> => {
    if (value.length < min) {
      return err(message || `Must have at least ${min} items`);
    }
    return ok(value);
  };
};

/**
 * Validates maximum number of items in an array
 *
 * @example
 * ```ts
 * // Validate that a user hasn't selected too many options
 * pipe(
 *   ok<string[], string>(selectedOptions),
 *   andThen(maxItems(5, "You can select up to 5 options")),
 *   // other validations...
 * );
 * ```
 *
 * @param max - The maximum number of items allowed
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const maxItems = <T>(max: number, message?: string) => {
  return (value: T[]): Result<T[], string> => {
    if (value.length > max) {
      return err(message || `Must have at most ${max} items`);
    }
    return ok(value);
  };
};

/**
 * Creates a validator that applies a validator to each item in an array
 *
 * @example
 * ```ts
 * // Validate each email in a list
 * pipe(
 *   ok<string[], string>(emails),
 *   andThen(minItems(1, "At least one email is required")),
 *   andThen(validateArray(isEmail(), "One or more emails are invalid")),
 *   // other validations...
 * );
 * ```
 *
 * @param validator - The validator to apply to each item
 * @param message - The error message to return if any item fails validation
 * @returns A validator function that returns a Result
 */
export const validateArray = <T, U = T>(validator: (value: T) => Result<U, string>, message?: string) => {
  return (values: T[]): Result<U[], string> => {
    const results = values.map((element) => validator(element));
    const errors = results.filter((element) => isErr(element)).map((r) => r.error);

    if (errors.length > 0) {
      return err(message || errors.join("; "));
    }

    return ok(results.map((r) => (r as { value: U }).value));
  };
};

// ===================================================
// Date Validators
// ===================================================

/**
 * Creates a validator that checks if a date is within a specified range
 *
 * @example
 * ```ts
 * // Event date validation
 * const today = new Date();
 * const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
 *
 * pipe(
 *   ok<string, string>(eventDateStr),
 *   andThen(parseDate("Invalid date format")),
 *   andThen(dateRange(today, nextYear, "Event must be scheduled between today and next year")),
 *   // other validations...
 * );
 * ```
 *
 * @param minDate - The minimum date allowed
 * @param maxDate - The maximum date allowed
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const dateRange = (minDate: Date, maxDate: Date, message?: string) => {
  return (value: Date): Result<Date, string> => {
    if (value < minDate || value > maxDate) {
      return err(
        message ||
          `Date must be between ${minDate.toISOString().split("T")[0]} and ${maxDate.toISOString().split("T")[0]}`,
      );
    }
    return ok(value);
  };
};
