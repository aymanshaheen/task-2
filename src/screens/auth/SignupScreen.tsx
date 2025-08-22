import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  Keyboard,
  ScrollView,
} from "react-native";

import { AuthTextInput } from "../../components/auth/AuthTextInput";
import { AuthTitle } from "../../components/auth/AuthTitle";
import { AuthToggle } from "../../components/auth/AuthToggle";
import { ValidationMessages } from "../../components/auth/ValidationMessages";
import { useAuth } from "../../hooks/useAuth";
import {
  useAuthFormValidation,
  fieldConfigs,
} from "../../hooks/useAuthFormValidation";
import { useAutoSave } from "../../hooks/useAutoSave";
import { useTheme } from "../../hooks/useTheme";
import { cameraService } from "../../services/cameraService";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

export function SignupScreen({ navigation }: any) {
  const { signup, loading } = useAuth();
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  const {
    formData,
    errors,
    touched,
    visibleFields,
    passwordStrength,
    updateField,
    setFieldTouched,
  } = useAuthFormValidation("signup");

  // Auto-save form data
  const {
    hasDraft,
    saving: autoSaving,
    initialized,
    getSavedData,
    clearDraft,
    markAsSubmitted,
  } = useAutoSave("signup_form", formData);

  const hasShownRestoreDialog = useRef(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    { field: string; label: string; message: string }[]
  >([]);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  // Load saved draft on component mount
  useEffect(() => {
    if (hasShownRestoreDialog.current) return;

    const savedData = getSavedData();
    if (savedData && hasDraft && initialized) {
      hasShownRestoreDialog.current = true;

      Alert.alert(
        "Restore Draft",
        "You have unsaved registration data. Would you like to restore it?",
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
              Object.keys(savedData).forEach((key) => {
                const fieldKey = key as keyof typeof savedData;
                if (
                  savedData[fieldKey] !== undefined &&
                  savedData[fieldKey] !== null
                ) {
                  updateField(fieldKey, savedData[fieldKey]);
                }
              });
            },
          },
        ]
      );
    }
  }, [hasDraft, getSavedData, clearDraft, updateField, initialized]);

  const handleSubmit = useCallback(async () => {
    try {
      // Simple validation - check required fields
      const hasName = formData.name && formData.name.trim().length > 0;
      const hasEmail = formData.email && formData.email.trim().length > 0;
      const hasPassword = formData.password && formData.password.length > 0;
      const hasConfirmPassword =
        formData.confirmPassword && formData.confirmPassword.length > 0;
      const passwordsMatch = formData.password === formData.confirmPassword;
      const hasAcceptedTerms = formData.acceptedTerms;

      if (
        !hasName ||
        !hasEmail ||
        !hasPassword ||
        !hasConfirmPassword ||
        !passwordsMatch ||
        !hasAcceptedTerms
      ) {
        const errors = [];

        if (!hasName) {
          errors.push({
            field: "name",
            label: "Full Name",
            message: "Full name is required",
          });
        }
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
        if (!hasConfirmPassword) {
          errors.push({
            field: "confirmPassword",
            label: "Confirm Password",
            message: "Please confirm your password",
          });
        }
        if (hasPassword && hasConfirmPassword && !passwordsMatch) {
          errors.push({
            field: "confirmPassword",
            label: "Confirm Password",
            message: "Passwords do not match",
          });
        }
        if (!hasAcceptedTerms) {
          errors.push({
            field: "acceptedTerms",
            label: "Terms of Service",
            message: "You must accept the terms of service",
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

      await signup(
        formData.email.trim(),
        formData.password,
        formData.name?.trim() || "",
        profileImageUri
      );

      // Clear draft after successful signup
      await markAsSubmitted();

      // Go to profile setup
      navigation.reset({ index: 0, routes: [{ name: "ProfileSetup" }] });
    } catch (error: any) {
      let errorMessage = "Registration failed. Please try again.";

      if (error.message?.includes("Email already exists")) {
        errorMessage =
          "An account with this email already exists. Try logging in instead.";
      } else if (error.message?.includes("weak password")) {
        errorMessage =
          "Password is too weak. Please choose a stronger password.";
      } else if (error.message?.includes("Network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      Alert.alert("Registration Error", errorMessage);
    }
  }, [
    formData.email,
    formData.password,
    formData.name,
    formData.confirmPassword,
    formData.acceptedTerms,
    signup,
    markAsSubmitted,
    profileImageUri,
  ]);

  const handlePickPhoto = useCallback(async () => {
    try {
      const picked = await cameraService.pickImage({
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (picked?.uri) {
        setProfileImageUri(picked.uri);
      }
    } catch (e) {
      Alert.alert("Photo Error", "Failed to pick image. Please try again.");
    }
  }, []);

  const handleOpenCamera = useCallback(async () => {
    try {
      const captured = await cameraService.takePhoto({
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (captured?.uri) {
        setProfileImageUri(captured.uri);
      } else {
        Alert.alert(
          "Camera Unavailable",
          "The camera did not open. If you're on a simulator, try a real device or enable a virtual camera."
        );
      }
    } catch (e) {
      Alert.alert(
        "Camera Error",
        "Unable to open the camera. This can happen on simulators or when no camera app is available."
      );
    }
  }, []);

  const navigateToLogin = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const showTermsOfService = useCallback(() => {
    Alert.alert(
      "Terms of Service",
      "In a real app, this would show the full terms of service. Users should always read and understand the terms before agreeing."
    );
  }, []);

  const getValidationState = (fieldName: string) => {
    if (!touched[fieldName]) return "default";
    if (errors[fieldName]) return "invalid";
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

  const renderPasswordStrength = () => {
    if (!formData.password || formData.password.length === 0) return null;

    const strengthColors = [
      "#ff4444",
      "#ff8800",
      "#ffaa00",
      "#88aa00",
      "#44aa44",
    ];
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

    return (
      <View style={{ marginTop: spacing.s8, marginBottom: spacing.s8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: spacing.s4,
          }}
        >
          <Text
            style={{
              fontSize: typography.size.xs,
              color: c.text,
              marginRight: spacing.s8,
            }}
          >
            Password strength:
          </Text>
          <Text
            style={{
              fontSize: typography.size.xs,
              color: strengthColors[passwordStrength.score],
              fontWeight: typography.weight.medium,
            }}
          >
            {strengthLabels[passwordStrength.score]}
          </Text>
        </View>

        <View
          style={{
            height: 4,
            backgroundColor: c.border,
            borderRadius: 2,
            marginBottom: spacing.s4,
          }}
        >
          <View
            style={{
              height: 4,
              backgroundColor: strengthColors[passwordStrength.score],
              borderRadius: 2,
              width: `${(passwordStrength.score / 4) * 100}%`,
            }}
          />
        </View>

        {passwordStrength.feedback.length > 0 && (
          <View>
            {passwordStrength.feedback.map((item, index) => (
              <Text
                key={index}
                style={{
                  fontSize: typography.size.xs,
                  color: c.muted,
                  marginBottom: 2,
                }}
              >
                • {item}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderField = (fieldName: string) => {
    const config = fieldConfigs[fieldName];
    if (!config) return null;

    const fieldValue = formData[fieldName as keyof typeof formData];

    return (
      <AuthTextInput
        key={fieldName}
        label={config.label}
        placeholder={config.placeholder}
        value={(fieldValue as string) || ""}
        onChangeText={(text) =>
          handleFieldChange(fieldName as keyof typeof formData, text)
        }
        onBlur={() => setFieldTouched(fieldName)}
        validationState={getValidationState(fieldName)}
        showValidationIcon={touched[fieldName]}
        errorText={errors[fieldName]}
        hint={config.hint}
        secureTextEntry={config.type === "password"}
        autoCapitalize={config.type === "email" ? "none" : "words"}
        autoComplete={
          fieldName === "email"
            ? "email"
            : fieldName === "password"
            ? "password-new"
            : fieldName === "confirmPassword"
            ? "password-new"
            : undefined
        }
        autoCorrect={config.type !== "email"}
        keyboardType={
          config.type === "email"
            ? "email-address"
            : config.type === "phone"
            ? "phone-pad"
            : "default"
        }
      />
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        flexGrow: 1,
        padding: spacing.s16,
        justifyContent: "center",
      }}
      keyboardShouldPersistTaps="handled"
    >
      <AuthTitle>Create your account</AuthTitle>

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

      {/* Render base form fields */}
      {visibleFields.slice(0, 4).map((fieldName) => renderField(fieldName))}

      {/* Profile Photo Picker */}
      <View style={{ marginBottom: spacing.s16 }}>
        <Text
          style={{
            fontSize: typography.size.md,
            fontWeight: typography.weight.medium,
            color: c.text,
            marginBottom: spacing.s8,
          }}
        >
          Optional: Profile Photo
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.s12 }}>
          <Pressable
            onPress={handlePickPhoto}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.surface,
              borderRadius: spacing.s12,
              padding: spacing.s12,
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48,
            }}
            accessibilityRole="button"
            accessibilityLabel="Pick profile photo from gallery"
          >
            <Text
              style={{
                color: c.text,
                fontSize: typography.size.sm,
              }}
            >
              {profileImageUri ? "Change Photo" : "Choose from Gallery"}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleOpenCamera}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.surface,
              borderRadius: spacing.s12,
              padding: spacing.s12,
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48,
            }}
            accessibilityRole="button"
            accessibilityLabel="Open camera to take profile photo"
          >
            <Text
              style={{
                color: c.text,
                fontSize: typography.size.sm,
              }}
            >
              Open Camera
            </Text>
          </Pressable>
        </View>
        {profileImageUri && (
          <Text
            style={{
              color: c.muted,
              fontSize: typography.size.xs,
              marginTop: spacing.s4,
            }}
            numberOfLines={1}
          >
            Selected: {profileImageUri}
          </Text>
        )}
      </View>

      {/* Password strength indicator */}
      {formData.password && renderPasswordStrength()}

      {/* Security Options Section */}
      <View style={{ marginBottom: spacing.s16 }}>
        <Text
          style={{
            fontSize: typography.size.md,
            fontWeight: typography.weight.medium,
            color: c.text,
            marginBottom: spacing.s12,
          }}
        >
          Security Options
        </Text>

        <AuthToggle
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          value={formData.enable2FA || false}
          onValueChange={(value) => handleFieldChange("enable2FA", value)}
        />

        {formData.enable2FA && renderField("phoneNumber")}

        <AuthToggle
          label="Security Questions"
          description="Set up recovery questions for your account"
          value={formData.enableSecurityQuestions || false}
          onValueChange={(value) =>
            handleFieldChange("enableSecurityQuestions", value)
          }
        />

        {formData.enableSecurityQuestions && (
          <>
            {renderField("securityQuestion1")}
            {renderField("securityAnswer1")}
            {renderField("securityQuestion2")}
            {renderField("securityAnswer2")}
          </>
        )}
      </View>

      {/* Terms Agreement */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: spacing.s20,
        }}
      >
        <Pressable
          onPress={() =>
            handleFieldChange("acceptedTerms", !formData.acceptedTerms)
          }
          style={{
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: formData.acceptedTerms ? c.primary : c.border,
            borderRadius: 4,
            marginRight: spacing.s12,
            marginTop: 2,
            backgroundColor: formData.acceptedTerms ? c.primary : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: formData.acceptedTerms }}
          accessibilityLabel="Accept terms of service"
        >
          {formData.acceptedTerms && (
            <Text style={{ color: c.white, fontSize: 12 }}>✓</Text>
          )}
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: c.text,
              fontSize: typography.size.sm,
              lineHeight: 20,
            }}
          >
            I agree to the{" "}
            <Text
              style={{ color: c.primary, textDecorationLine: "underline" }}
              onPress={showTermsOfService}
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text
              style={{ color: c.primary, textDecorationLine: "underline" }}
              onPress={showTermsOfService}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>

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
        accessibilityLabel={loading ? "Creating account" : "Create account"}
        accessibilityState={{ disabled: loading }}
      >
        <Text
          style={{
            color: c.white,
            fontWeight: typography.weight.medium,
            fontSize: typography.size.md,
          }}
        >
          {loading ? "Creating account…" : "Create Account"}
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
          Already have an account?{" "}
        </Text>
        <Pressable
          onPress={navigateToLogin}
          accessibilityRole="button"
          accessibilityLabel="Go to login"
        >
          <Text
            style={{
              color: c.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium,
            }}
          >
            Log in
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
