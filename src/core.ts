import { type Result, ok, err } from "@railway-ts/core/result";

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
