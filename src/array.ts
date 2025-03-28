import { type Result, ok, err, isErr } from "@railway-ts/core/result";

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
