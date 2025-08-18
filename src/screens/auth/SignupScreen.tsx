import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { AuthTitle } from "../../components/AuthTitle";
import { AuthTextInput } from "../../components/AuthTextInput";

export function SignupScreen({ navigation }: any) {
  const { signup, loading } = useAuth();
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ name: false, email: false });

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const nameValid = useMemo(() => name.trim().length >= 2, [name]);

  return (
    <View style={{ flex: 1, padding: spacing.s16, justifyContent: "center" }}>
      <AuthTitle>Create account</AuthTitle>
      <AuthTextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        onBlur={() => setTouched((s) => ({ ...s, name: true }))}
        invalid={touched.name && !nameValid}
        errorText="Name must be at least 2 characters"
      />
      <AuthTextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched((s) => ({ ...s, email: true }))}
        invalid={touched.email && !emailValid}
        errorText="Please enter a valid email address"
      />
      <AuthTextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ marginBottom: spacing.s12 }}
      />
      <Pressable
        onPress={() => signup(email, password)}
        disabled={loading || !emailValid || !nameValid || password.length === 0}
        style={{
          backgroundColor:
            loading || !emailValid || !nameValid || password.length === 0
              ? c.primaryAlt
              : c.primary,
          paddingVertical: spacing.s12,
          borderRadius: spacing.s12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: c.white, fontWeight: typography.weight.medium }}>
          {loading ? "Signing up…" : "Sign up"}
        </Text>
      </Pressable>
      <Text
        style={{ textAlign: "center", marginTop: spacing.s16 }}
        onPress={() => navigation.goBack()}
      >
        Already have an account? Login
      </Text>
    </View>
  );
}
