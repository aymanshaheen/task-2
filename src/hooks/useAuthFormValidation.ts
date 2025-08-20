import { useState, useCallback, useMemo } from "react";

// Form field types
export type AccountType = "personal" | "business";

export interface AuthFormData {
  email: string;
  password: string;

  rememberMe?: boolean;

  name?: string;
  confirmPassword?: string;
  accountType?: AccountType;
  companyName?: string;
  jobTitle?: string;
  acceptedTerms?: boolean;

  enableSecurityQuestions?: boolean;
  securityQuestion1?: string;
  securityAnswer1?: string;
  securityQuestion2?: string;
  securityAnswer2?: string;

  enable2FA?: boolean;
  phoneNumber?: string;
}

export interface ValidationErrors {
  [key: string]: string | undefined;
}

export interface TouchedFields {
  [key: string]: boolean;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any, formData: AuthFormData) => string | undefined;
}

export interface FieldConfig {
  label: string;
  placeholder: string;
  type?: "text" | "email" | "password" | "phone" | "select";
  options?: { label: string; value: string }[];
  rules?: ValidationRules;
  dependsOn?: {
    field: keyof AuthFormData;
    value: any;
  };
  hint?: string;
}

const securityQuestions = [
  { label: "What was your first pet's name?", value: "pet" },
  { label: "What city were you born in?", value: "city" },
  { label: "What was your childhood nickname?", value: "nickname" },
  { label: "What is your mother's maiden name?", value: "maiden" },
  { label: "What was the name of your elementary school?", value: "school" },
];

export const fieldConfigs: Record<string, FieldConfig> = {
  email: {
    label: "Email",
    placeholder: "Enter your email address",
    type: "email",
    rules: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 254,
    },
  },
  password: {
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
    rules: {
      required: true,
      minLength: 6,
    },
  },
  name: {
    label: "Full Name",
    placeholder: "Enter your full name",
    type: "text",
    rules: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
  },
  confirmPassword: {
    label: "Confirm Password",
    placeholder: "Confirm your password",
    type: "password",
    rules: {
      required: true,
      customValidator: (value, formData) => {
        if (value !== formData.password) {
          return "Passwords do not match";
        }
      },
    },
  },
  accountType: {
    label: "Account Type",
    placeholder: "Select account type",
    type: "select",
    options: [
      { label: "Personal Account", value: "personal" },
      { label: "Business Account", value: "business" },
    ],
    rules: { required: true },
  },
  companyName: {
    label: "Company Name",
    placeholder: "Enter your company name",
    type: "text",
    dependsOn: {
      field: "accountType",
      value: "business",
    },
    rules: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
  },
  jobTitle: {
    label: "Job Title",
    placeholder: "Enter your job title",
    type: "text",
    dependsOn: {
      field: "accountType",
      value: "business",
    },
    rules: {
      minLength: 2,
      maxLength: 100,
    },
  },
  phoneNumber: {
    label: "Phone Number",
    placeholder: "Enter your phone number",
    type: "phone",
    dependsOn: {
      field: "enable2FA",
      value: true,
    },
    rules: {
      required: true,
      pattern: /^\+?[\d\s\-\(\)]+$/,
      minLength: 10,
    },
    hint: "Required for two-factor authentication",
  },
  securityQuestion1: {
    label: "Security Question 1",
    placeholder: "Select a security question",
    type: "select",
    options: securityQuestions,
    dependsOn: {
      field: "enableSecurityQuestions",
      value: true,
    },
    rules: { required: true },
  },
  securityAnswer1: {
    label: "Answer 1",
    placeholder: "Enter your answer",
    type: "text",
    dependsOn: {
      field: "enableSecurityQuestions",
      value: true,
    },
    rules: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
  },
  securityQuestion2: {
    label: "Security Question 2",
    placeholder: "Select another security question",
    type: "select",
    options: securityQuestions,
    dependsOn: {
      field: "enableSecurityQuestions",
      value: true,
    },
    rules: {
      required: true,
      customValidator: (value, formData) => {
        if (value === formData.securityQuestion1) {
          return "Please select a different question";
        }
      },
    },
  },
  securityAnswer2: {
    label: "Answer 2",
    placeholder: "Enter your answer",
    type: "text",
    dependsOn: {
      field: "enableSecurityQuestions",
      value: true,
    },
    rules: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
  },
};

export function useAuthFormValidation(formType: "login" | "signup") {
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    ...(formType === "login"
      ? { rememberMe: false }
      : {
          name: "",
          confirmPassword: "",
          acceptedTerms: false,
          enableSecurityQuestions: false,
          enable2FA: false,
        }),
  });

  const [touched, setTouched] = useState<TouchedFields>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [liveValidation, setLiveValidation] = useState(true);

  // Get visible fields based on form type and dependencies
  const visibleFields = useMemo(() => {
    const baseFields =
      formType === "login"
        ? ["email", "password"]
        : ["name", "email", "password", "confirmPassword"];

    const dynamicFields: string[] = [];

    if (formType === "signup") {
      if (formData.enable2FA) {
        dynamicFields.push("phoneNumber");
      }

      if (formData.enableSecurityQuestions) {
        dynamicFields.push(
          "securityQuestion1",
          "securityAnswer1",
          "securityQuestion2",
          "securityAnswer2"
        );
      }
    }

    return [...baseFields, ...dynamicFields];
  }, [formType, formData.enable2FA, formData.enableSecurityQuestions]);

  const validateField = useCallback(
    (fieldName: string, value: any): string | undefined => {
      const config = fieldConfigs[fieldName];
      if (!config?.rules) return undefined;

      const { required, minLength, maxLength, pattern, customValidator } =
        config.rules;

      if (
        required &&
        (!value || (typeof value === "string" && !value.trim()))
      ) {
        return `${config.label} is required`;
      }

      if (!value || (typeof value === "string" && !value.trim())) {
        return undefined; 
      }

      if (typeof value === "string") {
        if (minLength && value.trim().length < minLength) {
          return `${config.label} must be at least ${minLength} character${
            minLength > 1 ? "s" : ""
          }`;
        }

        if (maxLength && value.trim().length > maxLength) {
          return `${config.label} must be less than ${maxLength} characters`;
        }

        if (pattern && !pattern.test(value.trim())) {
          if (fieldName === "email") {
            return "Please enter a valid email address";
          }
          if (fieldName === "phoneNumber") {
            return "Please enter a valid phone number";
          }
          return `${config.label} format is invalid`;
        }
      }

      if (customValidator) {
        return customValidator(value, formData);
      }

      return undefined;
    },
    [formData]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    visibleFields.forEach((fieldName) => {
      const fieldValue = formData[fieldName as keyof AuthFormData];
      const error = validateField(fieldName, fieldValue);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    if (formType === "signup" && !formData.acceptedTerms) {
      newErrors.acceptedTerms = "You must accept the terms of service";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [visibleFields, formData, validateField, formType]);

  const updateField = useCallback(
    (fieldName: keyof AuthFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));

      if (liveValidation && touched[fieldName as string]) {
        const error = validateField(fieldName as string, value);
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
      }
    },
    [validateField, liveValidation, touched]
  );

  const setFieldTouched = useCallback(
    (fieldName: string) => {
      setTouched((prev) => {
        if (prev[fieldName]) return prev;

        const newTouched = { ...prev, [fieldName]: true };

        if (liveValidation) {
          const fieldValue = formData[fieldName as keyof AuthFormData];
          const error = validateField(fieldName, fieldValue);
          setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: error }));
        }

        return newTouched;
      });
    },
    [validateField, liveValidation, formData]
  );

  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
  }, []);

  const resetForm = useCallback(() => {
    const initialData: AuthFormData = {
      email: "",
      password: "",
      ...(formType === "login"
        ? { rememberMe: false }
        : {
            name: "",
            confirmPassword: "",
            acceptedTerms: false,
            enableSecurityQuestions: false,
            enable2FA: false,
          }),
    };
    setFormData(initialData);
    setTouched({});
    setErrors({});
  }, [formType]);

  const passwordStrength = useMemo(() => {
    if (formType !== "signup" || !formData.password) {
      return { score: 0, feedback: [], requirements: {} };
    }

    const requirements = {
      length: formData.password.length >= 8,
      uppercase: /[A-Z]/.test(formData.password),
      lowercase: /[a-z]/.test(formData.password),
      number: /[0-9]/.test(formData.password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    let feedback: string[] = [];

    if (formData.password.length === 0) {
      feedback.push("Enter a password");
    } else {
      if (!requirements.length) feedback.push("At least 8 characters");
      if (!requirements.uppercase) feedback.push("One uppercase letter");
      if (!requirements.lowercase) feedback.push("One lowercase letter");
      if (!requirements.number) feedback.push("One number");
      if (!requirements.special) feedback.push("One special character");
    }

    return {
      score: Math.min(metRequirements, 4),
      feedback,
      requirements,
    };
  }, [formType, formData.password]);

  const getAllValidationErrors = useCallback(() => {
    const validationErrors: {
      field: string;
      label: string;
      message: string;
    }[] = [];

    visibleFields.forEach((fieldName) => {
      const config = fieldConfigs[fieldName];
      if (!config) return;

      const fieldValue = formData[fieldName as keyof AuthFormData];
      const error = validateField(fieldName, fieldValue);

      if (error) {
        validationErrors.push({
          field: fieldName,
          label: config.label,
          message: error,
        });
      }
    });

    if (formType === "signup" && !formData.acceptedTerms) {
      validationErrors.push({
        field: "acceptedTerms",
        label: "Terms of Service",
        message: "You must accept the terms of service",
      });
    }

    return validationErrors;
  }, [visibleFields, formData, validateField, formType]);

  const isFormValid = useMemo(() => {
    const hasErrors = Object.values(errors).some((error) => !!error);
    const hasRequiredFields = visibleFields.every((fieldName) => {
      const config = fieldConfigs[fieldName];
      if (!config?.rules?.required) return true;

      const value = formData[fieldName as keyof AuthFormData];
      return value && (typeof value !== "string" || value.trim().length > 0);
    });

    const hasAcceptedTerms = formType === "login" || formData.acceptedTerms;

    return !hasErrors && hasRequiredFields && hasAcceptedTerms;
  }, [errors, visibleFields, formData, formType]);

  return {
    formData,
    errors,
    touched,
    visibleFields,
    isFormValid,
    passwordStrength,
    liveValidation,
    updateField,
    setFieldTouched,
    clearError,
    validateForm,
    getAllValidationErrors,
    resetForm,
    setLiveValidation,
  };
}
