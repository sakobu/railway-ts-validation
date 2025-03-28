import { type Result, ok } from "@railway-ts/core/result";

/**
 * Creates a validator that only applies if the value is defined.
 * If the value is null/undefined, it passes through unchanged.
 *
 * @example
 * ```ts
 * // Website is optional but if provided must be a valid URL
 * pipe(
 *   ok<string | undefined, string>(website),
 *   andThen(optional(isUrl("Please enter a valid URL"))),
 *   // other validations...
 * );
 * ```
 *
 * @param validator - The validator to apply if value is present
 * @returns A validator function that handles optional values
 */
export const optional = <T, E>(validator: (value: T) => Result<T, E>) => {
  return (value: T | null | undefined): Result<T | null | undefined, E> => {
    if (value === null || value === undefined) {
      return ok(value);
    }
    return validator(value);
  };
};

/**
 * Creates a validator that only applies if the value is defined.
 * Handles transformations (like parseNumber) for optional values.
 *
 * @example
 * ```ts
 * // Parse age string to number if provided
 * pipe(
 *   ok<string | undefined, string>(ageStr),
 *   andThen(optionalTransform(parseNumber("Invalid number"))),
 *   // other validations...
 * );
 * ```
 *
 * @param validator - The validator to apply if value is present
 * @returns A validator function that handles optional transformations
 */
export const optionalTransform = <T, U, E>(validator: (value: T) => Result<U, E>) => {
  return (value: T | null | undefined): Result<U | null | undefined, E> => {
    if (value === null || value === undefined) {
      return ok(value as null | undefined);
    }
    return validator(value);
  };
};

/**
 * Provides a default value if input is null/undefined.
 *
 * @example
 * ```ts
 * // Set default role if not provided
 * pipe(
 *   ok<string | undefined, string>(role),
 *   andThen(withDefault("user")),
 *   andThen(oneOf(['admin', 'user', 'guest'], "Invalid role")),
 * );
 * ```
 *
 * @param defaultValue - The default value to use
 * @returns A validator function that ensures a non-null value
 */
export const withDefault = <T, E>(defaultValue: T) => {
  return (value: T | null | undefined): Result<T, E> => {
    return ok(value === null || value === undefined ? defaultValue : value);
  };
};
