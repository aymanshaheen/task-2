import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { AuthTitle } from "../../components/AuthTitle";
import { AuthTextInput } from "../../components/AuthTextInput";

export function LoginScreen({ navigation }: any) {
  const { login, loading } = useAuth();
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false });

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  return (
    <View style={{ flex: 1, padding: spacing.s16, justifyContent: "center" }}>
      <AuthTitle>Welcome back</AuthTitle>
      <AuthTextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={(t) => setEmail(t)}
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
        onPress={() => login(email, password)}
        disabled={loading || !emailValid || password.length === 0}
        style={{
          backgroundColor:
            loading || !emailValid || password.length === 0
              ? c.primaryAlt
              : c.primary,
          paddingVertical: spacing.s12,
          borderRadius: spacing.s12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: c.white, fontWeight: typography.weight.medium }}>
          {loading ? "Signing in…" : "Login"}
        </Text>
      </Pressable>
      <Text
        style={{ textAlign: "center", marginTop: spacing.s16 }}
        onPress={() => navigation.navigate("Signup")}
      >
        Create an account
      </Text>
    </View>
  );
}
