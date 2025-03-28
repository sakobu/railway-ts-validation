import { ok, match } from "@railway-ts/core/result";
import { pipe } from "@railway-ts/core/utils";

// In published code, consumers should use:
// import { matches, minLength... } from "@railway-ts/validation";
import {
  matches,
  minLength,
  required,
  custom,
  isEmail,
  parseNumber,
  min,
  integer,
  andThen,
  combineValidation,
  isUrl,
  parseDate,
  dateRange,
  max,
  float,
  exactLength,
  minItems,
  combineAllValidations,
  combineFormValidations,
  equals,
  maxItems,
  maxLength,
  oneOf,
  parseBoolean,
  validateArray,
  optional,
  optionalTransform,
  withDefault,
} from "@/index";

// ===================================================
// Validation Example
// ===================================================
//

const validateUsername = (username: string) => {
  return pipe(
    ok<string, string>(username),
    andThen(required("Username is required")),
    andThen(minLength(3, "Username too short")),
    andThen(matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscore")),
  );
};

const validateEmail = (emailValue: string) => {
  return pipe(
    ok<string, string>(emailValue),
    andThen(required("Email is required")),
    andThen(isEmail()),
    andThen(custom((e) => !e.endsWith("gmail.com"), "Gmail addresses not accepted")),
  );
};

const validateAge = (ageStr: string) => {
  return pipe(
    ok<string, string>(ageStr),
    andThen(required("Age is required")),
    andThen(parseNumber("Please enter a valid number")),
    andThen(min(18, "You must be at least 18 years old")),
    andThen(integer("Age must be a whole number")),
  );
};

const validateDirectAge = (age: number) => {
  return pipe(
    ok<number, string>(age),
    andThen(required("Age is required")),
    andThen(min(18, "You must be at least 18 years old")),
    andThen(integer("Age must be a whole number")),
  );
};

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

// ===================================================
// Advanced Validation Examples
// ===================================================

// URL validation
const validateWebsite = (url: string | undefined) => {
  return pipe(
    ok<string | undefined, string>(url),
    andThen(optional(isUrl("Please enter a valid URL"))),
    andThen(optional(custom((url) => !url.includes("example.com"), "Example domains are not allowed"))),
  );
};

// Date validation
const validateEventDate = (dateStr: string | undefined) => {
  const today = new Date();
  const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  return pipe(
    ok<string | undefined, string>(dateStr),
    andThen(optionalTransform(parseDate("Please enter a valid date"))),
    andThen(optional(dateRange(today, nextYear, "Event must be scheduled between today and next year"))),
  );
};

// Number validation with range and decimal requirements
const validatePrice = (priceStr: string | undefined) => {
  return pipe(
    ok<string | undefined, string>(priceStr),
    andThen(optionalTransform(parseNumber("Please enter a valid number"))),
    andThen(optional(min(0.01, "Price must be greater than zero"))),
    andThen(optional(max(9999.99, "Price cannot exceed $9,999.99"))),
    andThen(optional(float("Price must include cents (e.g., 10.99)"))),
  );
};

// Exact length validation (e.g., for verification codes)
const validateVerificationCode = (code: string | undefined) => {
  return pipe(
    ok<string | undefined, string>(code),
    andThen(optional(exactLength(6, "Verification code must be exactly 6 characters"))),
    andThen(optional(matches(/^[0-9]+$/, "Verification code must contain only numbers"))),
  );
};

// Array validation
const validateTag = (tag: string) => {
  return pipe(
    ok<string, string>(tag),
    andThen(minLength(2, "Tag must be at least 2 characters")),
    andThen(maxLength(20, "Tag cannot exceed 20 characters")),
    andThen(matches(/^[a-z0-9-]+$/, "Tags can only contain lowercase letters, numbers, and hyphens")),
  );
};

const validateTags = (tags: string[]) => {
  return pipe(
    ok<string[], string>(tags),
    andThen(minItems(1, "At least one tag is required")),
    andThen(maxItems(5, "You can add up to 5 tags")),
    andThen(validateArray(validateTag, "One or more tags are invalid")),
  );
};

// Enum validation with oneOf
const validateRoleWithDefault = (role: string | undefined) => {
  return pipe(
    ok<string | undefined, string>(role),
    andThen(withDefault("viewer")), // Default to "viewer" if undefined
    andThen(oneOf(["admin", "editor", "viewer"], "Invalid role selected")),
  );
};
// Boolean validation
const validateTermsAccepted = (termsStr: string) => {
  return pipe(
    ok<string, string>(termsStr),
    andThen(parseBoolean("Invalid boolean value")),
    andThen(equals(true, "You must accept the terms and conditions")),
  );
};

// Password confirmation validation
const validatePasswordConfirmation = (password: string, confirmation: string) => {
  return pipe(
    ok<string, string>(confirmation),
    andThen(required("Please confirm your password")),
    andThen(equals(password, "Passwords do not match")),
  );
};

// ===================================================
// Form Validation Examples
// ===================================================

// Example 1: Basic form validation with combineValidation
const validateForm = (username: string, email: string, age: string, ageNum: number, password: string) => {
  // Get individual validation results
  const validUsername = validateUsername(username);
  const validEmail = validateEmail(email);
  const validAge = validateAge(age);
  const validDirectAge = validateDirectAge(ageNum);
  const validPassword = validatePassword(password);

  // Combine them into a single result - returns first error
  return combineValidation([validUsername, validEmail, validAge, validDirectAge, validPassword]);
};

// Example 2: Form validation with all errors using combineAllValidations
const validateFormWithAllErrors = (username: string, email: string, age: string, password: string) => {
  // Get individual validation results
  const validUsername = validateUsername(username);
  const validEmail = validateEmail(email);
  const validAge = validateAge(age);
  const validPassword = validatePassword(password);

  // Combine them and collect all errors
  return combineAllValidations([validUsername, validEmail, validAge, validPassword]);
};

// Example 3: Form validation with field names using combineFormValidations

type FormData = {
  username: string;
  email: string;
  age: string;
  password: string;
  passwordConfirmation: string;
  termsAccepted: string;
  tags: string[];
  role?: string;
  website?: string;
  eventDate?: string;
  price?: string;
  verificationCode?: string;
};

const validateFormWithFieldNames = (formData: FormData) => {
  const {
    username,
    email,
    age,
    password,
    passwordConfirmation,
    termsAccepted,
    tags,
    role,
    website,
    eventDate,
    price,
    verificationCode,
  } = formData;

  // Create an object with field validation results
  return combineFormValidations({
    username: validateUsername(username),
    email: validateEmail(email),
    age: validateAge(age),
    password: validatePassword(password),
    passwordConfirmation: validatePasswordConfirmation(password, passwordConfirmation),
    termsAccepted: validateTermsAccepted(termsAccepted),
    tags: validateTags(tags),
    role: validateRoleWithDefault(role),
    website: validateWebsite(website),
    eventDate: validateEventDate(eventDate),
    price: validatePrice(price),
    verificationCode: validateVerificationCode(verificationCode),
  });
};

// ===================================================
// Usage Examples
// ===================================================

console.log("=== Basic Form Validation ===");
const formResult = validateForm("john_doe", "john@example.com", "25", 25, "Password123");
match(formResult, {
  ok: (values) => console.log("All validations passed:", values),
  err: (error) => console.error("Validation failed:", error),
});

console.log("\n=== Invalid Form with First Error ===");
const invalidFormResult = validateForm("jasdfasdf", "invalid-email", "17", 17, "weak");
match(invalidFormResult, {
  ok: (values) => console.log("All validations passed:", values),
  err: (error) => console.error("Validation failed:", error),
});

console.log("\n=== Invalid Form with All Errors ===");
const invalidFormWithAllErrors = validateFormWithAllErrors("j", "invalid-email", "17", "weak");
match(invalidFormWithAllErrors, {
  ok: (values) => console.log("All validations passed:", values),
  err: (errors) => console.error("Validation failed with multiple errors:", errors),
});

console.log("\n=== Form Validation with Field Names ===");
const formWithFieldNames = validateFormWithFieldNames({
  username: "john_doe",
  email: "john@example.com",
  age: "25",
  password: "Password123",
  passwordConfirmation: "Password123",
  website: "https://johnsblog.com",
  role: "editor",
  termsAccepted: "yes",
  tags: ["typescript", "validation", "railway-pattern"],
  eventDate: "2025-06-15",
  price: "199.99",
  verificationCode: "123456",
});
match(formWithFieldNames, {
  ok: (values) => console.log("Form validation passed:", values),
  err: (fieldErrors) => {
    console.error("Form validation failed with field errors:");
    fieldErrors.forEach(({ field, error }) => {
      console.error(`  - ${field}: ${error}`);
    });
  },
});

console.log("\n=== Invalid Form with Field Names ===");
const invalidFormWithFieldNames = validateFormWithFieldNames({
  username: "j",
  email: "invalid-email",
  age: "17",
  password: "weak",
  passwordConfirmation: "different",
  website: "not-a-url",
  role: "superadmin",
  termsAccepted: "no",
  tags: ["a", "very-long-tag-that-exceeds-twenty-characters", "invalid tag!"],
  eventDate: "invalid-date",
  price: "free",
  verificationCode: "12345", // Too short
});
match(invalidFormWithFieldNames, {
  ok: (values) => console.log("Form validation passed:", values),
  err: (fieldErrors) => {
    console.error("Form validation failed with field errors:");
    fieldErrors.forEach(({ field, error }) => {
      console.error(`  - ${field}: ${error}`);
    });
  },
});

console.log("\n=== Form with Optional Fields and Defaults ===");
const formWithOptionalFields = validateFormWithFieldNames({
  username: "jane_smith",
  email: "jane@example.com",
  age: "30",
  password: "SecurePass123",
  passwordConfirmation: "SecurePass123",
  // role: undefined, // Omitting role to demonstrate default value
  termsAccepted: "yes",
  tags: ["typescript", "optional-validation"],
  // Omitting optional fields
  // website, eventDate, price, and verificationCode are undefined
});
match(formWithOptionalFields, {
  ok: (values) => console.log("Form with optional fields passed:", values),
  err: (fieldErrors) => {
    console.error("Form validation failed with field errors:");
    fieldErrors.forEach(({ field, error }) => {
      console.error(`  - ${field}: ${error}`);
    });
  },
});
