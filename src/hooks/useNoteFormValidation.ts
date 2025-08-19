import { useState } from "react";

interface FormData {
  title: string;
  content: string;
}

interface ValidationErrors {
  title: string;
  content: string;
}

export function useNoteFormValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({
    title: "",
    content: "",
  });

  const clearError = (field: keyof ValidationErrors) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (data: FormData): boolean => {
    let isValid = true;
    const newErrors: ValidationErrors = { title: "", content: "" };

    // Title validation
    if (!data.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    } else if (data.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
      isValid = false;
    } else if (data.title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
      isValid = false;
    }

    // Content validation
    if (!data.content.trim()) {
      newErrors.content = "Content is required";
      isValid = false;
    } else if (data.content.trim().length < 10) {
      newErrors.content = "Content must be at least 10 characters long";
      isValid = false;
    } else if (data.content.trim().length > 5000) {
      newErrors.content = "Content must be less than 5000 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  return {
    errors,
    validateForm,
    clearError,
  };
}
