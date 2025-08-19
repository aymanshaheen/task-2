import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  Keyboard,
  ScrollView,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { AuthTitle } from "../../components/auth/AuthTitle";
import { AuthTextInput } from "../../components/auth/AuthTextInput";

interface TouchedState {
  name: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function SignupScreen({ navigation }: any) {
  const { signup, loading } = useAuth();
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [touched, setTouched] = useState<TouchedState>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const nameValid = useMemo(() => {
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 50;
  }, [name]);

  const emailValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    return emailRegex.test(trimmedEmail) && trimmedEmail.length <= 254;
  }, [email]);

  const passwordStrength = useMemo((): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;

    let score = 0;
    let feedback: string[] = [];

    if (password.length === 0) {
      feedback.push("Enter a password");
    } else {
      if (!requirements.length) feedback.push("At least 8 characters");
      if (!requirements.uppercase) feedback.push("One uppercase letter");
      if (!requirements.lowercase) feedback.push("One lowercase letter");
      if (!requirements.number) feedback.push("One number");
      if (!requirements.special) feedback.push("One special character");

      score = Math.min(metRequirements, 4);
    }

    return { score, feedback, requirements };
  }, [password]);

  const passwordValid = useMemo(() => {
    return passwordStrength.score >= 4;
  }, [passwordStrength.score]);

  const confirmPasswordValid = useMemo(() => {
    return confirmPassword.length > 0 && password === confirmPassword;
  }, [password, confirmPassword]);

  const isFormValid = useMemo(() => {
    return (
      nameValid &&
      emailValid &&
      passwordValid &&
      confirmPasswordValid &&
      acceptedTerms &&
      name.trim().length > 0 &&
      email.trim().length > 0
    );
  }, [
    nameValid,
    emailValid,
    passwordValid,
    confirmPasswordValid,
    acceptedTerms,
    name,
    email,
  ]);

  const handleNameChange = useCallback(
    (text: string) => {
      setName(text);
      if (errors.name) {
        setErrors((prev) => ({ ...prev, name: undefined }));
      }
    },
    [errors.name]
  );

  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      if (errors.email) {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    },
    [errors.email]
  );

  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text);
      if (errors.password) {
        setErrors((prev) => ({ ...prev, password: undefined }));
      }
    },
    [errors.password]
  );

  const handleConfirmPasswordChange = useCallback(
    (text: string) => {
      setConfirmPassword(text);
      if (errors.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    },
    [errors.confirmPassword]
  );

  const handleNameBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, name: true }));
    if (!nameValid && name.length > 0) {
      setErrors((prev) => ({
        ...prev,
        name:
          name.trim().length < 2
            ? "Name must be at least 2 characters"
            : "Name must be less than 50 characters",
      }));
    }
  }, [nameValid, name]);

  const handleEmailBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, email: true }));
    if (!emailValid && email.length > 0) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
    }
  }, [emailValid, email.length]);

  const handlePasswordBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, password: true }));
  }, []);

  const handleConfirmPasswordBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, confirmPassword: true }));
    if (!confirmPasswordValid && confirmPassword.length > 0) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    }
  }, [confirmPasswordValid, confirmPassword.length]);

  const handleSubmit = useCallback(async () => {
    try {
      setErrors({});

      if (!isFormValid) {
        Alert.alert(
          "Incomplete Form",
          "Please fill in all required fields and accept the terms of service."
        );
        return;
      }

      Keyboard.dismiss();

      await signup(email.trim(), password, name.trim());
    } catch (error: any) {
      if (error.message?.includes("Email already exists")) {
        setErrors({
          email:
            "An account with this email already exists. Try logging in instead.",
        });
      } else if (error.message?.includes("weak password")) {
        setErrors({
          password: "Password is too weak. Please choose a stronger password.",
        });
      } else if (error.message?.includes("Network")) {
        setErrors({
          general: "Network error. Please check your connection and try again.",
        });
      } else {
        setErrors({
          general: "Registration failed. Please try again or contact support.",
        });
      }
    }
  }, [isFormValid, email, password, name, signup]);

  const navigateToLogin = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const showTermsOfService = useCallback(() => {
    Alert.alert(
      "Terms of Service",
      "In a real app, this would show the full terms of service. Users should always read and understand the terms before agreeing."
    );
  }, []);

  const renderPasswordStrength = () => {
    if (password.length === 0) return null;

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

      {errors.general && (
        <View
          style={{
            backgroundColor: c.dangerBg,
            padding: spacing.s12,
            borderRadius: spacing.s8,
            marginBottom: spacing.s16,
          }}
        >
          <Text
            style={{
              color: c.dangerText,
              fontSize: typography.size.sm,
              textAlign: "center",
            }}
          >
            {errors.general}
          </Text>
        </View>
      )}

      <AuthTextInput
        placeholder="Full name"
        autoCapitalize="words"
        autoComplete="name"
        autoCorrect={false}
        value={name}
        onChangeText={handleNameChange}
        onBlur={handleNameBlur}
        invalid={touched.name && !nameValid}
        errorText={
          errors.name ||
          (touched.name && !nameValid
            ? "Name must be 2-50 characters"
            : undefined)
        }
        accessibilityLabel="Full name"
        accessibilityHint="Enter your full name for account creation"
      />

      <AuthTextInput
        placeholder="Email address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={handleEmailChange}
        onBlur={handleEmailBlur}
        invalid={touched.email && !emailValid}
        errorText={
          errors.email ||
          (touched.email && !emailValid
            ? "Please enter a valid email address"
            : undefined)
        }
        accessibilityLabel="Email address"
        accessibilityHint="Enter your email address for account creation"
      />

      <AuthTextInput
        placeholder="Password"
        secureTextEntry
        autoComplete="password-new"
        value={password}
        onChangeText={handlePasswordChange}
        onBlur={handlePasswordBlur}
        invalid={touched.password && !passwordValid}
        errorText={errors.password}
        accessibilityLabel="Password"
        accessibilityHint="Create a strong password with at least 8 characters"
      />

      {renderPasswordStrength()}

      <AuthTextInput
        placeholder="Confirm password"
        secureTextEntry
        autoComplete="password-new"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        onBlur={handleConfirmPasswordBlur}
        invalid={touched.confirmPassword && !confirmPasswordValid}
        errorText={
          errors.confirmPassword ||
          (touched.confirmPassword && !confirmPasswordValid
            ? "Passwords do not match"
            : undefined)
        }
        style={{ marginBottom: spacing.s16 }}
        accessibilityLabel="Confirm password"
        accessibilityHint="Re-enter your password to confirm"
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: spacing.s20,
        }}
      >
        <Pressable
          onPress={() => setAcceptedTerms(!acceptedTerms)}
          style={{
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: acceptedTerms ? c.primary : c.border,
            borderRadius: 4,
            marginRight: spacing.s12,
            marginTop: 2,
            backgroundColor: acceptedTerms ? c.primary : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
          accessibilityLabel="Accept terms of service"
        >
          {acceptedTerms && (
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
        disabled={loading || !isFormValid}
        style={{
          backgroundColor: loading || !isFormValid ? c.primaryAlt : c.primary,
          paddingVertical: spacing.s16,
          borderRadius: spacing.s12,
          alignItems: "center",
          marginBottom: spacing.s16,
          minHeight: 48,
        }}
        accessibilityRole="button"
        accessibilityLabel={loading ? "Creating account" : "Create account"}
        accessibilityState={{ disabled: loading || !isFormValid }}
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
