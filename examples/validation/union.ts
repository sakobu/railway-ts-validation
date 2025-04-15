import { matchResult } from "@railway-ts/core";

import {
  between,
  composeRight,
  discriminatedUnion,
  formatErrors,
  object,
  parseDate,
  parseNumber,
  stringEnum,
  validate,
  type InferSchemaType,
  type ValidationError,
  type ValidationResult,
} from "@/index";

export const ENGINE_OPTIONS = ["IMP", "RCS", "TCM"] as const;
export type EngineType = (typeof ENGINE_OPTIONS)[number];

export const NODE_OPTIONS = ["Ascending", "Descending", "Optimal", "Next"] as const;
export type Node = (typeof NODE_OPTIONS)[number];

export const OPTION_OPTIONS = ["Min-Latitude", "Max-Latitude", "Optimal", "Next"] as const;
export type Option = (typeof OPTION_OPTIONS)[number];

export type ManeuverType = "manual_burn" | "inclination_change" | "right_ascension_change";

const manualBurnUnionSchema = object({
  type: stringEnum<ManeuverType>(["manual_burn"]),
  epoch: composeRight(parseDate()),
  Radial: composeRight(parseNumber(), between(-1000, 1000)),
  InTrack: composeRight(parseNumber(), between(-1000, 1000)),
  CrossTrack: composeRight(parseNumber(), between(-1000, 1000)),
  Engine: stringEnum<EngineType>([...ENGINE_OPTIONS]),
});

const inclinationChangeUnionSchema = object({
  type: stringEnum<ManeuverType>(["inclination_change"]),
  epoch: composeRight(parseDate()),
  Inclination: composeRight(parseNumber(), between(0, 180)),
  Node: stringEnum<Node>([...NODE_OPTIONS]),
  Engine: stringEnum<EngineType>([...ENGINE_OPTIONS]),
});

const rightAscensionChangeUnionSchema = object({
  type: stringEnum<ManeuverType>(["right_ascension_change"]),
  epoch: composeRight(parseDate()),
  RAAN: composeRight(parseNumber(), between(0, 360)),
  Option: stringEnum<Option>([...OPTION_OPTIONS]),
  Engine: stringEnum<EngineType>([...ENGINE_OPTIONS]),
});

const maneuverTypeSchema = discriminatedUnion<Maneuver>("type", {
  manual_burn: manualBurnUnionSchema,
  inclination_change: inclinationChangeUnionSchema,
  right_ascension_change: rightAscensionChangeUnionSchema,
});

// Define types for each part of the union
type ManualBurnManeuver = InferSchemaType<typeof manualBurnUnionSchema>;
type InclinationChangeManeuver = InferSchemaType<typeof inclinationChangeUnionSchema>;
type RightAscensionChangeManeuver = InferSchemaType<typeof rightAscensionChangeUnionSchema>;

// Combine them into the final Maneuver type
type Maneuver = ManualBurnManeuver | InclinationChangeManeuver | RightAscensionChangeManeuver;

// --- Valid Data Example ---
const validManeuverData = {
  type: "manual_burn",
  epoch: new Date("2025-05-01T12:00:00Z"),
  Radial: 100,
  InTrack: 200,
  CrossTrack: -50,
  Engine: "RCS",
};

// --- Invalid Data Examples ---
const invalidManualBurnData = {
  type: "manual_burn",
  epoch: "not-a-date", // Invalid date format
  Radial: 2000, // Out of bounds
  InTrack: 100,
  CrossTrack: 100,
  Engine: "INVALID_ENGINE", // Not a valid engine type
};

const invalidInclinationChangeData = {
  type: "inclination_change",
  epoch: new Date("2025-05-01T12:00:00Z"),
  Inclination: 200, // Out of bounds
  Node: "InvalidNode", // Not a valid node
  Engine: "RCS",
};

const invalidRightAscensionData = {
  type: "right_ascension_change",
  epoch: new Date("2025-05-01T12:00:00Z"),
  RAAN: 400, // Out of bounds
  Option: "InvalidOption", // Not a valid option
  Engine: "TCM",
};

const invalidTypeData = {
  type: "unknown_maneuver", // Invalid type
  epoch: new Date("2025-05-01T12:00:00Z"),
  value: 123,
};

// --- Validation Function ---
// Helper to simplify validation and result matching
const processValidation = (data: unknown) => {
  const validationResult = validate(data, maneuverTypeSchema);
  return matchResult<Maneuver, ValidationError[], ValidationResult<Maneuver>>(validationResult, {
    ok: (validData) => ({
      valid: true,
      data: validData,
    }),
    err: (errors) => ({
      valid: false,
      errors: formatErrors(errors),
    }),
  });
};

// --- Process and Log Results ---

console.log("--- Valid Maneuver Data ---");
const validResult = processValidation(validManeuverData);
console.log(JSON.stringify(validResult, null, 2));
console.log("----------------------------");

console.log("--- Invalid Manual Burn Data ---");
const invalidManualBurnResult = processValidation(invalidManualBurnData);
console.log(JSON.stringify(invalidManualBurnResult, null, 2));
console.log("-------------------------------");

console.log("--- Invalid Inclination Change Data ---");
const invalidInclinationResult = processValidation(invalidInclinationChangeData);
console.log(JSON.stringify(invalidInclinationResult, null, 2));
console.log("--------------------------------------");

console.log("--- Invalid Right Ascension Data ---");
const invalidRightAscensionResult = processValidation(invalidRightAscensionData);
console.log(JSON.stringify(invalidRightAscensionResult, null, 2));
console.log("-----------------------------------");

console.log("--- Invalid Type Data ---");
const invalidTypeResult = processValidation(invalidTypeData);
console.log(JSON.stringify(invalidTypeResult, null, 2));
console.log("-------------------------");
