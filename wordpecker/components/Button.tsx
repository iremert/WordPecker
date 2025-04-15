import React, { useRef, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { useThemeStore } from "@/store/themeStore";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  animated?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = "left",
  animated = false,
}) => {
  const { colors } = useThemeStore();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Start subtle rotation animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 0.02,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -0.02,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    }
  }, [animated]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};

    switch (variant) {
      case "primary":
        buttonStyle = {
          backgroundColor: colors.primary,
        };
        break;
      case "secondary":
        buttonStyle = {
          backgroundColor: colors.secondary,
        };
        break;
      case "outline":
        buttonStyle = {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.primary,
        };
        break;
      case "text":
        buttonStyle = {
          backgroundColor: "transparent",
        };
        break;
    }

    if (disabled) {
      buttonStyle.opacity = 0.5;
    }

    return buttonStyle;
  };

  const getTextStyle = () => {
    let color = "white";

    switch (variant) {
      case "outline":
      case "text":
        color = colors.primary;
        break;
    }

    let fontSize = 16;
    switch (size) {
      case "small":
        fontSize = 14;
        break;
      case "large":
        fontSize = 18;
        break;
    }

    return {
      color,
      fontSize,
    };
  };

  const getButtonSizeStyle = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
        };
      case "medium":
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
        };
      case "large":
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 16,
        };
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-1deg", "1deg"],
  });

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        {
          transform: [
            { scale: scaleAnim },
            ...(animated ? [{ rotate }] : []),
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          getButtonSizeStyle(),
          getButtonStyle(),
          fullWidth && styles.fullWidth,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "outline" || variant === "text" ? colors.primary : "white"}
            size="small"
          />
        ) : (
          <View style={styles.contentContainer}>
            {icon && iconPosition === "left" && <View style={styles.iconLeft}>{icon}</View>}
            <Text
              style={[
                styles.text,
                getTextStyle(),
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === "right" && <View style={styles.iconRight}>{icon}</View>}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});