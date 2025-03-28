import { type Result, ok, err } from "@railway-ts/core/result";

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
