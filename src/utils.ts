/* eslint-disable unicorn/no-array-reduce */
import { isErr, ok, type Result } from "@railway-ts/core";

import type { ValidationError, Validator } from "./core";

/**
 * Combines multiple validators into a single validator, applying them in sequence (left to right).
 * Each validator's result is passed to the next validator in the chain.
 * The sequence stops and returns an error if any validator in the chain fails.
 */
export function composeRight<A, B>(v1: Validator<A, B>): Validator<A, B>;
export function composeRight<A, B, C>(v1: Validator<A, B>, v2: Validator<B, C>): Validator<A, C>;
export function composeRight<A, B, C, D>(
  v1: Validator<A, B>,
  v2: Validator<B, C>,
  v3: Validator<C, D>,
): Validator<A, D>;
export function composeRight<A, B, C, D, E>(
  v1: Validator<A, B>,
  v2: Validator<B, C>,
  v3: Validator<C, D>,
  v4: Validator<D, E>,
): Validator<A, E>;
export function composeRight<A, B, C, D, E, F>(
  v1: Validator<A, B>,
  v2: Validator<B, C>,
  v3: Validator<C, D>,
  v4: Validator<D, E>,
  v5: Validator<E, F>,
): Validator<A, F>;
export function composeRight<A, B, C, D, E, F, G>(
  v1: Validator<A, B>,
  v2: Validator<B, C>,
  v3: Validator<C, D>,
  v4: Validator<D, E>,
  v5: Validator<E, F>,
  v6: Validator<F, G>,
): Validator<A, G>;
export function composeRight<A, B, C, D, E, F, G, H>(
  v1: Validator<A, B>,
  v2: Validator<B, C>,
  v3: Validator<C, D>,
  v4: Validator<D, E>,
  v5: Validator<E, F>,
  v6: Validator<F, G>,
  v7: Validator<G, H>,
): Validator<A, H>;
export function composeRight<A, B, C, D, E, F, G, H, I>(
  v1: Validator<A, B>,
  v2: Validator<B, C>,
  v3: Validator<C, D>,
  v4: Validator<D, E>,
  v5: Validator<E, F>,
  v6: Validator<F, G>,
  v7: Validator<G, H>,
  v8: Validator<H, I>,
): Validator<A, I>;
export function composeRight<A, B, C, D, E, F, G, H, I, J>(
  v1: Validator<A, B>,
  v2: Validator<B, C>,
  v3: Validator<C, D>,
  v4: Validator<D, E>,
  v5: Validator<E, F>,
  v6: Validator<F, G>,
  v7: Validator<G, H>,
  v8: Validator<H, I>,
  v9: Validator<I, J>,
): Validator<A, J>;
export function composeRight<A, B, C, D, E, F, G, H, I, J, K>(
  v1: Validator<A, B>,
  v2: Validator<B, C>,
  v3: Validator<C, D>,
  v4: Validator<D, E>,
  v5: Validator<E, F>,
  v6: Validator<F, G>,
  v7: Validator<G, H>,
  v8: Validator<H, I>,
  v9: Validator<I, J>,
  v10: Validator<J, K>,
): Validator<A, K>;

/**
 * Implementation of composeRight that combines multiple validators into a single validator,
 * applying them in sequence (left to right).
 *
 * @template A - The input type for the first validator
 * @template B - The output type of the first validator and input type for the second validator (if any)
 * @template C, D, E, F, G, H, I, J, K - Types for subsequent validators in the chain
 *
 * @param {...Validator[]} validators - A list of validators to compose
 * @returns {Validator<unknown, unknown>} A combined validator that applies all validators in sequence
 *
 * @example
 * // Basic composition of string validators
 * const passwordValidator = composeRight(
 *   string(),
 *   nonEmpty(),
 *   minLength(8)
 * );
 *
 * const result = passwordValidator('password123');
 * // If valid: { ok: true, value: 'password123', [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // Chain validators with type conversion
 * const ageValidator = composeRight(
 *   parseString(),  // Converts to string
 *   nonEmpty(),     // Ensures not empty
 *   parseNumber()   // Converts to number
 * );
 *
 * const result = ageValidator('25');
 * // If valid: { ok: true, value: 25, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // Validation fails at first error
 * const result = composeRight(string(), minLength(5))('abc');
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be at least 5 characters' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const userSchema = object({
 *   name: required(string()),
 *   email: required(composeRight(string(), email())),
 *   age: required(composeRight(parseString(), parseNumber(), min(18)))
 * });
 */
export function composeRight(...validators: Validator<unknown, unknown>[]): Validator<unknown, unknown> {
  return (value, path = []) => {
    let result: Result<unknown, ValidationError[]> = ok(value);

    for (const validator of validators) {
      if (isErr(result)) return result;

      const nextResult = validator(result.value, path);
      result = isErr(nextResult) ? nextResult : ok(nextResult.value);
    }

    return result;
  };
}

/**
 * Validates a value against a validator.
 * This is a simple utility function that directly applies a validator to a value.
 *
 * @template T - The expected output type of the validator
 * @param {unknown} value - The value to validate
 * @param {Validator<unknown, T>} validator - The validator to apply to the value
 * @returns {Result<T, ValidationError[]>} A Result containing either the validated value or validation errors
 *
 * @example
 * // Validate a simple value
 * const numberValidator = composeRight(parseNumber(), min(5));
 * const result = validate(10, numberValidator);
 * // If valid: { ok: true, value: 10, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // Validation with errors
 * const result = validate('hello', number());
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be a number' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Check the result
 * const result = validate(userInput, userSchema);
 * if (isErr(result)) {
 *   // Handle validation errors
 *   const formattedErrors = formatErrors(result.error);
 *   displayErrors(formattedErrors);
 * } else {
 *   // Use the validated data
 *   saveUser(result.value);
 * }
 */
export function validate<T>(value: unknown, validator: Validator<unknown, T>): Result<T, ValidationError[]> {
  return validator(value);
}

/**
 * Formats validation errors into a more user-friendly object structure.
 * Converts array paths to a dot notation string format, suitable for form libraries or error displays.
 *
 * @param {ValidationError[]} errors - The array of validation errors to format
 * @returns {Record<string, string>} An object mapping paths to error messages
 *
 * @example
 * // Simple errors
 * const result = validate(data, schema);
 * if (isErr(result)) {
 *   const formatted = formatErrors(result.error);
 *   // { name: 'Name is required', 'address.zipCode': 'Invalid ZIP code' }
 * }
 *
 * @example
 * // Formatting errors with array indices
 * const schema = object({
 *   items: array(number())
 * });
 * const result = validate({ items: [1, 'two', 3] }, schema);
 * if (isErr(result)) {
 *   const formatted = formatErrors(result.error);
 *   // { 'items[1]': 'Must be a number' }
 * }
 *
 * @example
 * // Using formatted errors with a form library
 * const formErrors = formatErrors(validationErrors);
 * form.setErrors(formErrors);
 */
export function formatErrors(errors: ValidationError[]): Record<string, string> {
  return errors.reduce(
    (acc, error) => {
      const formattedPath = error.path.reduce((path, segment, index) => {
        if (/^\d+$/.test(segment)) {
          return `${path}[${segment}]`;
        } else {
          return index === 0 ? segment : `${path}.${segment}`;
        }
      }, "");

      // eslint-disable-next-line security/detect-object-injection
      acc[formattedPath] = error.message;
      return acc;
    },
    {} as Record<string, string>,
  );
}
