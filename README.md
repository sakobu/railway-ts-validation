# @railway-ts/validation

[![npm version](https://img.shields.io/npm/v/@railway-ts/validation.svg)](https://www.npmjs.com/package/@railway-ts/validation)
[![Build Status](https://github.com/sakobu/railway-ts-validation/workflows/CI/badge.svg)](https://github.com/sakobu/railway-ts-validation/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@railway-ts/validation)](https://bundlephobia.com/package/@railway-ts/validation)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Coverage](https://img.shields.io/codecov/c/github/sakobu/railway-ts-validation)](https://codecov.io/gh/sakobu/railway-ts-validation)

A comprehensive validation library built on top of [@railway-ts/core](https://www.npmjs.com/package/@railway-ts/core), providing a functional programming approach to validation with composable validators and type-safe error handling.

## Overview

`@railway-ts/validation` provides a robust, type-safe approach to data validation in TypeScript applications. Using functional programming principles, it allows you to compose validators, transform data during validation, and handle validation errors in a consistent, predictable way.

The library is built on top of [@railway-ts/core](https://www.npmjs.com/package/@railway-ts/core), leveraging its Result type to handle validation outcomes without exceptions, making error handling more explicit and manageable.

## Features

- **Composable validators**: Chain validators together to create complex validation rules
- **Path-aware error messages**: Detailed validation errors with exact paths to invalid fields
- **Type inference**: Automatic type inference for validated data structures
- **Data transformation**: Transform input data during validation (parse strings to numbers, etc.)
- **Specialized validators**: Built-in validators for common data types (strings, numbers, dates, arrays, objects)
- **Form-friendly**: Easy integration with form libraries
- **Zero dependencies**: No external runtime dependencies beyond @railway-ts/core
- **Tree-shakable**: Import only what you need
- **TypeScript-first**: Built with TypeScript for a great developer experience

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

### Core Types

```typescript
// Represents a validation error with path information
type ValidationError = {
  path: string[];  // Path to the invalid field
  message: string; // Error message
};

// A validator function that checks if a value meets certain criteria
type Validator<I, O = I> = (value: I, path?: string[]) => Result<O, ValidationError[]>;

// Object schema definition
type Schema<T = Record<string, unknown>> = {
  [K in keyof T]: Validator<unknown, T[K]>;
};

// Infers the output type of a validator after processing
type InferSchemaType<V> = ...
```

### Core Validators

| Function                                                       | Description                                       |
| -------------------------------------------------------------- | ------------------------------------------------- |
| `object<T>(schema: Schema<T>, options?: { strict?: boolean })` | Creates a validator for objects based on a schema |
| `required<I, O>(validator: Validator<I, O>, message?: string)` | Makes a field required (not null or undefined)    |
| `optional<I, O>(validator: Validator<I, O>)`                   | Makes a field optional (can be null or undefined) |

```typescript
// Example: Object schema with required and optional fields
const userSchema = object({
  username: required(string()), // Required field
  email: required(email()), // Required with validation
  profile: optional(
    object({
      // Optional nested object
      bio: optional(string()),
      age: optional(parseNumber()),
    }),
  ),
});

// Non-strict mode (allows extra fields)
const lenientSchema = object({ name: required(string()) }, { strict: false });
```

### String Validators

| Function                                   | Description                                             |
| ------------------------------------------ | ------------------------------------------------------- |
| `string(message?: string)`                 | Ensures a value is a string                             |
| `minLength(min: number, message?: string)` | Ensures a string's length is at least a minimum value   |
| `maxLength(max: number, message?: string)` | Ensures a string's length is at most a maximum value    |
| `pattern(regex: RegExp, message?: string)` | Ensures a string matches a regular expression pattern   |
| `nonEmpty(message?: string)`               | Ensures a string is not empty after trimming whitespace |
| `email(message?: string)`                  | Ensures a string is formatted as a valid email address  |

```typescript
// String validation examples
const nameValidator = composeRight(
  string("Must be a string"),
  nonEmpty("Name cannot be empty"),
  minLength(2, "Name must be at least 2 characters"),
);

const bioValidator = composeRight(string(), maxLength(500, "Bio cannot exceed 500 characters"));

const zipCodeValidator = composeRight(string(), pattern(/^\d{5}$/, "ZIP code must be 5 digits"));

const emailValidator = composeRight(string(), nonEmpty(), email("Please enter a valid email address"));
```

### Number Validators

| Function                                                | Description                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| `number(message?: string)`                              | Ensures a value is a number and not NaN                             |
| `min(value: number, message?: string)`                  | Ensures a number is greater than or equal to a minimum value        |
| `max(value: number, message?: string)`                  | Ensures a number is less than or equal to a maximum value           |
| `between(min: number, max: number, message?: string)`   | Ensures a number is between a minimum and maximum value (inclusive) |
| `integer(message?: string)`                             | Ensures a number is an integer (no decimal places)                  |
| `positive(message?: string)`                            | Ensures a number is positive (greater than zero)                    |
| `negative(message?: string)`                            | Ensures a number is negative (less than zero)                       |
| `nonZero(message?: string)`                             | Ensures a number is not zero                                        |
| `divisibleBy(divisor: number, message?: string)`        | Ensures a number is divisible by a specific divisor                 |
| `precision(maxDecimalPlaces: number, message?: string)` | Ensures a number has at most the specified number of decimal places |

```typescript
// Number validation examples
const ageValidator = composeRight(
  number(),
  integer("Age must be a whole number"),
  min(18, "Must be at least 18 years old"),
);

const ratingValidator = composeRight(number(), between(1, 5, "Rating must be between 1 and 5"));

const priceValidator = composeRight(
  number(),
  positive("Price must be positive"),
  precision(2, "Price can have at most 2 decimal places"),
);

const evenValidator = composeRight(number(), integer(), divisibleBy(2, "Must be an even number"));
```

### Date Validators

| Function                                            | Description                                                       |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| `dateRange(min: Date, max: Date, message?: string)` | Ensures a Date is within a specified range                        |
| `pastDate(message?: string)`                        | Ensures a Date is in the past (before the current date and time)  |
| `futureDate(message?: string)`                      | Ensures a Date is in the future (after the current date and time) |
| `todayOrFuture(message?: string)`                   | Ensures a Date is either today or in the future                   |

```typescript
// Date validation examples
const birthDateValidator = composeRight(parseDate(), pastDate("Birth date must be in the past"));

const appointmentValidator = composeRight(parseDate(), futureDate("Appointment must be in the future"));

const eventDateValidator = composeRight(
  parseDate(),
  dateRange(new Date("2023-01-01"), new Date("2023-12-31"), "Event must be scheduled in 2023"),
);

const deliveryDateValidator = composeRight(parseDate(), todayOrFuture("Delivery date must be today or later"));
```

### Boolean Validators

| Function                                       | Description                                                    |
| ---------------------------------------------- | -------------------------------------------------------------- |
| `boolean(message?: string)`                    | Ensures a value is a boolean                                   |
| `mustBeChecked(message?: string)`              | Ensures a boolean value is true (commonly used for checkboxes) |
| `isFalse(message?: string)`                    | Ensures a boolean value is false                               |
| `matches(expected: boolean, message?: string)` | Ensures a boolean value matches the expected value             |
| `isNullable(message?: string)`                 | Ensures a value is either a boolean or null                    |

```typescript
// Boolean validation examples
const termsValidator = composeRight(parseBool(), mustBeChecked("You must accept the terms and conditions"));

const featureValidator = composeRight(boolean(), matches(true, "This feature must be enabled"));

const experimentalFeatureValidator = composeRight(
  boolean(),
  isFalse("Experimental features must be disabled in production"),
);

const optionalConsentValidator = isNullable("Value must be a boolean or null");
```

### Array Validators

| Function                                                             | Description                                                    |
| -------------------------------------------------------------------- | -------------------------------------------------------------- |
| `array<I, O>(itemValidator: Validator<I, O>)`                        | Creates a validator for arrays where each item is validated    |
| `oneOf<T>(allowedValues: T[], message?: string)`                     | Ensures a value is one of the allowed values                   |
| `stringEnum<T extends string>(allowedValues: T[], message?: string)` | Ensures a value is a string and one of the allowed enum values |
| `numberArray(message?: string)`                                      | Creates a validator for arrays of numbers                      |
| `selectionArray<T extends string>(options: T[], message?: string)`   | Creates a validator for arrays of enum values                  |

```typescript
// Array validation examples
const tagsValidator = array(string());

const userRolesValidator = array(stringEnum(["admin", "editor", "viewer"]));

const statusValidator = oneOf(
  ["pending", "approved", "rejected"],
  "Status must be one of: pending, approved, rejected",
);

const scoresValidator = numberArray("Each score must be a valid number");

const contactTypesValidator = selectionArray(
  ["email", "phone", "mail"],
  "Contact type must be one of: email, phone, mail",
);
```

### Parser Validators

| Function                                               | Description                         |
| ------------------------------------------------------ | ----------------------------------- |
| `parseNumber(message?: string)`                        | Parses input into a number          |
| `parseDate(message?: string)`                          | Parses input into a Date object     |
| `parseBool(message?: string)`                          | Parses input into a boolean         |
| `parseString(message?: string)`                        | Parses input into a string          |
| `parseJSON(message?: string)`                          | Parses JSON strings into objects    |
| `parseInteger(message?: string)`                       | Parses input into an integer        |
| `parseISODate(message?: string)`                       | Parses ISO format date strings      |
| `parseURL(message?: string)`                           | Parses string URLs into URL objects |
| `parsePhoneNumber(pattern?: RegExp, message?: string)` | Parses and validates phone numbers  |

```typescript
// Parser examples
const ageParser = parseNumber("Age must be a valid number");

const birthdateParser = parseDate("Birthdate must be a valid date");

const consentParser = parseBool("Please indicate yes or no");

const configParser = parseJSON("Configuration must be valid JSON");

// Parsing from form data (strings to typed values)
const userSchema = object({
  name: required(string()),
  age: required(parseNumber("Age must be a valid number")),
  birthdate: required(parseISODate("Date must be in YYYY-MM-DD format")),
  hasConsented: required(parseBool("Please indicate yes or no")),
  website: optional(parseURL("Please enter a valid URL")),
  phone: optional(parsePhoneNumber()),
});
```

### Utility Functions

| Function                                                        | Description                                           |
| --------------------------------------------------------------- | ----------------------------------------------------- |
| `composeRight(...validators: Validator[])`                      | Combines multiple validators into a single validator  |
| `validate<T>(value: unknown, validator: Validator<unknown, T>)` | Applies a validator to a value                        |
| `formatErrors(errors: ValidationError[])`                       | Formats validation errors into a user-friendly object |

```typescript
// Compose multiple validators
const passwordValidator = composeRight(
  string(),
  nonEmpty(),
  minLength(8),
  pattern(/[A-Z]/, "Password must contain at least one uppercase letter"),
  pattern(/[0-9]/, "Password must contain at least one number"),
);

// Validate a value with a validator
const userSchema = object({
  username: required(composeRight(string(), minLength(3))),
  password: required(passwordValidator),
});

const result = validate(
  {
    username: "john",
    password: "weak",
  },
  userSchema,
);

// Format errors for display
if (isErr(result)) {
  const formattedErrors = formatErrors(result.error);
  console.log(formattedErrors);
  // Output: { 'password': 'Password must be at least 8 characters' }
}
```

## Tree-Shaking and Module Structure

`@railway-ts/validation` is designed to be tree-shakable. Import only what you need:

```typescript
// Import everything
import { string, number, required, parseNumber, validate } from "@railway-ts/validation";

// Using named imports for specific functions
import { object } from "@railway-ts/validation/core";
import { string, email } from "@railway-ts/validation/string";
import { parseNumber } from "@railway-ts/validation/parsers";
```

## Comparison with Similar Libraries

### @railway-ts/validation vs Zod

- **Error Handling**: @railway-ts/validation uses the Result type from @railway-ts/core for predictable error handling; Zod uses exceptions
- **Composability**: @railway-ts/validation provides standalone utility functions for composition; Zod uses method chaining
- **Integration**: @railway-ts/validation integrates naturally with other @railway-ts libraries; Zod is standalone
- **Bundle Size**: @railway-ts/validation is generally smaller when tree-shaken
- **Philosophy**: @railway-ts/validation embraces functional programming and railway-oriented programming; Zod is more object-oriented

### @railway-ts/validation vs Yup

- **Type Safety**: @railway-ts/validation offers stronger TypeScript integration with better type inference
- **Error Structure**: @railway-ts/validation provides structured errors with clear paths; Yup's errors can be harder to work with
- **Performance**: @railway-ts/validation is designed for efficiency with simpler abstractions
- **API Design**: @railway-ts/validation uses function composition; Yup uses method chaining like Zod
- **Functional Approach**: @railway-ts/validation embraces functional programming principles; Yup is more imperative

### @railway-ts/validation vs joi

- **TypeScript Support**: @railway-ts/validation is built for TypeScript from the ground up; joi has limited TypeScript support
- **Bundle Size**: @railway-ts/validation is much lighter than joi
- **Browser Support**: @railway-ts/validation works well in both Node.js and browsers; joi is more Node.js focused
- **API Style**: @railway-ts/validation uses functional composition; joi uses fluent method chaining
- **Learning Curve**: @railway-ts/validation may be easier to learn for developers familiar with functional programming

## Advanced Examples

### Type Inference and Nested Objects

```typescript
import {
  object,
  string,
  required,
  composeRight,
  email,
  minLength,
  parseNumber,
  min,
  pattern,
  InferSchemaType,
} from "@railway-ts/validation";

// Define nested schemas
const addressSchema = object({
  street: required(string()),
  city: required(string()),
  zipCode: required(pattern(/^\d{5}$/)),
});

// Define main schema with nested objects
const userSchema = object({
  username: required(composeRight(string(), minLength(3))),
  email: required(email()),
  age: required(composeRight(parseNumber(), min(18))),
  address: required(addressSchema),
});

// TypeScript automatically infers the correct type
type User = InferSchemaType<typeof userSchema>;
// Equivalent to:
// type User = {
//   username: string;
//   email: string;
//   age: number;
//   address: {
//     street: string;
//     city: string;
//     zipCode: string;
//   }
// }
```

### Custom Validators

```typescript
import { object, string, required, composeRight, validate, formatErrors } from "@railway-ts/validation";
import { err, isOk, ok } from "@railway-ts/core";

// Create a custom password validator
const password = (message = "Password must contain letters and numbers") => {
  return (value: string, path: string[] = []) => {
    const hasLetters = /[a-zA-Z]/.test(value);
    const hasNumbers = /[0-9]/.test(value);

    if (!hasLetters || !hasNumbers) {
      return err([{ path, message }]);
    }

    return ok(value);
  };
};

// Use it in a schema
const loginSchema = object({
  username: required(string()),
  password: required(composeRight(string(), minLength(8, "Password must be at least 8 characters"), password())),
});

// Validate data
const result = validate(
  {
    username: "user123",
    password: "onlyletters",
  },
  loginSchema,
);

if (isOk(result)) {
  authenticateUser(result.value);
} else {
  displayErrors(formatErrors(result.error));
  // Output: { password: 'Password must contain letters and numbers' }
}
```

### Form Validation with Password Confirmation

```typescript
import { object, string, required, composeRight, validate, minLength, nonEmpty } from "@railway-ts/validation";
import { err, isOk, matchResult } from "@railway-ts/core";

// Define the form schema
const signupSchema = object({
  username: required(composeRight(string(), nonEmpty())),
  email: required(email()),
  password: required(composeRight(string(), minLength(8, "Password must be at least 8 characters"))),
  confirmPassword: required(string()),
});

// Custom validator for password matching
function validatePasswords(data: unknown) {
  const result = validate(data, signupSchema);

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
}

// Usage
function handleSignup(formData) {
  const result = validatePasswords(formData);

  return matchResult(result, {
    ok: (data) => createUser(data),
    err: (errors) => ({
      success: false,
      errors: formatErrors(errors),
    }),
  });
}
```

### Async Validation with API Checks

```typescript
import { object, string, required, validate, formatErrors } from "@railway-ts/validation";
import { err, fromPromise, flatMapResult, isOk, ok } from "@railway-ts/core";

// Define the basic schema
const usernameSchema = object({
  username: required(composeRight(string(), minLength(3, "Username must be at least 3 characters"))),
});

// Async validator that checks username availability
async function validateUsernameAvailability(formData: unknown) {
  // First validate the basic constraints
  const result = validate(formData, usernameSchema);

  if (isOk(result)) {
    const { username } = result.value;

    // Call API to check availability
    const response = await fromPromise(fetch(`/api/check-username?username=${username}`));

    return flatMapResult(response, async (res) => {
      const data = await res.json();

      if (data.available) {
        return ok(result.value);
      } else {
        return err([
          {
            path: ["username"],
            message: "Username already taken",
          },
        ]);
      }
    });
  }

  return result;
}

// Usage in async context
async function handleUsernameSubmission(formData) {
  const result = await validateUsernameAvailability(formData);

  return matchResult(result, {
    ok: (data) => ({ success: true, data }),
    err: (errors) => ({ success: false, errors: formatErrors(errors) }),
  });
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built on [@railway-ts/core](https://www.npmjs.com/package/@railway-ts/core) and inspired by functional programming concepts from languages like Rust, TypeScript, and Haskell.
