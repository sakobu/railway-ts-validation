import { err, fromTry, isOk, mapErrorResult, ok } from "@railway-ts/core";

import type { Validator } from "./core";

/**
 * Creates a validator that parses input into a number.
 * Accepts both numbers and string representations of numbers.
 *
 * @param {string} [message='Must be a valid number'] - Custom error message
 * @returns {Validator<unknown, number>} A validator that parses and validates numbers
 *
 * @example
 * // Parse a string into a number
 * const ageValidator = parseNumber();
 * const result = ageValidator('25');
 * // If valid: { ok: true, value: 25, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // Already a number
 * const result = parseNumber()(42);
 * // If valid: { ok: true, value: 42, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With invalid input
 * const result = parseNumber()('not a number');
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be a valid number' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const userSchema = object({
 *   age: required(parseNumber('Age must be a valid number'))
 * });
 */
export function parseNumber(message: string = "Must be a valid number"): Validator<unknown, number> {
  return (value, path = []) => {
    if (typeof value === "number") {
      return ok(value);
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "") {
        return err([{ path, message }]);
      }

      const num = Number(trimmed);
      if (!Number.isNaN(num)) {
        return ok(num);
      }
    }

    return err([{ path, message }]);
  };
}

/**
 * Creates a validator that parses input into a Date object.
 * Accepts Date objects, strings that can be parsed as dates, and numeric timestamps.
 *
 * @param {string} [message='Must be a valid date'] - Custom error message
 * @returns {Validator<unknown, Date>} A validator that parses and validates dates
 *
 * @example
 * // Parse a string into a Date
 * const birthdateValidator = parseDate();
 * const result = birthdateValidator('1990-05-15');
 * // If valid: { ok: true, value: Date(1990-05-15), [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // Already a Date object
 * const today = new Date();
 * const result = parseDate()(today);
 * // If valid: { ok: true, value: today, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With timestamp
 * const result = parseDate()(1621036800000); // May 15, 2021
 * // If valid: { ok: true, value: Date(2021-05-15), [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With invalid input
 * const result = parseDate()('not a date');
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be a valid date' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const eventSchema = object({
 *   eventDate: required(parseDate('Event date must be valid'))
 * });
 */
export function parseDate(message: string = "Must be a valid date"): Validator<unknown, Date> {
  return (value, path = []) => {
    if (value instanceof Date) {
      return ok(value);
    }

    let dateValue: Date;

    if (typeof value === "string") {
      dateValue = new Date(value);
    } else if (typeof value === "number") {
      dateValue = new Date(value);
    } else {
      return err([{ path, message }]);
    }

    if (Number.isNaN(dateValue.getTime())) {
      return err([{ path, message }]);
    }

    return ok(dateValue);
  };
}

/**
 * Creates a validator that parses input into a boolean.
 * Accepts booleans, 0/1, and strings like 'true'/'false', 'yes'/'no'.
 *
 * @param {string} [message='Must be a valid boolean value'] - Custom error message
 * @returns {Validator<unknown, boolean>} A validator that parses and validates booleans
 *
 * @example
 * // Parse a string into a boolean
 * const consentValidator = parseBool();
 * const result = consentValidator('yes');
 * // If valid: { ok: true, value: true, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // Various truthy values
 * parseBool()('true');   // { ok: true, value: true }
 * parseBool()('yes');    // { ok: true, value: true }
 * parseBool()('1');      // { ok: true, value: true }
 * parseBool()(1);        // { ok: true, value: true }
 *
 * @example
 * // Various falsy values
 * parseBool()('false');  // { ok: true, value: false }
 * parseBool()('no');     // { ok: true, value: false }
 * parseBool()('0');      // { ok: true, value: false }
 * parseBool()(0);        // { ok: true, value: false }
 *
 * @example
 * // With invalid input
 * const result = parseBool()('maybe');
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be a valid boolean value' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const userSchema = object({
 *   hasAcceptedTerms: required(parseBool('Please indicate whether you accept the terms'))
 * });
 */
export function parseBool(message: string = "Must be a valid boolean value"): Validator<unknown, boolean> {
  return (value, path = []) => {
    if (typeof value === "boolean") {
      return ok(value);
    }

    if (typeof value === "string") {
      const normalized = value.toLowerCase().trim();
      if (normalized === "true" || normalized === "1" || normalized === "yes") {
        return ok(true);
      }
      if (normalized === "false" || normalized === "0" || normalized === "no") {
        return ok(false);
      }
    }

    if (typeof value === "number") {
      if (value === 1) return ok(true);
      if (value === 0) return ok(false);
    }

    return err([{ path, message }]);
  };
}

/**
 * Creates a validator that parses input into a string.
 * Accepts strings and any value that can be converted to a string, except null and undefined.
 *
 * @param {string} [message='Must be convertible to string'] - Custom error message
 * @returns {Validator<unknown, string>} A validator that parses and validates strings
 *
 * @example
 * // Convert a number to string
 * const codeValidator = parseString();
 * const result = codeValidator(12345);
 * // If valid: { ok: true, value: '12345', [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // Already a string
 * const result = parseString()('hello');
 * // If valid: { ok: true, value: 'hello', [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With invalid input
 * const result = parseString()(null);
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be convertible to string' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const productSchema = object({
 *   sku: required(parseString('Product SKU is required'))
 * });
 */
export function parseString(message: string = "Must be convertible to string"): Validator<unknown, string> {
  return (value, path = []) => {
    if (typeof value === "string") {
      return ok(value);
    }

    if (value === null || value === undefined) {
      return err([{ path, message }]);
    }

    return ok(String(value));
  };
}

/**
 * Creates a validator that parses JSON strings into objects.
 * Accepts JSON strings or already parsed objects.
 *
 * @param {string} [message='Must be valid JSON'] - Custom error message
 * @returns {Validator<unknown, unknown>} A validator that parses and validates JSON
 *
 * @example
 * // Parse a JSON string
 * const configValidator = parseJSON();
 * const result = configValidator('{"name":"John","age":30}');
 * // If valid: { ok: true, value: {name: 'John', age: 30}, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // Already an object
 * const result = parseJSON()({name: 'John', age: 30});
 * // If valid: { ok: true, value: {name: 'John', age: 30}, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With invalid input
 * const result = parseJSON()('{name: John}'); // Invalid JSON syntax
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be valid JSON' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const configSchema = object({
 *   settings: required(parseJSON('Settings must be valid JSON'))
 * });
 */
export function parseJSON(message: string = "Must be valid JSON"): Validator<unknown, unknown> {
  return (value, path = []) => {
    if (typeof value === "string") {
      return mapErrorResult(
        fromTry(() => JSON.parse(value)),
        () => [{ path, message }],
      );
    }

    if (typeof value === "object" && value !== null) {
      return ok(value);
    }

    return err([{ path, message }]);
  };
}

/**
 * Creates a validator that parses input into an integer.
 * Accepts integers and string representations of integers.
 *
 * @param {string} [message='Must be a valid integer'] - Custom error message
 * @returns {Validator<unknown, number>} A validator that parses and validates integers
 *
 * @example
 * // Parse a string into an integer
 * const quantityValidator = parseInteger();
 * const result = quantityValidator('42');
 * // If valid: { ok: true, value: 42, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // Already a number
 * const result = parseInteger()(100);
 * // If valid: { ok: true, value: 100, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With invalid input (float)
 * const result = parseInteger()('3.14');
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be a valid integer' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // With invalid input (non-number)
 * const result = parseInteger()('not a number');
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be a valid integer' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const orderSchema = object({
 *   quantity: required(parseInteger('Quantity must be a whole number'))
 * });
 */
export function parseInteger(message: string = "Must be a valid integer"): Validator<unknown, number> {
  return (value, path = []) => {
    const numResult = parseNumber(message)(value, path);

    if (isOk(numResult)) {
      const num = numResult.value;
      if (!Number.isInteger(num)) {
        return err([{ path, message }]);
      }
      return ok(num);
    }

    return numResult;
  };
}

/**
 * Creates a validator that parses ISO format date strings (YYYY-MM-DD) into Date objects.
 * Performs strict validation of the date format and validity.
 *
 * @param {string} [message='Must be a valid ISO date string'] - Custom error message
 * @returns {Validator<unknown, Date>} A validator that parses and validates ISO date strings
 *
 * @example
 * // Parse an ISO date string
 * const birthdateValidator = parseISODate();
 * const result = birthdateValidator('2021-05-15');
 * // If valid: { ok: true, value: Date(2021-05-15), [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With invalid format
 * const result = parseISODate()('15/05/2021');
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be a valid ISO date string' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // With invalid date
 * const result = parseISODate()('2021-02-30'); // February doesn't have 30 days
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be a valid ISO date string' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const eventSchema = object({
 *   startDate: required(parseISODate('Start date must be in YYYY-MM-DD format'))
 * });
 */
export function parseISODate(message: string = "Must be a valid ISO date string"): Validator<unknown, Date> {
  return (value, path = []) => {
    if (typeof value !== "string") {
      return err([{ path, message }]);
    }

    if (!/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return err([{ path, message }]);
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return err([{ path, message }]);
    }

    const originalMonth = value.slice(5, 7);
    const originalDay = value.slice(8, 10);
    const parsedMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
    const parsedDay = String(date.getUTCDate()).padStart(2, "0");

    if (originalMonth !== parsedMonth || originalDay !== parsedDay) {
      return err([{ path, message }]);
    }

    return ok(date);
  };
}

/**
 * Creates a validator that parses string URLs into URL objects.
 * Validates that the URL is properly formatted and can be parsed.
 *
 * @param {string} [message='Must be a valid URL'] - Custom error message
 * @returns {Validator<unknown, URL>} A validator that parses and validates URLs
 *
 * @example
 * // Parse a URL string
 * const websiteValidator = parseURL();
 * const result = websiteValidator('https://example.com');
 * // If valid: { ok: true, value: URL { href: 'https://example.com/', ... }, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With protocol and path
 * const result = parseURL()('https://example.com/path?query=value');
 * // If valid: { ok: true, value: URL { href: 'https://example.com/path?query=value', ... }, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With invalid input
 * const result = parseURL()('not-a-url');
 * // If invalid: { ok: false, error: [{ path: [], message: 'Must be a valid URL' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Used in an object schema
 * const profileSchema = object({
 *   website: optional(parseURL('Website must be a valid URL'))
 * });
 */
export function parseURL(message: string = "Must be a valid URL"): Validator<unknown, URL> {
  return (value, path = []) => {
    if (typeof value !== "string") {
      return err([{ path, message }]);
    }

    try {
      return ok(new URL(value));
    } catch {
      return err([{ path, message }]);
    }
  };
}

/**
 * Creates a validator that parses and validates phone numbers based on a pattern.
 * By default, accepts international format with optional + prefix and common separators.
 *
 * @param {RegExp} [pattern=/^\+?[0-9\s-()]{8,20}$/] - Regular expression for validating phone numbers
 * @param {string} [message='Invalid phone number format'] - Custom error message
 * @returns {Validator<unknown, string>} A validator that validates phone numbers
 *
 * @example
 * // Validate a simple phone number
 * const phoneValidator = parsePhoneNumber();
 * const result = phoneValidator('123-456-7890');
 * // If valid: { ok: true, value: '123-456-7890', [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With international format
 * const result = parsePhoneNumber()('+1 (555) 123-4567');
 * // If valid: { ok: true, value: '+1 (555) 123-4567', [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With invalid input
 * const result = parsePhoneNumber()('abc-def-ghij');
 * // If invalid: { ok: false, error: [{ path: [], message: 'Invalid phone number format' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // With custom pattern and message
 * const ukPhoneValidator = parsePhoneNumber(
 *   /^(\+44|0)\s?[0-9]{10}$/,
 *   'Must be a valid UK phone number'
 * );
 *
 * @example
 * // Used in an object schema
 * const contactSchema = object({
 *   phoneNumber: required(parsePhoneNumber(undefined, 'Please enter a valid phone number'))
 * });
 */
export function parsePhoneNumber(
  pattern: RegExp = /^\+?[0-9\s-()]{8,20}$/,
  message: string = "Invalid phone number format",
): Validator<unknown, string> {
  return (value, path = []) => {
    if (typeof value !== "string") {
      return err([{ path, message }]);
    }

    const cleaned = value.replaceAll(/\s+/g, "");

    if (!pattern.test(cleaned)) {
      return err([{ path, message }]);
    }

    return ok(value);
  };
}
