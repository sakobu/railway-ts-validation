import { matchResult } from "@railway-ts/core";

import {
  array,
  composeRight,
  email,
  mustBeChecked,
  formatErrors,
  minLength,
  object,
  optional,
  parseBool,
  parseDate,
  parseNumber,
  pattern,
  required,
  string,
  stringEnum,
  validate,
  type InferSchemaType,
  type ValidationError,
  type ValidationResult,
  nonEmpty,
} from "@/index";

const invalidInput = {
  username: "jo", // too short
  email: "not-an-email", // invalid format
  password: "password", // not complex enough
  age: "25", // string that will be parsed to a number
  birthdate: "1995-05-15", // string that will be parsed to a Date
  termsAccepted: "yes", // string that will be parsed to boolean true
  address: {
    street: "123 Main St",
    city: "A", // too short
    zipCode: "1234", // invalid format
  },
  contacts: ["email", "phone", "fax"], // fax is not a valid option
};

const validInput = {
  username: "john_doe",
  email: "valid@email.com",
  password: "ComplexPassword123!",
  age: 30,
  birthdate: new Date("1995-05-15"),
  termsAccepted: true,
  address: {
    street: "123 Main St",
    city: "New York",
    zipCode: "10001",
  },
  contacts: ["email", "phone"],
};

export const addressSchema = object({
  street: optional(composeRight(string(), minLength(3))),
  city: optional(composeRight(string(), minLength(2))),
  zipCode: optional(composeRight(string(), pattern(/^\d{5}$/))),
});

export const userSchema = object({
  username: required(composeRight(string(), nonEmpty(), minLength(3))),
  email: required(composeRight(string(), nonEmpty(), email())),
  password: required(composeRight(string(), nonEmpty(), minLength(8))),
  age: required(parseNumber()),
  birthdate: required(parseDate()),
  hasAcceptedTerms: required(composeRight(parseBool(), mustBeChecked())),
  role: required(stringEnum(["admin", "user"])),
  address: optional(addressSchema),
  contacts: optional(array(stringEnum(["email", "phone"]))),
});

type User = InferSchemaType<typeof userSchema>;

const validUserSchema = validate(validInput, userSchema);

const valid = matchResult<User, ValidationError[], ValidationResult<User>>(validUserSchema, {
  ok: (validData) => ({
    valid: true,
    data: validData,
  }),
  err: (errors) => ({
    valid: false,
    errors: formatErrors(errors),
  }),
});

console.log("**********************************************");
console.log(valid);
console.log("**********************************************");

const invalidUserSchema = validate(invalidInput, userSchema);

const invalid = matchResult<User, ValidationError[], ValidationResult<User>>(invalidUserSchema, {
  ok: (validData) => ({
    valid: true,
    data: validData,
  }),
  err: (errors) => ({
    valid: false,
    errors: formatErrors(errors),
  }),
});

console.log("**********************************************");
console.log(invalid);
console.log("**********************************************");
