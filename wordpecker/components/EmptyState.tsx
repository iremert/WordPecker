import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { Plus, BookOpen, Brain, Search } from "lucide-react-native";

interface EmptyStateProps {
  type?: "lists" | "words" | "search" | "learning";
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = "lists",
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { colors } = useThemeStore();

  // Default content based on type
  let defaultIcon;
  let defaultTitle;
  let defaultDescription;
  let defaultActionLabel;

  switch (type) {
    case "lists":
      defaultIcon = <BookOpen size={64} color={colors.textLight} />;
      defaultTitle = "Henüz Kelime Listeniz Yok";
      defaultDescription = "Yeni bir kelime listesi oluşturarak dil öğrenmeye başlayın";
      defaultActionLabel = "Liste Oluştur";
      break;
    case "words":
      defaultIcon = <Plus size={64} color={colors.textLight} />;
      defaultTitle = "Bu Listede Kelime Yok";
      defaultDescription = "Öğrenmek istediğiniz kelimeleri ekleyin";
      defaultActionLabel = "Kelime Ekle";
      break;
    case "search":
      defaultIcon = <Search size={64} color={colors.textLight} />;
      defaultTitle = "Sonuç Bulunamadı";
      defaultDescription = "Arama kriterlerinize uygun sonuç bulunamadı";
      defaultActionLabel = "Filtreleri Temizle";
      break;
    case "learning":
      defaultIcon = <Brain size={64} color={colors.textLight} />;
      defaultTitle = "Öğrenilecek Kelime Yok";
      defaultDescription = "Bu listede öğrenilecek kelime kalmadı";
      defaultActionLabel = "Listeye Dön";
      break;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundLight }]}>
      <View style={styles.iconContainer}>{icon || defaultIcon}</View>
      <Text style={[styles.title, { color: colors.text }]}>
        {title || defaultTitle}
      </Text>
      <Text style={[styles.description, { color: colors.textLight }]}>
        {description || defaultDescription}
      </Text>
      {onAction && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onAction}
        >
          <Text style={styles.buttonText}>{actionLabel || defaultActionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});