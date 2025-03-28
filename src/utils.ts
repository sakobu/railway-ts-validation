import { type Result, ok, err, combine, combineAll, flatMap } from "@railway-ts/core/result";

/**
 * Combines multiple validation results into a single Result.
 * If any validation fails, returns the first error.
 * Otherwise, returns an Ok containing an array of the validated values.
 *
 * @example
 * const results = [
 *   validateUsername("john"),   // ok
 *   validateEmail("invalid"),   // err("Invalid email")
 *   validateAge("17")           // err("Age must be at least 18")
 * ];
 * const combined = combineValidation(results);
 * // err("Invalid email")
 *
 * @param results - An array of validation results
 * @returns A Result containing an array of validated values or the first error
 */
export const combineValidation = <T extends unknown[], E>(
  results: readonly [...{ [K in keyof T]: Result<T[K], E> }],
): Result<T, E> => {
  return combine(results as Result<unknown, E>[]) as Result<T, E>;
};

/**
 * Combines multiple validation results into a single Result.
 * Unlike combineValidation, this collects all errors instead of stopping at the first one.
 * If all validations pass, returns an Ok containing an array of validated values.
 * If any validation fails, returns an Error containing an array of all errors.
 *
 * @example
 * const results = [
 *   validateUsername("john"),   // ok
 *   validateEmail("invalid"),   // err("Invalid email")
 *   validateAge("17")           // err("Age must be at least 18")
 * ];
 * const combined = combineAllValidations(results);
 * // err(["Invalid email", "Age must be at least 18"])
 *
 * @param results - An array of validation results
 * @returns A Result containing an array of validated values or all collected errors
 */
export const combineAllValidations = <T extends unknown[], E>(
  results: readonly [...{ [K in keyof T]: Result<T[K], E> }],
): Result<T, E[]> => {
  return combineAll(results as Result<unknown, E>[]) as Result<T, E[]>;
};

/**
 * Combines field validation results into a single Result.
 * Collects errors from all failing validations with their field names.
 * If all validations pass, returns an Ok containing the validated form data.
 * If any validation fails, returns an Error containing all field errors.
 *
 * @example
 * const validations = {
 *   username: validateUsername("john"),   // ok
 *   email: validateEmail("invalid"),      // err("Invalid email")
 *   age: validateAge("17")                // err("Age must be at least 18")
 * };
 * const result = combineFormValidations(validations);
 * // err([
 * //   { field: "email", error: "Invalid email" },
 * //   { field: "age", error: "Age must be at least 18" }
 * // ])
 *
 * @param validations - An object mapping field names to validation results
 * @returns A Result containing the validated form data or all field errors
 */
export type FieldValidationError<E> = {
  field: string;
  error: E;
};

export const combineFormValidations = <T extends Record<string, unknown>, E>(validations: {
  [K in keyof T]: Result<T[K], E>;
}): Result<T, FieldValidationError<E>[]> => {
  const errors: FieldValidationError<E>[] = [];
  const values: Partial<T> = {};

  // Iterate over keys to maintain type safety
  for (const key of Object.keys(validations)) {
    const field = key as keyof T;
    // eslint-disable-next-line security/detect-object-injection
    const result = validations[field];

    if (result.ok) {
      // eslint-disable-next-line security/detect-object-injection
      values[field] = result.value;
    } else {
      errors.push({ field: key, error: result.error });
    }
  }

  return errors.length > 0 ? err(errors) : ok(values as T);
};

/**
 * Curried version of `flatMap` from @/result.
 * Applies a function to the value inside a Result if it is Ok.
 * If the Result is an Error, returns the original Error.
 *
 * @example
 * const result = ok(1);
 * const transformed = andThen((x) => ok(x + 1))(result);
 * // ok(2)
 *
 * @param fn - The function to apply to the contained value
 * @returns A new Result containing the transformed value, or the original error
 */
export const andThen = <T, E, U>(fn: (value: T) => Result<U, E>) => {
  return (result: Result<T, E>): Result<U, E> => {
    return flatMap(result, fn);
  };
};
