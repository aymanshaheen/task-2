import React from "react";
import { TextInput, Text } from "react-native";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { useTheme } from "../../hooks/useTheme";

type Props = React.ComponentProps<typeof TextInput> & {
  invalid?: boolean;
  errorText?: string;
};

export function AuthTextInput({ invalid, errorText, style, ...rest }: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <>
      <TextInput
        {...rest}
        style={[
          {
            borderWidth: 1,
            borderColor: invalid ? c.danger : c.border,
            backgroundColor: c.surface,
            borderRadius: spacing.s12,
            padding: spacing.s12,
            marginBottom: spacing.s8,
          },
          style,
        ]}
      />
      {invalid && !!errorText && (
        <Text
          style={{
            color: c.danger,
            marginBottom: spacing.s8,
            fontSize: typography.size.xs,
          }}
        >
          {errorText}
        </Text>
      )}
    </>
  );
}
