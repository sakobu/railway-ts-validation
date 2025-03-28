# @railway-ts/validation

[![npm version](https://img.shields.io/npm/v/@railway-ts/validation.svg)](https://www.npmjs.com/package/@railway-ts/validation)
[![Build Status](https://github.com/sakobu/railway-ts-validation/workflows/CI/badge.svg)](https://github.com/sakobu/railway-ts-validation/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@railway-ts/validation)](https://bundlephobia.com/package/@railway-ts/validation)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Coverage](https://img.shields.io/codecov/c/github/sakobu/railway-ts-validation)](https://codecov.io/gh/sakobu/railway-ts-validation)

A functional validation library for TypeScript built on top of [@railway-ts/core](https://github.com/sakobu/railway-ts).

## Overview

`@railway-ts/validation` provides a comprehensive set of type-safe validation functions utilizing the Railway Oriented Programming pattern. It leverages the `Result` type from `@railway-ts/core` to handle validation errors in a functional, predictable way without exceptions.

The library allows for elegant composition of validation rules with detailed error reporting and supports both simple field validations and complex form validations.

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

## Comparison with Other Validation Libraries

### @railway-ts/validation vs Zod

- **Tree-shaking**: @railway-ts/validation is fully tree-shakable with individual function imports, while Zod's object-oriented API limits tree-shaking capabilities
- **Bundle Size**: @railway-ts/validation is significantly lighter when tree-shaken due to its functional approach and modular architecture
- **Error Handling**: @railway-ts/validation uses the Result type from @railway-ts/core for explicit error handling, while Zod uses exceptions
- **API Style**: @railway-ts/validation uses standalone utility functions and pipe/flow for composition; Zod uses method chaining and schema building
- **Integration**: @railway-ts/validation integrates seamlessly with other railway-oriented patterns in your codebase

### @railway-ts/validation vs Yup

- **Functional Approach**: @railway-ts/validation is built on functional programming principles, while Yup uses a more object-oriented approach
- **Composition**: @railway-ts/validation enables cleaner function composition with pipe/flow utilities
- **Type Safety**: Both provide robust type safety, with @railway-ts/validation focusing on explicit Result types for error handling
- **Performance**: @railway-ts/validation's tree-shakable architecture often results in better runtime performance for simpler validations

### @railway-ts/validation vs class-validator

- **Runtime vs Decorator**: @railway-ts/validation uses runtime validation rather than decorator-based validation
- **Framework Agnostic**: @railway-ts/validation works with any TypeScript project, not tied to frameworks like NestJS
- **Functional Style**: @railway-ts/validation promotes a pure functional approach without side effects or class dependencies
- **Explicit Error Flow**: @railway-ts/validation makes error paths explicit through the Result type

## Features

- **Type-safe validation functions**: Strongly-typed validators for strings, numbers, dates, arrays, and more
- **Composable validation rules**: Chain validators together using functional programming patterns
- **Detailed error reporting**: Collects field-level errors for forms with specific error messages
- **Form validation**: Built-in utilities for validating entire forms with field names
- **Zero dependencies**: Only depends on `@railway-ts/core`
- **Fully tree-shakable**: Import only what you need
- **Customizable**: Create custom validators with ease

## Basic Usage

```typescript
import { ok } from "@railway-ts/core/result";
import { pipe } from "@railway-ts/core/utils";
import { required, minLength, matches, isEmail, andThen } from "@railway-ts/validation";

// Validate a username
const validateUsername = (username: string) => {
  return pipe(
    ok<string, string>(username),
    andThen(required("Username is required")),
    andThen(minLength(3, "Username too short")),
    andThen(matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscore")),
  );
};

// Validate an email
const validateEmail = (email: string) => {
  return pipe(
    ok<string, string>(email),
    andThen(required("Email is required")),
    andThen(isEmail("Invalid email address")),
  );
};

// Usage
const usernameResult = validateUsername("john_doe");
const emailResult = validateEmail("invalid-email");
```

## Combining Validations

The library provides multiple ways to combine validation results:

```typescript
import { combineValidation, combineAllValidations, combineFormValidations } from "@railway-ts/validation";
import { match } from "@railway-ts/core/result";

// Basic form validation - returns first error
const formResult = combineValidation([
  validateUsername("john_doe"),
  validateEmail("john@example.com"),
  validateAge("25"),
]);

// Collect all errors
const allErrorsResult = combineAllValidations([
  validateUsername("j"),
  validateEmail("invalid-email"),
  validateAge("17"),
]);

// Field-level validation with names
const fieldResult = combineFormValidations({
  username: validateUsername("john_doe"),
  email: validateEmail("john@example.com"),
  age: validateAge("25"),
});

// Processing the result
match(fieldResult, {
  ok: (values) => console.log("All validations passed:", values),
  err: (fieldErrors) => {
    console.error("Form validation failed:");
    fieldErrors.forEach(({ field, error }) => {
      console.error(`  - ${field}: ${error}`);
    });
  },
});
```

## Available Validators

### Core/Generic Validators

| Function                         | Description                                                    |
| -------------------------------- | -------------------------------------------------------------- |
| `required(message?)`             | Validates that a value is not null, undefined, or empty string |
| `custom(predicate, message)`     | Creates a validator with a custom validation function          |
| `equals(comparison, message)`    | Validates that a value equals another value                    |
| `notEquals(comparison, message)` | Validates that a value does not equal another value            |
| `oneOf(allowedValues, message?)` | Validates that a value is one of the allowed values            |

### String Validators

| Function                        | Description                                 |
| ------------------------------- | ------------------------------------------- |
| `minLength(min, message?)`      | Validates minimum string length             |
| `maxLength(max, message?)`      | Validates maximum string length             |
| `exactLength(length, message?)` | Validates that a string has an exact length |
| `matches(regex, message)`       | Validates a string against a regex pattern  |
| `isEmail(message?)`             | Validates that a string is an email address |
| `isUrl(message?)`               | Validates that a string is a valid URL      |

### Number Validators

| Function                            | Description                               |
| ----------------------------------- | ----------------------------------------- |
| `min(minimum, message?)`            | Validates minimum numeric value           |
| `max(maximum, message?)`            | Validates maximum numeric value           |
| `range(minimum, maximum, message?)` | Validates a number is within a range      |
| `integer(message?)`                 | Validates that a value is an integer      |
| `float(message?)`                   | Validates that a value is a decimal/float |
| `number(message?)`                  | Validates that a value is a valid number  |

### Type Conversions

| Function                 | Description                               |
| ------------------------ | ----------------------------------------- |
| `parseNumber(message?)`  | Converts string to number and validates   |
| `parseBoolean(message?)` | Converts string to boolean and validates  |
| `parseDate(message?)`    | Converts string to date and validates     |
| `parseUTCDate(message?)` | Converts string to UTC date and validates |

### Array Validators

| Function                             | Description                                   |
| ------------------------------------ | --------------------------------------------- |
| `minItems(min, message?)`            | Validates minimum number of items in an array |
| `maxItems(max, message?)`            | Validates maximum number of items in an array |
| `validateArray(validator, message?)` | Applies a validator to each item in an array  |

### Date Validators

| Function                                | Description                                  |
| --------------------------------------- | -------------------------------------------- |
| `dateRange(minDate, maxDate, message?)` | Validates a date is within a specified range |

### Conditional Validators

| Function                       | Description                                           |
| ------------------------------ | ----------------------------------------------------- |
| `optional(validator)`          | Only applies validator if value is not null/undefined |
| `optionalTransform(validator)` | Handles transformations for optional values           |
| `withDefault(defaultValue)`    | Provides a default value if input is null/undefined   |

### Utility Functions

| Function                              | Description                              |
| ------------------------------------- | ---------------------------------------- |
| `andThen(fn)`                         | Curried version of `flatMap` from Result |
| `combineValidation(results)`          | Combines results, returns first error    |
| `combineAllValidations(results)`      | Combines results, returns all errors     |
| `combineFormValidations(validations)` | Combines field validations with names    |

## Advanced Examples

### Password Validation

```typescript
import { ok } from "@railway-ts/core/result";
import { pipe } from "@railway-ts/core/utils";
import { required, minLength, matches, equals, optional, isUrl, custom, andThen } from "@railway-ts/validation";

const validatePassword = (password: string) => {
  return pipe(
    ok<string, string>(password),
    andThen(required("Password is required")),
    andThen(minLength(8, "Password must be at least 8 characters")),
    andThen(matches(/[A-Z]/, "Password must contain an uppercase letter")),
    andThen(matches(/[a-z]/, "Password must contain a lowercase letter")),
    andThen(matches(/[0-9]/, "Password must contain a number")),
  );
};

const validatePasswordConfirmation = (password: string, confirmation: string) => {
  return pipe(
    ok<string, string>(confirmation),
    andThen(required("Please confirm your password")),
    andThen(equals(password, "Passwords do not match")),
  );

  const validateWebsite = (url: string | undefined) => {
    return pipe(
      ok<string | undefined, string>(url),
      andThen(optional(isUrl("Please enter a valid URL"))),
      andThen(optional(custom((url) => !url.includes("example.com"), "Example domains are not allowed"))),
    );
  };
};
```

### Complete Form Validation

```typescript
import { combineFormValidations } from "@railway-ts/validation";
import { match } from "@railway-ts/core/result";

type FormData = {
  username: string;
  email: string;
  age: string;
  password: string;
  passwordConfirmation: string;
  website?: string;
  role: string;
  termsAccepted: string;
};

const validateForm = (formData: FormData) => {
  const { username, email, age, password, passwordConfirmation, website, role, termsAccepted } = formData;

  return combineFormValidations({
    username: validateUsername(username),
    email: validateEmail(email),
    age: validateAge(age),
    password: validatePassword(password),
    passwordConfirmation: validatePasswordConfirmation(password, passwordConfirmation),
    website: validateWebsite(website),
    role: validateRole(role),
    termsAccepted: validateTermsAccepted(termsAccepted),
  });
};

// Usage
const formResult = validateForm({
  username: "john_doe",
  email: "john@example.com",
  age: "25",
  password: "Password123",
  passwordConfirmation: "Password123",
  website: "https://johnsblog.com", // Optional value
  role: "editor",
  termsAccepted: "yes",
});

match(formResult, {
  ok: (values) => console.log("Form validation passed:", values),
  err: (fieldErrors) => {
    console.error("Form validation failed:");
    fieldErrors.forEach(({ field, error }) => {
      console.error(`  - ${field}: ${error}`);
    });
  },
});
```

## Integration with Framework Forms

While this library is framework-agnostic, it can be easily integrated with React, Vue, Angular, or any other framework. Here's a simple example with React:

```typescript
import React, { useState } from "react";
import { match } from "@railway-ts/core/result";

// Form validation logic using @railway-ts/validation ...

function SignupForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirmation: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = validateForm(form);

    match(result, {
      ok: (validatedData) => {
        // Submit the form data
        console.log("Submitting:", validatedData);
        setErrors({});
      },
      err: (fieldErrors) => {
        // Transform errors into object format
        const errorObj = fieldErrors.reduce((acc, { field, error }) => {
          acc[field] = error;
          return acc;
        }, {});
        setErrors(errorObj);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username</label>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
        />
        {errors.username && <div className="error">{errors.username}</div>}
      </div>

      {/* Other form fields... */}

      <button type="submit">Sign Up</button>
    </form>
  );
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with TypeScript and functional programming principles. Works perfectly with [@railway-ts/core](https://github.com/sakobu/railway-ts).
