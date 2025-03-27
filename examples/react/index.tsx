import { matchResult, ok, pipe, type Result } from "@railway-ts/core";
import { useState } from "react";

// In published code, consumers should use:
// import { andThen, required... } from "@railway-ts/validation";
import { andThen, required, minLength, matches, isEmail, parseNumber, min, combineFormValidations } from "@/index";

// Library validation error interface
interface FieldValidationError {
  field: string | number | symbol;
  error: unknown;
}

type FieldError = {
  field: string;
  error: string;
};

// Generic validation hook
function useValidation<T extends Record<string, unknown>>() {
  // Convert library validation errors to our FieldError type
  const mapToFieldErrors = (fieldErrors: FieldValidationError[]): FieldError[] =>
    fieldErrors.map((err) => ({
      field: String(err.field),
      error: String(err.error),
    }));

  // Create a validator function with the given schema
  const createValidator = <K extends keyof T>(schema: Record<K, (value: T[K]) => ReturnType<typeof ok>>) => {
    return (data: T) => {
      // Create a record of validation results by applying each field validator to its data
      const validationResults = Object.entries(schema).reduce(
        (results, [field, validator]) => ({
          ...results,
          [field]: (validator as (value: T[keyof T]) => ReturnType<typeof ok>)(data[field as keyof T]),
        }),
        {} as Record<string, ReturnType<typeof ok>>,
      );

      return combineFormValidations(validationResults);
    };
  };

  return {
    createValidator,
    mapToFieldErrors,
  };
}

// Generic form hook
function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validateFn: (data: T) => ReturnType<typeof combineFormValidations>,
  onSubmitSuccess?: (validData: T) => void | Promise<void>,
) {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { mapToFieldErrors } = useValidation<T>();

  // Mark field as touched
  const setFieldTouched = (field: keyof T, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  };

  // Check if field is touched
  const isFieldTouched = (field: keyof T) => Boolean(touched[String(field)]);

  // Pure function to handle field changes
  const createChangeHandler = (field: keyof T) => (value: unknown) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    // Validate on change
    const result = validateFn(newData);
    matchResult(result, {
      ok: () => {
        setErrors([]);
        setIsValid(true);
      },
      err: (fieldErrors) => {
        setErrors(mapToFieldErrors(fieldErrors));
        setIsValid(false);
      },
    });
  };

  // Create a blur handler for a field
  const createBlurHandler = (field: keyof T) => () => {
    setFieldTouched(field);
  };

  // Core submit logic - pure function that can be called programmatically
  const submitForm = async (data: T = formData): Promise<Result<T, FieldValidationError[]>> => {
    // Mark all fields as touched on submit
    const allTouched = Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<string, boolean>);
    setTouched(allTouched);

    setIsSubmitting(true);

    try {
      const result = validateFn(data);

      // Update UI state based on validation result
      await matchResult(result, {
        ok: async (validData) => {
          setErrors([]);
          setIsValid(true);
          if (onSubmitSuccess) {
            await onSubmitSuccess(validData as T);
          }
        },
        err: async (fieldErrors) => {
          setErrors(mapToFieldErrors(fieldErrors));
          setIsValid(false);
        },
      });

      // Return the actual Result monad with proper typing
      return result.ok ? ok<T, FieldValidationError[]>(data) : ({ ...result } as Result<T, FieldValidationError[]>);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form submit handler for the onSubmit event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    return submitForm();
  };

  // Get error for a specific field
  const getFieldError = (field: keyof T) => errors.find((error) => error.field === String(field))?.error || "";

  // Create handlers for each field
  const createHandlers = (fields: (keyof T)[]) => {
    return fields.reduce(
      (acc, field) => ({
        ...acc,
        [field]: {
          onChange: createChangeHandler(field),
          onBlur: createBlurHandler(field),
        },
      }),
      {} as Record<
        keyof T,
        {
          onChange: (value: unknown) => void;
          onBlur: () => void;
        }
      >,
    );
  };

  return {
    formData,
    setFormData,
    errors,
    touched,
    isSubmitting,
    isValid,
    createHandlers,
    getFieldError,
    isFieldTouched,
    setFieldTouched,
    handleSubmit,
    submitForm,
  };
}

// ===================================================
// Example Usage with a user form
// ===================================================

// Define field validation functions
const useValidateUserForm = () => {
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
      andThen(isEmail("Please enter a valid email")),
    );
  };

  const validateAge = (ageStr: string) => {
    return pipe(
      ok<string, string>(ageStr),
      andThen(required("Age is required")),
      andThen(parseNumber("Please enter a valid number")),
      andThen(min(18, "You must be at least 18 years old")),
    );
  };

  return { validateUsername, validateEmail, validateAge };
};

// User form example
type UserFormData = {
  username: string;
  email: string;
  age: string;
};

const UserForm = () => {
  const { createValidator } = useValidation<UserFormData>();
  const { validateUsername, validateEmail, validateAge } = useValidateUserForm();

  // Create a validator with our schema
  const validateUserForm = createValidator({
    username: validateUsername,
    email: validateEmail,
    age: validateAge,
  });

  const initialValues: UserFormData = {
    username: "",
    email: "",
    age: "",
  };

  const { formData, handleSubmit, getFieldError, isValid, isSubmitting, createHandlers, isFieldTouched } = useForm(
    initialValues,
    validateUserForm,
  );

  const handlers = createHandlers(["username", "email", "age"]);

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => handlers.username.onChange(e.target.value)}
          onBlur={handlers.username.onBlur}
        />
        {isFieldTouched("username") && getFieldError("username") && (
          <span className="error">{getFieldError("username")}</span>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handlers.email.onChange(e.target.value)}
          onBlur={handlers.email.onBlur}
        />
        {isFieldTouched("email") && getFieldError("email") && <span className="error">{getFieldError("email")}</span>}
      </div>

      <div>
        <label htmlFor="age">Age</label>
        <input
          id="age"
          type="text"
          value={formData.age}
          onChange={(e) => handlers.age.onChange(e.target.value)}
          onBlur={handlers.age.onBlur}
        />
        {isFieldTouched("age") && getFieldError("age") && <span className="error">{getFieldError("age")}</span>}
      </div>

      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

// User form with programmatic submission example
const UserFormWithProgrammaticSubmit = () => {
  const { createValidator } = useValidation<UserFormData>();
  const { validateUsername, validateEmail, validateAge } = useValidateUserForm();

  // Create a validator with our schema
  const validateUserForm = createValidator({
    username: validateUsername,
    email: validateEmail,
    age: validateAge,
  });

  const initialValues: UserFormData = {
    username: "",
    email: "",
    age: "",
  };

  // Handle successful submission
  const handleSubmitSuccess = async (data: UserFormData) => {
    console.log("Form submitted successfully:", data);
    // Here you could call an API or trigger other actions
  };

  const { formData, handleSubmit, getFieldError, isValid, isSubmitting, createHandlers, isFieldTouched, submitForm } =
    useForm(initialValues, validateUserForm, handleSubmitSuccess);

  const handlers = createHandlers(["username", "email", "age"]);

  // Example of programmatic submission - could be called from anywhere
  const handleSaveAsDraft = async () => {
    // You can call submitForm directly with optional custom data
    const result = await submitForm({
      ...formData,
      // You could override values here if needed
      // isDraft: true
    });

    matchResult(result, {
      ok: () => console.log("Saved as draft successfully"),
      err: () => console.log("Could not save as draft - validation failed"),
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => handlers.username.onChange(e.target.value)}
            onBlur={handlers.username.onBlur}
          />
          {isFieldTouched("username") && getFieldError("username") && (
            <span className="error">{getFieldError("username")}</span>
          )}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handlers.email.onChange(e.target.value)}
            onBlur={handlers.email.onBlur}
          />
          {isFieldTouched("email") && getFieldError("email") && <span className="error">{getFieldError("email")}</span>}
        </div>

        <div>
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="text"
            value={formData.age}
            onChange={(e) => handlers.age.onChange(e.target.value)}
            onBlur={handlers.age.onBlur}
          />
          {isFieldTouched("age") && getFieldError("age") && <span className="error">{getFieldError("age")}</span>}
        </div>

        {/* Regular submit button */}
        <button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      {/* Button outside the form that can trigger submission */}
      <button onClick={handleSaveAsDraft} disabled={isSubmitting}>
        Save as Draft
      </button>
    </div>
  );
};

export { useValidation, useForm, UserForm, UserFormWithProgrammaticSubmit };
