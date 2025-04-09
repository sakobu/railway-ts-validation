import { err, ok } from "@railway-ts/core";

import type { Validator } from "./core";

/**
 * Creates a validator that ensures a boolean value is true (checked).
 * Typically used for validating checkbox fields like terms acceptance.
 *
 * @param {string} [message='You must check this field'] - Custom error message
 * @returns {Validator<boolean>} A validator that confirms the value is true
 *
 * @example
 * // Validate that a terms acceptance checkbox is checked
 * const termsValidator = mustBeChecked();
 * const result = termsValidator(true);
 * // If valid: { ok: true, value: true, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With custom error message
 * const privacyValidator = mustBeChecked('You must accept the privacy policy');
 * const result = privacyValidator(false);
 * // If invalid: { ok: false, error: [{ path: [], message: 'You must accept the privacy policy' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const userSchema = object({
 *   hasAcceptedTerms: required(composeRight(parseBool(), mustBeChecked()))
 * });
 */
export function mustBeChecked(message: string = "You must check this field"): Validator<boolean> {
  return (value, path = []) => {
    if (value !== true) {
      return err([{ path, message }]);
    }
    return ok(value);
  };
}

/**
 * Creates a validator that ensures a value is a boolean.
 *
 * @param {string} [message='Must be a boolean'] - Custom error message
 * @returns {Validator<unknown, boolean>} A validator that checks if a value is a boolean
 *
 * @example
 * // Validate that a value is a boolean
 * const boolValidator = boolean();
 * const result = boolValidator(true);
 * // If valid: { ok: true, value: true, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With invalid input
 * const result = boolean()('not a boolean');
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be a boolean' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const featureSchema = object({
 *   isEnabled: required(boolean())
 * });
 */
export function boolean(message: string = "Must be a boolean"): Validator<unknown, boolean> {
  return (value, path = []) => {
    if (typeof value !== "boolean") {
      return err([{ path, message }]);
    }
    return ok(value);
  };
}

/**
 * Creates a validator that ensures a boolean value is false.
 *
 * @param {string} [message='Value must be false'] - Custom error message
 * @returns {Validator<boolean>} A validator that confirms the value is false
 *
 * @example
 * // Validate that a feature is disabled (false)
 * const disabledValidator = isFalse();
 * const result = disabledValidator(false);
 * // If valid: { ok: true, value: false, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With invalid input
 * const result = isFalse()(true);
 * // If invalid: { ok: false, error: [{ path: [], message: 'Value must be false' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema with custom message
 * const featureSchema = object({
 *   isExperimental: required(isFalse('This feature must be disabled'))
 * });
 */
export function isFalse(message: string = "Value must be false"): Validator<boolean> {
  return (value, path = []) => {
    if (value !== false) {
      return err([{ path, message }]);
    }
    return ok(value);
  };
}

/**
 * Creates a validator that ensures a boolean value matches the expected value.
 *
 * @param {boolean} expected - The expected boolean value
 * @param {string} [message] - Custom error message (defaults to 'Value must be {expected}')
 * @returns {Validator<boolean>} A validator that confirms the value matches the expected boolean
 *
 * @example
 * // Validate that a feature is enabled (true)
 * const enabledValidator = matches(true);
 * const result = enabledValidator(true);
 * // If valid: { ok: true, value: true, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With custom message
 * const disabledValidator = matches(false, 'The option must be turned off');
 * const result = disabledValidator(true);
 * // If invalid: { ok: false, error: [{ path: [], message: 'The option must be turned off' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const featureSchema = object({
 *   isEnabled: required(matches(true, 'This feature must be enabled'))
 * });
 */
export function matches(expected: boolean, message: string = `Value must be ${expected}`): Validator<boolean> {
  return (value, path = []) => {
    if (value !== expected) {
      return err([{ path, message }]);
    }
    return ok(value);
  };
}

/**
 * Creates a validator that ensures a value is either a boolean or null.
 *
 * @param {string} [message='Must be a boolean or null'] - Custom error message
 * @returns {Validator<unknown, boolean | null>} A validator that checks if a value is a boolean or null
 *
 * @example
 * // Validate that a value is a boolean or null
 * const nullableBoolValidator = isNullable();
 * const result1 = nullableBoolValidator(true);
 * // If valid: { ok: true, value: true, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With null input
 * const result = isNullable()(null);
 * // If valid: { ok: true, value: null, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With invalid input
 * const result = isNullable()('not a boolean');
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be a boolean or null' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const featureSchema = object({
 *   isEnabled: optional(isNullable())
 * });
 */
export function isNullable(message: string = "Must be a boolean or null"): Validator<unknown, boolean | null> {
  return (value, path = []) => {
    if (value === null) {
      // eslint-disable-next-line unicorn/no-null
      return ok(null);
    }
    if (typeof value !== "boolean") {
      return err([{ path, message }]);
    }
    return ok(value);
  };
}
