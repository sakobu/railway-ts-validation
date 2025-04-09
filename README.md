# @railway-ts/validation

[![npm version](https://img.shields.io/npm/v/@railway-ts/validation.svg)](https://www.npmjs.com/package/@railway-ts/validation)
[![Build Status](https://github.com/sakobu/railway-ts-validation/workflows/CI/badge.svg)](https://github.com/sakobu/railway-ts-validation/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@railway-ts/validation)](https://bundlephobia.com/package/@railway-ts/validation)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Coverage](https://img.shields.io/codecov/c/github/sakobu/railway-ts-validation)](https://codecov.io/gh/sakobu/railway-ts-validation)

A comprehensive TypeScript validation library built on top of [@railway-ts/core](https://www.npmjs.com/package/@railway-ts/core). This library provides a functional programming approach to validation, making it easy to compose validators and handle validation errors in a type-safe manner.

## Features

- 🚂 Railway-oriented programming approach to validation
- 🔄 Composable validators that can be chained together
- 📝 Detailed error messages with path information
- 🔍 Strict type inference for validation schemas
- 🧩 Specialized validators for common data types (strings, numbers, dates, arrays, objects)
- 🔀 Parser functions to transform data during validation
- 🛡️ Optional type safety with runtime validation

## Installation

```bash
# npm
npm install @railway-ts/validation

# yarn
yarn add @railway-ts/validation

# pnpm
pnpm add @railway-ts/validation

# bun
bun add @railway-ts/validation
```

## Basic Usage

Here's a simple example to get you started:

```typescript
import {
  object,
  string,
  required,
  email,
  minLength,
  parseNumber,
  composeRight,
  validate,
  formatErrors,
} from "@railway-ts/validation";
import { isErr } from "@railway-ts/core";

// Define a schema
const userSchema = object({
  username: required(composeRight(string(), minLength(3))),
  email: required(composeRight(string(), email())),
  age: required(parseNumber()),
});

// Validate data
const userData = {
  username: "john_doe",
  email: "john@example.com",
  age: "25", // Will be parsed to a number
};

const result = validate(userData, userSchema);

if (isErr(result)) {
  // Handle validation errors
  console.error(formatErrors(result.error));
} else {
  // Use the validated data
  console.log(result.value); // Typed as { username: string; email: string; age: number }
}
```

## API Reference

### Core Validators

#### `object<T>(schema: Schema<T>, options?: { strict?: boolean }): Validator<unknown, T>`

Creates a validator for objects based on a schema. The `strict` option (default: `true`) rejects objects with properties not defined in the schema.

```typescript
const addressSchema = object({
  street: required(string()),
  city: required(string()),
  zipCode: required(pattern(/^\d{5}$/)),
});

// Non-strict mode (allows extra fields)
const lenientSchema = object({ name: required(string()) }, { strict: false });
```

#### `required<I, O>(validator: Validator<I, O>, message?: string): Validator<I | undefined | null, O>`

Makes a field required (not null or undefined).

```typescript
const requiredName = required(string(), "Name is required");
```

#### `optional<I, O>(validator: Validator<I, O>): Validator<I | undefined | null, O | undefined>`

Makes a field optional (can be null or undefined).

```typescript
const optionalBio = optional(string());
```

### String Validators

#### `string(message?: string): Validator<unknown, string>`

Ensures a value is a string.

#### `minLength(min: number, message?: string): Validator<string>`

Ensures a string's length is at least a minimum value.

```typescript
const passwordValidator = minLength(8, "Password must be at least 8 characters");
```

#### `maxLength(max: number, message?: string): Validator<string>`

Ensures a string's length is at most a maximum value.

```typescript
const bioValidator = maxLength(500, "Bio cannot exceed 500 characters");
```

#### `pattern(regex: RegExp, message?: string): Validator<string>`

Ensures a string matches a regular expression pattern.

```typescript
const zipCodeValidator = pattern(/^\d{5}$/, "ZIP code must be 5 digits");
```

#### `nonEmpty(message?: string): Validator<string>`

Ensures a string is not empty after trimming whitespace.

```typescript
const nameValidator = nonEmpty("Name cannot be empty");
```

#### `email(message?: string): Validator<string>`

Ensures a string is formatted as a valid email address.

```typescript
const emailValidator = email("Please enter a valid email address");
```

### Number Validators

#### `number(message?: string): Validator<unknown, number>`

Ensures a value is a number and not NaN.

#### `min(value: number, message?: string): Validator<number>`

Ensures a number is greater than or equal to a minimum value.

```typescript
const ageValidator = min(18, "Must be at least 18 years old");
```

#### `max(value: number, message?: string): Validator<number>`

Ensures a number is less than or equal to a maximum value.

```typescript
const percentageValidator = max(100, "Percentage cannot exceed 100");
```

#### `between(min: number, max: number, message?: string): Validator<number>`

Ensures a number is between a minimum and maximum value (inclusive).

```typescript
const ratingValidator = between(1, 5, "Rating must be between 1 and 5");
```

#### `integer(message?: string): Validator<number>`

Ensures a number is an integer (no decimal places).

```typescript
const quantityValidator = integer("Quantity must be a whole number");
```

#### `positive(message?: string): Validator<number>`

Ensures a number is positive (greater than zero).

```typescript
const priceValidator = positive("Price must be positive");
```

#### `negative(message?: string): Validator<number>`

Ensures a number is negative (less than zero).

```typescript
const temperatureValidator = negative("Temperature must be below freezing");
```

#### `nonZero(message?: string): Validator<number>`

Ensures a number is not zero.

```typescript
const divisorValidator = nonZero("Divisor cannot be zero");
```

#### `divisibleBy(divisor: number, message?: string): Validator<number>`

Ensures a number is divisible by a specific divisor.

```typescript
const evenValidator = divisibleBy(2, "Number must be even");
```

#### `precision(maxDecimalPlaces: number, message?: string): Validator<number>`

Ensures a number has at most the specified number of decimal places.

```typescript
const currencyValidator = precision(2, "Currency can have at most 2 decimal places");
```

### Date Validators

#### `dateRange(min: Date, max: Date, message?: string): Validator<Date>`

Ensures a Date is within a specified range.

```typescript
const eventDateValidator = dateRange(new Date("2023-01-01"), new Date("2023-12-31"), "Event must be scheduled in 2023");
```

#### `pastDate(message?: string): Validator<Date>`

Ensures a Date is in the past (before the current date and time).

```typescript
const birthDateValidator = pastDate("Birth date must be in the past");
```

#### `futureDate(message?: string): Validator<Date>`

Ensures a Date is in the future (after the current date and time).

```typescript
const appointmentValidator = futureDate("Appointment must be in the future");
```

#### `todayOrFuture(message?: string): Validator<Date>`

Ensures a Date is either today or in the future.

```typescript
const startDateValidator = todayOrFuture("Start date must be today or later");
```

### Boolean Validators

#### `boolean(message?: string): Validator<unknown, boolean>`

Ensures a value is a boolean.

#### `mustBeChecked(message?: string): Validator<boolean>`

Ensures a boolean value is true (commonly used for checkboxes).

```typescript
const termsValidator = mustBeChecked("You must accept the terms and conditions");
```

#### `isFalse(message?: string): Validator<boolean>`

Ensures a boolean value is false.

```typescript
const disabledValidator = isFalse("Feature must be disabled");
```

#### `matches(expected: boolean, message?: string): Validator<boolean>`

Ensures a boolean value matches the expected value.

```typescript
const enabledValidator = matches(true, "Feature must be enabled");
```

#### `isNullable(message?: string): Validator<unknown, boolean | null>`

Ensures a value is either a boolean or null.

```typescript
const optionalBoolValidator = isNullable("Must be a boolean or null");
```

### Array Validators

#### `array<I, O>(itemValidator: Validator<I, O>): Validator<unknown, O[]>`

Creates a validator for arrays where each item is validated by the provided item validator.

```typescript
const stringArrayValidator = array(string());
const numberArrayValidator = array(composeRight(parseNumber(), positive()));
```

#### `oneOf<T>(allowedValues: T[], message?: string): Validator<T>`

Ensures a value is one of the allowed values.

```typescript
const statusValidator = oneOf(["pending", "approved", "rejected"]);
```

#### `stringEnum<T extends string>(allowedValues: T[], message?: string): Validator<unknown, T>`

Ensures a value is a string and one of the allowed enum values.

```typescript
const roleValidator = stringEnum(["admin", "user", "guest"]);
```

#### `numberArray(message?: string): Validator<unknown, number[]>`

Creates a validator for arrays of numbers. Each array item is automatically parsed as a number.

```typescript
const scoresValidator = numberArray("Each score must be a valid number");
```

#### `selectionArray<T extends string>(options: T[], message?: string): Validator<unknown, T[]>`

Creates a validator for arrays where each item must be one of the specified string options.

```typescript
const contactTypesValidator = selectionArray(["email", "phone", "mail"]);
```

### Parser Validators

#### `parseNumber(message?: string): Validator<unknown, number>`

Parses input into a number. Accepts both numbers and string representations of numbers.

```typescript
const ageValidator = parseNumber("Age must be a valid number");
```

#### `parseDate(message?: string): Validator<unknown, Date>`

Parses input into a Date object. Accepts Date objects, strings that can be parsed as dates, and numeric timestamps.

```typescript
const birthdateValidator = parseDate("Birthdate must be a valid date");
```

#### `parseBool(message?: string): Validator<unknown, boolean>`

Parses input into a boolean. Accepts booleans, 0/1, and strings like 'true'/'false', 'yes'/'no'.

```typescript
const consentValidator = parseBool("Please indicate yes or no");
```

#### `parseString(message?: string): Validator<unknown, string>`

Parses input into a string. Accepts strings and any value that can be converted to a string, except null and undefined.

```typescript
const codeValidator = parseString("Code must be convertible to a string");
```

#### `parseJSON(message?: string): Validator<unknown, unknown>`

Parses JSON strings into objects. Accepts JSON strings or already parsed objects.

```typescript
const configValidator = parseJSON("Configuration must be valid JSON");
```

#### `parseInteger(message?: string): Validator<unknown, number>`

Parses input into an integer. Accepts integers and string representations of integers.

```typescript
const quantityValidator = parseInteger("Quantity must be a whole number");
```

#### `parseISODate(message?: string): Validator<unknown, Date>`

Parses ISO format date strings (YYYY-MM-DD) into Date objects. Performs strict validation of the date format and validity.

```typescript
const birthdateValidator = parseISODate("Date must be in YYYY-MM-DD format");
```

#### `parseURL(message?: string): Validator<unknown, URL>`

Parses string URLs into URL objects. Validates that the URL is properly formatted and can be parsed.

```typescript
const websiteValidator = parseURL("Please enter a valid URL");
```

#### `parsePhoneNumber(pattern?: RegExp, message?: string): Validator<unknown, string>`

Parses and validates phone numbers based on a pattern. By default, accepts international format with optional + prefix and common separators.

```typescript
const phoneValidator = parsePhoneNumber(undefined, "Please enter a valid phone number");

// With a custom pattern for UK numbers
const ukPhoneValidator = parsePhoneNumber(/^(\+44|0)\s?[0-9]{10}$/, "Please enter a valid UK phone number");
```

### Utility Functions

#### `composeRight(...validators: Validator[]): Validator`

Combines multiple validators into a single validator, applying them in sequence (left to right). Each validator's result is passed to the next validator in the chain.

```typescript
const passwordValidator = composeRight(
  string(),
  nonEmpty(),
  minLength(8),
  pattern(/[A-Z]/, "Password must contain at least one uppercase letter"),
  pattern(/[0-9]/, "Password must contain at least one number"),
);
```

#### `validate<T>(value: unknown, validator: Validator<unknown, T>): Result<T, ValidationError[]>`

Directly applies a validator to a value. This is a simple utility function for one-off validations.

```typescript
const result = validate(userInput, userSchema);
```

#### `formatErrors(errors: ValidationError[]): Record<string, string>`

Formats validation errors into a more user-friendly object structure. Converts array paths to a dot notation string format, suitable for form libraries or error displays.

```typescript
const errors = formatErrors(validationErrors);
// { 'name': 'Name is required', 'address.city': 'City is required', 'items[0]': 'Invalid item' }
```

## Advanced Usage

### Type Inference

The library provides type inference for validation schemas:

```typescript
import { InferSchemaType } from "@railway-ts/validation";

const userSchema = object({
  username: required(string()),
  email: required(email()),
  age: required(parseNumber()),
});

// Infer the type from the schema
type User = InferSchemaType<typeof userSchema>;
// Equivalent to: type User = { username: string; email: string; age: number }
```

### Nested Objects

You can validate nested objects:

```typescript
const addressSchema = object({
  street: required(string()),
  city: required(string()),
  zipCode: required(pattern(/^\d{5}$/)),
});

const userSchema = object({
  name: required(string()),
  email: required(email()),
  address: required(addressSchema),
});
```

### Arrays with Validators

Validate arrays of items:

```typescript
const productSchema = object({
  name: required(string()),
  price: required(composeRight(parseNumber(), positive())),
  tags: required(array(string())),
});
```

### Custom Error Messages

Customize error messages for each validator:

```typescript
const userSchema = object({
  username: required(
    composeRight(string("Username must be a string"), minLength(3, "Username must be at least 3 characters long")),
  ),
  email: required(email("Please enter a valid email address")),
  age: required(composeRight(parseNumber("Age must be a number"), min(18, "You must be at least 18 years old"))),
});
```

### Form Integration

The library works well with form libraries:

```typescript
import { isOk, err, ok } from "@railway-ts/core";

const formSchema = object({
  name: required(composeRight(string(), nonEmpty())),
  email: required(email()),
  password: required(composeRight(string(), minLength(8))),
  confirmPassword: required(string()),
});

// Custom validator to check if passwords match
const validateForm = (data: unknown) => {
  const result = validate(data, formSchema);

  if (isOk(result)) {
    const { password, confirmPassword } = result.value;

    if (password !== confirmPassword) {
      return err([
        {
          path: ["confirmPassword"],
          message: "Passwords do not match",
        },
      ]);
    }

    return ok(result.value);
  }

  return result;
};
```

### Real-World Example

Here's a more complete example showing how the library can be used in a real-world scenario:

```typescript
import {
  object,
  string,
  required,
  optional,
  composeRight,
  email,
  minLength,
  parseNumber,
  min,
  array,
  stringEnum,
  pattern,
  validate,
  formatErrors,
  type InferSchemaType,
} from "@railway-ts/validation";
import { matchResult } from "@railway-ts/core";

// Define nested address schema
const addressSchema = object({
  street: optional(composeRight(string(), minLength(3))),
  city: optional(composeRight(string(), minLength(2))),
  zipCode: optional(composeRight(string(), pattern(/^\d{5}$/))),
});

// Define main user schema
const userSchema = object({
  username: required(composeRight(string(), minLength(3))),
  email: required(composeRight(string(), email())),
  password: required(composeRight(string(), minLength(8))),
  age: required(composeRight(parseNumber(), min(18))),
  role: required(stringEnum(["admin", "user"])),
  address: optional(addressSchema),
  contacts: optional(array(stringEnum(["email", "phone"]))),
});

// Infer the user type from the schema
type User = InferSchemaType<typeof userSchema>;

// Sample data to validate
const userData = {
  username: "john_doe",
  email: "john@example.com",
  password: "Password123",
  age: 25,
  role: "user",
  address: {
    street: "123 Main St",
    city: "New York",
    zipCode: "10001",
  },
  contacts: ["email", "phone"],
};

// Perform validation and handle results
const result = validate(userData, userSchema);

// Using matchResult from @railway-ts/core to handle the result
const validationResult = matchResult(result, {
  ok: (validData) => ({
    valid: true,
    data: validData,
  }),
  err: (errors) => ({
    valid: false,
    errors: formatErrors(errors),
  }),
});

if (validationResult.valid) {
  // Use the validated data
  const user: User = validationResult.data;
  console.log("Valid user:", user);
} else {
  // Handle validation errors
  console.error("Validation errors:", validationResult.errors);
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with TypeScript and functional programming principles. Works perfectly with [@railway-ts/core](https://github.com/sakobu/railway-ts).
