/* eslint-disable security/detect-object-injection */
import { err, isOk, ok, type Result } from "@railway-ts/core";

/**
 * Represents a validation error with path information and a message.
 *
 * @typedef {Object} ValidationError
 * @property {string[]} path - The path to the field that failed validation
 * @property {string} message - The error message describing the validation failure
 */
export type ValidationError = {
  path: string[];
  message: string;
};

/**
 * A validator function that checks if a value meets certain criteria.
 *
 * @template I - The input type to validate
 * @template O - The output type (defaults to the input type if not specified)
 * @callback Validator
 * @param {I} value - The value to validate
 * @param {string[]} [path=[]] - The path to the current value (used for nested objects)
 * @returns {Result<O, ValidationError[]>} A Result containing either the validated value or validation errors
 */
export type Validator<I, O = I> = (value: I, path?: string[]) => Result<O, ValidationError[]>;

type AtomicType = string | number | boolean | Date | null | undefined | bigint;

type RemoveUndefined<T> = T extends undefined ? never : T;

type ProcessType<T> = T extends AtomicType
  ? T
  : T extends Array<infer U>
    ? Array<ProcessType<U>>
    : T extends object
      ? {
          [K in keyof T as undefined extends T[K] ? never : K]: ProcessType<T[K]>;
        } & {
          [K in keyof T as undefined extends T[K] ? K : never]?: ProcessType<RemoveUndefined<T[K]>>;
        } extends infer O
        ? { [K in keyof O]: O[K] }
        : never
      : T;

// Infer the output type of a validator or schema
type InferType<V> = V extends Validator<unknown, infer O> ? O : never;

// Combines inference, processing, and flattening
/**
 * Infers the output type of a validator or schema after processing.
 * This is useful for getting the TypeScript type that a validator will produce.
 *
 * @template V - The validator or schema to infer the type from
 */
export type InferSchemaType<V> = ProcessType<InferType<V>>;

/**
 * Represents a validation schema where each key maps to a validator for that field.
 *
 * @template T - The shape of the object being validated
 */
export type Schema<T = Record<string, unknown>> = {
  [K in keyof T]: Validator<unknown, T[K]>;
};

/**
 * The result of a validation operation.
 *
 * @template T - The type of the validated data
 * @property {boolean} valid - Whether the validation was successful
 * @property {T} [data] - The validated data (only present if validation was successful)
 * @property {Record<string, string>} [errors] - Object mapping field paths to error messages (only present if validation failed)
 */
export type ValidationResult<T> = {
  valid: boolean;
  data?: T;
  errors?: Record<string, string>;
};

/**
 * Creates a validator for objects based on a schema.
 *
 * @template T - The shape of the object being validated
 * @param {Schema<T>} schema - An object where each key contains a validator for that property
 * @param {{ strict?: boolean }} [options={ strict: true }] - Options object
 * @param {boolean} [options.strict=true] - If true, rejects objects with properties not in the schema
 * @returns {Validator<unknown, T>} A validator that validates objects against the schema
 *
 * @example
 * // Define a user schema
 * const userSchema = object({
 *   name: required(string()),
 *   age: required(composeRight(parseNumber(), min(18))),
 *   email: required(email())
 * });
 *
 * @example
 * // Validate an object against the schema
 * const userData = { name: 'John', age: 25, email: 'john@example.com' };
 * const result = userSchema(userData);
 * // If valid: { ok: true, value: { name: 'John', age: 25, email: 'john@example.com' }, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With validation errors
 * const invalidUser = { name: 'John', age: 15, email: 'not-an-email' };
 * const result = userSchema(invalidUser);
 * // If invalid: { ok: false, error: [
 * //   { path: ['age'], message: 'Must be at least 18' },
 * //   { path: ['email'], message: 'Invalid email format' }
 * // ], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // Non-strict mode (allows extra fields)
 * const lenientSchema = object({ name: required(string()) }, { strict: false });
 * const result = lenientSchema({ name: 'John', extraField: 'value' });
 * // If valid: { ok: true, value: { name: 'John', extraField: 'value' }, [RESULT_BRAND]: 'ok' }
 */
export function object<T extends Record<string, unknown>>(
  schema: Schema<T>,
  { strict = true }: { strict?: boolean } = {},
): Validator<unknown, T> {
  return (obj, parentPath = []) => {
    if (obj === null || typeof obj !== "object") {
      return err([{ path: parentPath, message: "Expected an object" }]);
    }

    const allErrors: ValidationError[] = [];
    const validatedObj: Record<string, unknown> = {};

    if (strict !== false) {
      const extraKeys = Object.keys(obj as object).filter((key) => !Object.prototype.hasOwnProperty.call(schema, key));

      if (extraKeys.length > 0) {
        for (const key of extraKeys) {
          allErrors.push({
            path: [...parentPath, key],
            message: `Unexpected field: '${key}'`,
          });
        }
      }
    }

    for (const key in schema) {
      if (!Object.prototype.hasOwnProperty.call(schema, key)) continue;

      const validator = schema[key];
      if (!validator) continue;

      const value = (obj as Record<string, unknown>)[key];
      const fieldPath = [...parentPath, key];

      const result = validator(value, fieldPath);

      if (isOk(result)) {
        validatedObj[key] = result.value;
      } else {
        allErrors.push(...result.error);
      }
    }

    if (allErrors.length > 0) {
      return err(allErrors);
    }

    return ok(validatedObj as T);
  };
}

/**
 * Creates a validator that requires a value to be defined (not null or undefined)
 * before applying the underlying validator.
 *
 * @template I - The input type of the underlying validator
 * @template O - The output type of the underlying validator
 * @param {Validator<I, O>} validator - The validator to apply if the value is defined
 * @param {string} [message='Field is required'] - Error message when value is null or undefined
 * @returns {Validator<I | undefined | null, O>} A validator that checks the value is defined
 *
 * @example
 * // Basic required field
 * const nameValidator = required(string());
 * const result = nameValidator(undefined);
 * // If invalid: { ok: false, error: [{ path: [], message: 'Field is required' }], [RESULT_BRAND]: 'error' }
 *
 * @example
 * // With custom error message
 * const emailValidator = required(email(), 'Email address is required');
 *
 * @example
 * // Used in an object schema
 * const userSchema = object({
 *   name: required(string()),             // Required field
 *   email: required(email()),             // Required email
 *   phone: optional(parsePhoneNumber())   // Optional field
 * });
 */
export function required<I, O>(
  validator: Validator<I, O>,
  message: string = "Field is required",
): Validator<I | undefined | null, O> {
  return (value, path = []) => {
    if (value === undefined || value === null) {
      return err([{ path, message }]);
    }
    return validator(value as I, path);
  };
}

/**
 * Creates a validator that makes a field optional.
 * If the value is null or undefined, validation passes and returns undefined.
 * Otherwise, applies the underlying validator.
 *
 * @template I - The input type of the underlying validator
 * @template O - The output type of the underlying validator
 * @param {Validator<I, O>} validator - The validator to apply if the value is defined
 * @returns {Validator<I | undefined | null, O | undefined>} A validator that allows undefined values
 *
 * @example
 * // Basic optional field
 * const profileValidator = optional(string());
 * const result = profileValidator(undefined);
 * // If valid: { ok: true, value: undefined, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // With defined value
 * const result = optional(number())(42);
 * // If valid: { ok: true, value: 42, [RESULT_BRAND]: 'ok' }
 *
 * @example
 * // Used in an object schema
 * const userSchema = object({
 *   name: required(string()),             // Required field
 *   email: required(email()),             // Required email
 *   phone: optional(parsePhoneNumber()),   // Optional field
 *   bio: optional(composeRight(string(), maxLength(500)))  // Optional with extra validation
 * });
 */
export function optional<I, O>(validator: Validator<I, O>): Validator<I | undefined | null, O | undefined> {
  return (value, path = []) => {
    if (value === undefined || value === null) {
      // eslint-disable-next-line unicorn/no-useless-undefined
      return ok(undefined);
    }
    return validator(value, path);
  };
}
