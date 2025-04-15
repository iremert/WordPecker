import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface ProgressBarProps {
  progress: number;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = "#E5E7EB",
  progressColor = "#6366F1",
  style,
}) => {
  // Ensure progress is between 0 and 1
  const normalizedProgress = progress > 1 ? progress / 100 : progress;
  const clampedProgress = Math.min(Math.max(normalizedProgress, 0), 1);

  return (
    <View
      style={[
        styles.container,
        { height, backgroundColor },
        style,
      ]}
    >
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: progressColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 4,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
  },
});