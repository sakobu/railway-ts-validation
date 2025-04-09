import { err, isOk, ok } from "@railway-ts/core";

import { parseNumber } from "./parsers";
import { string } from "./string";
import { composeRight } from "./utils";

import type { ValidationError, Validator } from "./core";

/**
 * Creates a validator for arrays where each item is validated by the provided item validator.
 *
 * @template I - The input type of items the validator accepts
 * @template O - The output type of items after validation
 *
 * @param {Validator<I, O>} itemValidator - The validator to apply to each array item
 * @returns {Validator<unknown, O[]>} A validator that validates arrays of items
 *
 * @example
 * // Validate an array of strings
 * const stringArrayValidator = array(string());
 *
 * @example
 * // Validate an array of enum values
 * const contactsValidator = array(stringEnum(['email', 'phone']));
 * const result = contactsValidator(['email', 'phone']);
 * // If valid: { ok: true, value: ['email', 'phone'], [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // Used in an object schema
 * const userSchema = object({
 *   contacts: optional(array(stringEnum(['email', 'phone'])))
 * });
 */
export function array<I, O>(itemValidator: Validator<I, O>): Validator<unknown, O[]> {
  return (value, parentPath = []) => {
    if (!Array.isArray(value)) {
      return err([{ path: parentPath, message: "Expected an array" }]);
    }

    const allErrors: ValidationError[] = [];
    const validatedItems: O[] = [];

    for (const [i, item] of value.entries()) {
      const itemPath = [...parentPath, i.toString()];

      const result = itemValidator(item as I, itemPath);

      if (isOk(result)) {
        validatedItems.push(result.value);
      } else {
        allErrors.push(...result.error);
      }
    }

    if (allErrors.length > 0) {
      return err(allErrors);
    }

    return ok(validatedItems);
  };
}

/**
 * Creates a validator that ensures a value is one of the allowed values.
 *
 * @template T - The type of the values being validated
 *
 * @param {T[]} allowedValues - Array of acceptable values
 * @param {string} [message] - Custom error message (defaults to a list of allowed values)
 * @returns {Validator<T>} A validator that checks if a value is in the allowed list
 *
 * @example
 * // Validate that a value is one of the specified options
 * const statusValidator = oneOf(['pending', 'approved', 'rejected']);
 * const result = statusValidator('approved');
 * // If valid: { ok: true, value: 'approved', [RESULT_BRAND]: 'ok' }
 * // If invalid: { ok: false, error: [{ path: [], message: 'Value must be one of: pending, approved, rejected' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // With custom error message
 * const priorityValidator = oneOf([1, 2, 3], 'Priority must be between 1 and 3');
 */
export function oneOf<T>(
  allowedValues: T[],
  message: string = `Value must be one of: ${allowedValues.join(", ")}`,
): Validator<T> {
  return (value, path = []) => {
    if (!allowedValues.includes(value)) {
      return err([{ path, message }]);
    }
    return ok(value);
  };
}

/**
 * Creates a validator that ensures a value is a string and one of the allowed enum values.
 * This validator first checks that the input is a string, then validates it against the allowed values.
 *
 * @template T - The string literal union type of allowed values
 *
 * @param {T[]} allowedValues - Array of acceptable string enum values
 * @param {string} [message] - Custom error message (defaults to a list of allowed values)
 * @returns {Validator<unknown, T>} A validator that checks if a value is a string and in the allowed list
 *
 * @example
 * // Validate that a value is one of the specified string options
 * const roleValidator = stringEnum(['admin', 'user']);
 * const result = roleValidator('admin');
 * // If valid: { ok: true, value: 'admin', [RESULT_BRAND]: 'ok' }
 * // If invalid: { ok: false, error: [{ path: [], message: 'Value must be one of: admin, user' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const userSchema = object({
 *   role: required(stringEnum(['admin', 'user'])),
 *   contacts: optional(array(stringEnum(['email', 'phone'])))
 * });
 */
export function stringEnum<T extends string>(
  allowedValues: T[],
  message: string = `Value must be one of: ${allowedValues.join(", ")}`,
): Validator<unknown, T> {
  return composeRight(string("Value must be a string"), (value: string, path = []) => {
    if (!allowedValues.includes(value as T)) {
      return err([{ path, message }]);
    }
    return ok(value as T);
  });
}

/**
 * Creates a validator for arrays of numbers. Each array item is automatically parsed as a number.
 * This validator first checks if the input is an array, then attempts to parse each element as a number.
 *
 * @param {string} [message='Must be a valid number'] - Custom error message for invalid number values
 * @returns {Validator<unknown, number[]>} A validator that parses and validates arrays of numbers
 *
 * @example
 * // Validate an array of numbers
 * const scoresValidator = numberArray();
 * const result = scoresValidator(['10', 20, '30']);
 * // If valid: { ok: true, value: [10, 20, 30], [RESULT_BRAND]: 'ok' } - Note that string numbers are converted
 *
 * @example
 * // With custom error message
 * const idsValidator = numberArray('Each ID must be a valid number');
 * const result = idsValidator(['abc', 123]);
 * // Fails with the custom error message for the first item
 *
 * @example
 * // Used in an object schema
 * const productSchema = object({
 *   prices: required(numberArray())
 * });
 */
export function numberArray(message: string = "Must be a valid number"): Validator<unknown, number[]> {
  return array(parseNumber(message));
}

/**
 * Creates a validator for arrays where each item must be one of the specified string options.
 * This is a convenience function that combines `array()` and `stringEnum()` validators.
 *
 * @template T - The string literal union type of allowed values
 *
 * @param {T[]} options - Array of acceptable string values for each item in the array
 * @param {string} [message] - Custom error message (defaults to a list of allowed values)
 * @returns {Validator<unknown, T[]>} A validator that validates arrays of string enum values
 *
 * @example
 * // Validate an array where each item must be one of the specified options
 * const contactTypesValidator = selectionArray(['email', 'phone', 'mail']);
 * const result = contactTypesValidator(['email', 'phone']);
 * // If valid: { ok: true, value: ['email', 'phone'], [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With invalid data
 * const result = contactTypesValidator(['email', 'fax']);
 * // Fails because 'fax' is not in the allowed options
 *
 * @example
 * // Used in an object schema
 * const userSchema = object({
 *   contactPreferences: required(selectionArray(['email', 'phone', 'mail']))
 * });
 */
export function selectionArray<T extends string>(
  options: T[],
  message: string = `Value must be one of: ${options.join(", ")}`,
): Validator<unknown, T[]> {
  return array(stringEnum(options, message));
}
