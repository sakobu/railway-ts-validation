import { type Result, ok, err } from "@railway-ts/core/result";

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
