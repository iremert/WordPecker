import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { WordList } from "@/types";
import { ProgressBar } from "@/components/ProgressBar";
import { 
  BookOpen, 
  Brain, 
  ClipboardList, 
  Clock, 
  ChevronRight,
  CheckCircle,
} from "lucide-react-native";

interface WordListItemProps {
  list: WordList;
  onPress: () => void;
  onLearnPress?: () => void;
  onQuizPress?: () => void;
}

export const WordListItem: React.FC<WordListItemProps> = ({
  list,
  onPress,
  onLearnPress,
  onQuizPress,
}) => {
  const { colors } = useThemeStore();

  // Calculate mastery percentage
  const masteredWords = list.words ? list.words.filter((word) => word.mastered).length : 0;
  const totalWords = list.words ? list.words.length : 0;
  const masteryPercentage = totalWords > 0 ? masteredWords / totalWords : 0;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{list.title}</Text>
          {list.description && (
            <Text style={[styles.description, { color: colors.textLight }]} numberOfLines={1}>
              {list.description}
            </Text>
          )}
        </View>
        <ChevronRight size={20} color={colors.textLight} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ClipboardList size={16} color={colors.textLight} />
          <Text style={[styles.statText, { color: colors.textLight }]}>
            {totalWords} {totalWords === 1 ? "kelime" : "kelime"}
          </Text>
        </View>

        <View style={styles.statItem}>
          <CheckCircle size={16} color={colors.textLight} />
          <Text style={[styles.statText, { color: colors.textLight }]}>
            {masteredWords} öğrenildi
          </Text>
        </View>

        <View style={styles.statItem}>
          <Clock size={16} color={colors.textLight} />
          <Text style={[styles.statText, { color: colors.textLight }]}>
            Güncelleme: {formatDate(list.updatedAt)}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={[styles.progressLabel, { color: colors.textLight }]}>
          Öğrenme İlerlemesi:
        </Text>
        <ProgressBar
          progress={masteryPercentage}
          height={6}
          backgroundColor={colors.backgroundLight}
          progressColor={
            masteryPercentage >= 0.8
              ? colors.success
              : masteryPercentage >= 0.4
              ? colors.warning
              : colors.primary
          }
        />
        <Text style={[styles.progressPercentage, { color: colors.text }]}>
          {Math.round(masteryPercentage * 100)}%
        </Text>
      </View>

      {(onLearnPress || onQuizPress) && (
        <View style={styles.actionsContainer}>
          {onLearnPress && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
              onPress={onLearnPress}
            >
              <Brain size={18} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Öğren</Text>
            </TouchableOpacity>
          )}

          {onQuizPress && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.secondaryLight }]}
              onPress={onQuizPress}
            >
              <BookOpen size={18} color={colors.secondary} />
              <Text style={[styles.actionButtonText, { color: colors.secondary }]}>Sınav</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 12,
    marginRight: 8,
    width: 110,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
    width: 40,
    textAlign: "right",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});