import React, { useMemo, useState, useCallback } from "react";
import { View, Text, Pressable, Alert, Keyboard } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { AuthTitle } from "../../components/auth/AuthTitle";
import { AuthTextInput } from "../../components/auth/AuthTextInput";

interface TouchedState {
  email: boolean;
  password: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginScreen({ navigation }: any) {
  const { login, loading } = useAuth();
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<TouchedState>({
    email: false,
    password: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState(false);

  const emailValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, [email]);

  const passwordValid = useMemo(() => {
    return password.length >= 6;
  }, [password]);

  const isFormValid = useMemo(() => {
    return (
      emailValid &&
      passwordValid &&
      email.trim().length > 0 &&
      password.length > 0
    );
  }, [emailValid, passwordValid, email, password]);

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

    if (!passwordValid && password.length > 0) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 6 characters",
      }));
    }
  }, [passwordValid, password.length]);

  const handleSubmit = useCallback(async () => {
    try {
      setErrors({});

      if (!isFormValid) {
        Alert.alert(
          "Invalid Form",
          "Please check your email and password and try again."
        );
        return;
      }

      Keyboard.dismiss();

      await login(email.trim(), password);
    } catch (error: any) {
      if (error.message?.includes("Invalid credentials")) {
        setErrors({
          general:
            "Invalid email or password. Please check your credentials and try again.",
        });
      } else if (error.message?.includes("Network")) {
        setErrors({
          general: "Network error. Please check your connection and try again.",
        });
      } else if (error.message?.includes("Rate limit")) {
        setErrors({
          general:
            "Too many login attempts. Please wait a few minutes and try again.",
        });
      } else {
        setErrors({
          general:
            "Login failed. Please try again or contact support if the problem persists.",
        });
      }
    }
  }, [isFormValid, email, password, login]);

  const navigateToSignup = useCallback(() => {
    navigation.navigate("Signup");
  }, [navigation]);

  const navigateToForgotPassword = useCallback(() => {
    Alert.alert(
      "Forgot Password",
      "Password reset functionality would be implemented here. In a real app, this would send a reset email."
    );
  }, []);

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
        accessibilityHint="Enter your email address to log in"
      />

      <AuthTextInput
        placeholder="Password"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={handlePasswordChange}
        onBlur={handlePasswordBlur}
        invalid={touched.password && !passwordValid}
        errorText={
          errors.password ||
          (touched.password && !passwordValid
            ? "Password must be at least 6 characters"
            : undefined)
        }
        style={{ marginBottom: spacing.s8 }}
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

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: spacing.s20,
        }}
      >
        <Pressable
          onPress={() => setRememberMe(!rememberMe)}
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe }}
          accessibilityLabel="Remember me"
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderWidth: 2,
              borderColor: c.primary,
              borderRadius: 4,
              marginRight: spacing.s8,
              backgroundColor: rememberMe ? c.primary : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {rememberMe && (
              <Text style={{ color: c.white, fontSize: 12 }}>✓</Text>
            )}
          </View>
          <Text
            style={{
              color: c.text,
              fontSize: typography.size.sm,
            }}
          >
            Remember me
          </Text>
        </Pressable>
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
        accessibilityLabel={loading ? "Signing in" : "Log in"}
        accessibilityState={{ disabled: loading || !isFormValid }}
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
