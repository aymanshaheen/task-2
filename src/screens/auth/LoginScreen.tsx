import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Alert, Keyboard } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useAuthFormValidation } from "../../hooks/useAuthFormValidation";
import { useAutoSave } from "../../hooks/useAutoSave";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { AuthTitle } from "../../components/auth/AuthTitle";
import { AuthTextInput } from "../../components/auth/AuthTextInput";
import { AuthToggle } from "../../components/auth/AuthToggle";
import { ValidationMessages } from "../../components/auth/ValidationMessages";

export function LoginScreen({ navigation }: any) {
  const { login, loading } = useAuth();
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  const {
    formData,
    errors,
    touched,
    isFormValid,
    updateField,
    setFieldTouched,
    validateForm,
    getAllValidationErrors,
    resetForm,
  } = useAuthFormValidation("login");

  // Auto-save form data
  const {
    hasDraft,
    saving: autoSaving,
    initialized,
    getSavedData,
    clearDraft,
    markAsSubmitted,
  } = useAutoSave("login_form", {
    email: formData.email,
    rememberMe: formData.rememberMe || false,
  });

  const hasShownRestoreDialog = useRef(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    { field: string; label: string; message: string }[]
  >([]);

  // Load saved draft on component mount
  useEffect(() => {
    if (hasShownRestoreDialog.current) return;

    const savedData = getSavedData();
    if (savedData && hasDraft && initialized) {
      hasShownRestoreDialog.current = true;

      // Show alert asking if user wants to restore draft
      Alert.alert(
        "Restore Draft",
        "You have unsaved login data. Would you like to restore it?",
        [
          {
            text: "No",
            style: "cancel",
            onPress: () => {
              clearDraft();
            },
          },
          {
            text: "Yes",
            onPress: () => {
              if (savedData.email) {
                updateField("email", savedData.email);
              }
              if (savedData.rememberMe !== undefined) {
                updateField("rememberMe", savedData.rememberMe);
              }
            },
          },
        ]
      );
    }
  }, [hasDraft, getSavedData, clearDraft, updateField, initialized]);

  const handleSubmit = useCallback(async () => {
    try {
      // Simple validation - check if fields are empty
      const hasEmail = formData.email && formData.email.trim().length > 0;
      const hasPassword = formData.password && formData.password.length > 0;

      if (!hasEmail || !hasPassword) {
        const errors = [];
        if (!hasEmail) {
          errors.push({
            field: "email",
            label: "Email",
            message: "Email is required",
          });
        }
        if (!hasPassword) {
          errors.push({
            field: "password",
            label: "Password",
            message: "Password is required",
          });
        }

        setValidationErrors(errors);
        setShowValidationErrors(true);
        return;
      }

      // Clear validation errors if form is valid
      setShowValidationErrors(false);
      setValidationErrors([]);

      Keyboard.dismiss();

      await login(formData.email.trim(), formData.password);

      // Clear draft after successful login
      await markAsSubmitted();
    } catch (error: any) {
      // Handle specific error types
      let errorMessage = "Login failed. Please try again.";

      if (error.message?.includes("Invalid credentials")) {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message?.includes("Network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message?.includes("Rate limit")) {
        errorMessage =
          "Too many login attempts. Please wait a few minutes and try again.";
      }

      Alert.alert("Login Error", errorMessage);
    }
  }, [formData.email, formData.password, login, markAsSubmitted]);

  const navigateToSignup = useCallback(() => {
    navigation.navigate("Signup");
  }, [navigation]);

  const navigateToForgotPassword = useCallback(() => {
    Alert.alert(
      "Forgot Password",
      "Password reset functionality would be implemented here. In a real app, this would send a reset email."
    );
  }, []);

  const getValidationState = (fieldName: string) => {
    if (!touched[fieldName]) return "default";
    if (errors[fieldName]) return "invalid";
    // Check if field has content and no errors
    const fieldValue = formData[fieldName as keyof typeof formData];
    if (
      fieldValue &&
      typeof fieldValue === "string" &&
      fieldValue.trim().length > 0
    ) {
      return "valid";
    }
    return "default";
  };

  // Clear validation messages when user starts typing
  const handleFieldChange = useCallback(
    (fieldName: keyof typeof formData, value: any) => {
      updateField(fieldName, value);

      // Clear validation messages if they're showing
      if (showValidationErrors) {
        setShowValidationErrors(false);
        setValidationErrors([]);
      }
    },
    [updateField, showValidationErrors]
  );

  return (
    <View
      style={{
        flex: 1,
        padding: spacing.s16,
        justifyContent: "center",
        backgroundColor: c.background,
      }}
    >
      <AuthTitle>Welcome back</AuthTitle>

      {/* Auto-save indicator */}
      {autoSaving && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.s8,
          }}
        >
          <Text
            style={{
              color: c.muted,
              fontSize: typography.size.xs,
            }}
          >
            💾 Auto-saving...
          </Text>
        </View>
      )}

      <ValidationMessages
        errors={validationErrors}
        visible={showValidationErrors}
        onDismiss={() => setShowValidationErrors(false)}
      />

      <AuthTextInput
        label="Email Address"
        placeholder="Enter your email address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text) => handleFieldChange("email", text)}
        onBlur={() => setFieldTouched("email")}
        validationState={getValidationState("email")}
        showValidationIcon={touched.email}
        errorText={errors.email}
        accessibilityLabel="Email address"
        accessibilityHint="Enter your email address to log in"
      />

      <AuthTextInput
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
        autoComplete="password"
        value={formData.password}
        onChangeText={(text) => handleFieldChange("password", text)}
        onBlur={() => setFieldTouched("password")}
        validationState={getValidationState("password")}
        showValidationIcon={touched.password}
        errorText={errors.password}
        hint="Password must be at least 6 characters"
        accessibilityLabel="Password"
        accessibilityHint="Enter your password to log in"
      />

      <Pressable
        onPress={navigateToForgotPassword}
        style={{ marginBottom: spacing.s16 }}
        accessibilityRole="button"
        accessibilityLabel="Forgot password"
      >
        <Text
          style={{
            color: c.primary,
            fontSize: typography.size.sm,
            textAlign: "right",
          }}
        >
          Forgot password?
        </Text>
      </Pressable>

      <AuthToggle
        label="Remember me"
        description="Keep me logged in on this device"
        value={formData.rememberMe || false}
        onValueChange={(value) => handleFieldChange("rememberMe", value)}
      />

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: loading ? c.primaryAlt : c.primary,
          paddingVertical: spacing.s16,
          borderRadius: spacing.s12,
          alignItems: "center",
          marginBottom: spacing.s16,
          minHeight: 48,
        }}
        accessibilityRole="button"
        accessibilityLabel={loading ? "Signing in" : "Log in"}
        accessibilityState={{ disabled: loading }}
      >
        <Text
          style={{
            color: c.white,
            fontWeight: typography.weight.medium,
            fontSize: typography.size.md,
          }}
        >
          {loading ? "Signing in…" : "Log In"}
        </Text>
      </Pressable>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: c.text,
            fontSize: typography.size.sm,
          }}
        >
          Don't have an account?{" "}
        </Text>
        <Pressable
          onPress={navigateToSignup}
          accessibilityRole="button"
          accessibilityLabel="Create account"
        >
          <Text
            style={{
              color: c.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium,
            }}
          >
            Sign up
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
