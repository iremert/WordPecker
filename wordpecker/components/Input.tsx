import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { useLanguage } from "@/components/LanguageProvider";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  colors?: any;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  colors: propColors,
  icon,
  ...props
}) => {
  const { colors: themeColors } = useThemeStore();
  const { t } = useLanguage();
  
  // Use provided colors or fall back to theme colors
  const colors = propColors || themeColors;

  // Translate the label if it's a translation key
  const translatedLabel = t(label) !== label ? t(label) : label;
  
  // Translate the placeholder if it's a translation key and exists
  const translatedPlaceholder = props.placeholder && t(props.placeholder) !== props.placeholder 
    ? t(props.placeholder) 
    : props.placeholder;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{translatedLabel}</Text>
      <View style={[
        styles.inputContainer,
        {
          borderColor: error ? colors.error : colors.border,
          backgroundColor: colors.backgroundLight,
        },
        props.multiline && styles.multilineInputContainer,
      ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
            },
            props.multiline && styles.multilineInput,
            style,
          ]}
          placeholderTextColor={colors.textLight}
          placeholder={translatedPlaceholder}
          {...props}
        />
      </View>
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  iconContainer: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  multilineInputContainer: {
    minHeight: 100,
  },
  multilineInput: {
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});