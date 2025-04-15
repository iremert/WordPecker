import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useLanguage } from "@/components/LanguageProvider";
import { useThemeStore } from "@/store/themeStore";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  colors?: any;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  colors: propColors,
}) => {
  const router = useRouter();
  const { t } = useLanguage();
  const { colors: themeColors } = useThemeStore();
  
  // Use provided colors or fall back to theme colors
  const colors = propColors || themeColors;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // Translate the title if it's a translation key
  const translatedTitle = t(title) !== title ? t(title) : title;

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.cardLight }]}
            onPress={handleBackPress}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{translatedTitle}</Text>

      <View style={styles.rightContainer}>
        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftContainer: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  rightContainer: {
    width: 40,
    alignItems: "flex-end",
  },
  placeholder: {
    width: 40,
  },
});