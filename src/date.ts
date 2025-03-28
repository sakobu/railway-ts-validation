import { type Result, ok, err } from "@railway-ts/core/result";
/**
 * Creates a validator that checks if a date is within a specified range
 *
 * @example
 * ```ts
 * // Event date validation
 * const today = new Date();
 * const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
 *
 * pipe(
 *   ok<string, string>(eventDateStr),
 *   andThen(parseDate("Invalid date format")),
 *   andThen(dateRange(today, nextYear, "Event must be scheduled between today and next year")),
 *   // other validations...
 * );
 * ```
 *
 * @param minDate - The minimum date allowed
 * @param maxDate - The maximum date allowed
 * @param message - The error message to return if validation fails
 * @returns A validator function that returns a Result
 */
export const dateRange = (minDate: Date, maxDate: Date, message?: string) => {
  return (value: Date): Result<Date, string> => {
    if (value < minDate || value > maxDate) {
      return err(
        message ||
          `Date must be between ${minDate.toISOString().split("T")[0]} and ${maxDate.toISOString().split("T")[0]}`,
      );
    }
    return ok(value);
  };
};
