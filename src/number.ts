import { type Result, ok, err } from "@railway-ts/core/result";

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
