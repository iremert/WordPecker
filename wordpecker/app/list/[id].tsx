import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWordListStore } from "@/store/wordListStore";
import { useThemeStore } from "@/store/themeStore";
import { useLanguage } from "@/components/LanguageProvider";
import { WordCard } from "@/components/WordCard";
import { ProgressBar } from "@/components/ProgressBar";
import { EmptyState } from "@/components/EmptyState";
import {
  ArrowLeft,
  Plus,
  Play,
  Edit,
  Trash2,
  Search,
  SortAsc,
  Check,
  BookOpen,
  Brain,
} from "lucide-react-native";
import { Word, WordList } from "@/types";

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeStore();
  const { t } = useLanguage();
  const {
    lists,
    getListById,
    deleteList,
    isLoading,
    error,
    setCurrentList
  } = useWordListStore();

  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortOption, setSortOption] = useState<string>("default");
  const [localList, setLocalList] = useState<WordList | null>(null);

  useEffect(() => {
    if (id) {
      const fetchList = async () => {
        try {
          const list = await getListById(id);
          if (list) {
            setCurrentList(list);
            setLocalList(list);
          } else {
            console.error("List not found:", id);
            Alert.alert("Hata", "Liste bulunamadı.");
          }
        } catch (error) {
          console.error("Error fetching list:", error);
          Alert.alert("Hata", "Liste yüklenirken bir hata oluştu.");
        }
      };
      
      fetchList();
    }
  }, [id, getListById]);

  // Update local list when currentList changes
  useEffect(() => {
    if (lists && lists.length > 0 && id) {
      const foundList = lists.find(list => list.id === id);
      if (foundList) {
        setLocalList(foundList);
      }
    }
  }, [lists, id]);

  const handleAddWord = () => {
    router.push({
      pathname: "/word/add",
      params: { listId: id },
    });
  };

  const handleStartLearning = () => {
    if (localList && localList.words && localList.words.length > 0) {
      router.push(`/learning/${id}`);
    } else {
      Alert.alert(
        "Kelime Yok",
        "Öğrenmeye başlamadan önce bu listeye bazı kelimeler ekleyin."
      );
    }
  };

  const handleStartQuiz = () => {
    if (localList && localList.words && localList.words.length > 0) {
      router.push(`/quiz/${id}`);
    } else {
      Alert.alert(
        "Kelime Yok",
        "Sınava başlamadan önce bu listeye bazı kelimeler ekleyin."
      );
    }
  };

  const handleDeleteList = () => {
    Alert.alert(
      "Listeyi Sil",
      "Bu listeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            if (id) {
              await deleteList(id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleEditList = () => {
    // Navigate to edit list screen
    // router.push(`/list/edit/${id}`);
    Alert.alert("Listeyi Düzenle", "Bu özellik yakında gelecek!");
  };

  const toggleSortMenu = () => {
    setSortMenuVisible(!sortMenuVisible);
  };

  const handleSort = (option: string) => {
    setSortOption(option);
    setSortMenuVisible(false);
  };

  const getSortedWords = (): Word[] => {
    if (!localList || !localList.words) return [];

    const words = [...localList.words];

    switch (sortOption) {
      case "alphabetical":
        return words.sort((a, b) => a.sourceWord.localeCompare(b.sourceWord));
      case "alphabeticalReverse":
        return words.sort((a, b) => b.sourceWord.localeCompare(a.sourceWord));
      case "difficulty":
        return words.sort((a, b) => {
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (
            difficultyOrder[a.difficulty as keyof typeof difficultyOrder] -
            difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
          );
        });
      case "difficultyReverse":
        return words.sort((a, b) => {
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (
            difficultyOrder[b.difficulty as keyof typeof difficultyOrder] -
            difficultyOrder[a.difficulty as keyof typeof difficultyOrder]
          );
        });
      case "mastery":
        return words.sort((a, b) => (b.mastered ? 1 : 0) - (a.mastered ? 1 : 0));
      case "notMastered":
        return words.sort((a, b) => (a.mastered ? 1 : 0) - (b.mastered ? 1 : 0));
      default:
        return words;
    }
  };

  const calculateProgress = (): number => {
    if (!localList || !localList.words || localList.words.length === 0) return 0;
    
    const masteredCount = localList.words.filter(word => word.mastered).length;
    return (masteredCount / localList.words.length) * 100;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Liste yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!localList) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Liste bulunamadı
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = calculateProgress();
  const sortedWords = getSortedWords();
  const wordCount = localList.words ? localList.words.length : 0;
  const masteredCount = localList.words ? localList.words.filter(word => word.mastered).length : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backIconButton, { backgroundColor: colors.cardLight }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {localList.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textLight }]}>
            {localList.fromLanguage} → {localList.toLanguage}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.cardLight }]}
            onPress={toggleSortMenu}
          >
            <SortAsc size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.cardLight }]}
            onPress={handleEditList}
          >
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.cardLight }]}
            onPress={handleDeleteList}
          >
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {sortMenuVisible && (
        <View style={[styles.sortMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortOption === "default" && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => handleSort("default")}
          >
            <Text style={[styles.sortOptionText, { color: colors.text }]}>Varsayılan</Text>
            {sortOption === "default" && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortOption === "alphabetical" && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => handleSort("alphabetical")}
          >
            <Text style={[styles.sortOptionText, { color: colors.text }]}>A-Z</Text>
            {sortOption === "alphabetical" && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortOption === "alphabeticalReverse" && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => handleSort("alphabeticalReverse")}
          >
            <Text style={[styles.sortOptionText, { color: colors.text }]}>Z-A</Text>
            {sortOption === "alphabeticalReverse" && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortOption === "difficulty" && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => handleSort("difficulty")}
          >
            <Text style={[styles.sortOptionText, { color: colors.text }]}>En Kolay İlk</Text>
            {sortOption === "difficulty" && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortOption === "difficultyReverse" && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => handleSort("difficultyReverse")}
          >
            <Text style={[styles.sortOptionText, { color: colors.text }]}>En Zor İlk</Text>
            {sortOption === "difficultyReverse" && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortOption === "mastery" && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => handleSort("mastery")}
          >
            <Text style={[styles.sortOptionText, { color: colors.text }]}>Öğrenilenler İlk</Text>
            {sortOption === "mastery" && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortOption === "notMastered" && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => handleSort("notMastered")}
          >
            <Text style={[styles.sortOptionText, { color: colors.text }]}>Öğrenilmeyenler İlk</Text>
            {sortOption === "notMastered" && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>İlerleme</Text>
          <Text style={[styles.progressPercentage, { color: colors.primary }]}>
            {Math.round(progress)}%
          </Text>
        </View>
        <ProgressBar progress={progress} />
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={[styles.progressStatValue, { color: colors.text }]}>
              {masteredCount}
            </Text>
            <Text style={[styles.progressStatLabel, { color: colors.textLight }]}>
              Öğrenilen
            </Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={[styles.progressStatValue, { color: colors.text }]}>
              {wordCount}
            </Text>
            <Text style={[styles.progressStatLabel, { color: colors.textLight }]}>
              Toplam Kelime
            </Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={[styles.progressStatValue, { color: colors.text }]}>
              {wordCount - masteredCount}
            </Text>
            <Text style={[styles.progressStatLabel, { color: colors.textLight }]}>
              Kalan
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleStartLearning}
        >
          <BookOpen size={20} color="white" />
          <Text style={styles.actionButtonText}>Öğren</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          onPress={handleStartQuiz}
        >
          <Brain size={20} color="white" />
          <Text style={styles.actionButtonText}>Sınav</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={handleAddWord}
        >
          <Plus size={20} color="white" />
          <Text style={styles.actionButtonText}>Kelime Ekle</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Kelimeler ({wordCount})
      </Text>

      {!localList.words || localList.words.length === 0 ? (
        <EmptyState
          icon={<Plus size={40} color={colors.textLight} />}
          title="Henüz Kelime Yok"
          description="Öğrenmeye başlamak için ilk kelimeni ekle"
          actionLabel="Kelime Ekle"
          onAction={handleAddWord}
        />
      ) : (
        <ScrollView style={styles.wordsList} showsVerticalScrollIndicator={false}>
          {sortedWords.map((word, index) => (
            <View 
              key={word.id || index}
              style={[styles.wordItem, { backgroundColor: colors.cardLight, borderColor: colors.border }]}
            >
              <View style={styles.wordInfo}>
                <Text style={[styles.sourceWord, { color: colors.text }]}>
                  {word.sourceWord}
                </Text>
                <Text style={[styles.targetWord, { color: colors.primary }]}>
                  {word.targetWord}
                </Text>
              </View>
              <View style={styles.wordActions}>
                {word.mastered ? (
                  <View style={[styles.masteredBadge, { backgroundColor: colors.successLight }]}>
                    <Check size={16} color={colors.success} />
                  </View>
                ) : null}
              </View>
            </View>
          ))}
          <View style={styles.listFooter} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sortMenu: {
    position: "absolute",
    top: 60,
    right: 16,
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  sortOptionText: {
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressStat: {
    alignItems: "center",
  },
  progressStatValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressStatLabel: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  wordsList: {
    flex: 1,
  },
  listFooter: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontWeight: "600",
  },
  wordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  wordInfo: {
    flex: 1,
  },
  sourceWord: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  targetWord: {
    fontSize: 14,
  },
  wordActions: {
    flexDirection: "row",
  },
  wordActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  masteredBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  }
});