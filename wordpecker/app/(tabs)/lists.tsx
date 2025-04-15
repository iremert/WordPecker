import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Animated,
  Keyboard,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/themeStore";
import { useWordListStore } from "@/store/wordListStore";
import { WordListItem } from "@/components/WordListItem";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  X, Calendar, 
  Hash, 
  Clock, 
  CheckCircle, 
  CircleX,
  SortAsc,
  SortDesc,
  History,
  Trash2,
  BookOpen,
  Filter
} from "lucide-react-native";

// Recent searches storage key
const RECENT_SEARCHES_KEY = "recent_searches";

export default function ListsScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { lists, fetchLists, isLoading } = useWordListStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filteredLists, setFilteredLists] = useState(lists);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Filter states
  const [sortBy, setSortBy] = useState<"date" | "name" | "words" | "mastered">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterMastered, setFilterMastered] = useState<"all" | "mastered" | "learning">("all");
  
  // Animation values
  const searchHeight = useRef(new Animated.Value(0)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const filterButtonAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchLists();
    loadRecentSearches();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [lists, searchQuery, sortBy, sortOrder, filterMastered]);

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (error) {
      console.error("Failed to load recent searches", error);
    }
  };

  const saveRecentSearch = async (search: string) => {
    if (!search.trim()) return;
    
    try {
      // Add to recent searches, remove duplicates, and limit to 5
      const updatedSearches = [
        search,
        ...recentSearches.filter(s => s !== search)
      ].slice(0, 5);
      
      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
    } catch (error) {
      console.error("Failed to save recent search", error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error("Failed to clear recent searches", error);
    }
  };

  const applyFilters = () => {
    let result = [...lists];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(list => 
        list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply mastered filter
    if (filterMastered !== "all") {
      result = result.filter(list => {
        if (!list.words) return false;
        
        const masteredCount = list.words.filter(word => word.mastered).length;
        const masteredPercentage = list.words.length > 0 ? masteredCount / list.words.length : 0;
        
        if (filterMastered === "mastered") {
          return masteredPercentage >= 0.8; // 80% or more mastered
        } else {
          return masteredPercentage < 0.8; // Less than 80% mastered
        }
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "words":
          const aWords = a.words ? a.words.length : 0;
          const bWords = b.words ? b.words.length : 0;
          comparison = bWords - aWords;
          break;
        case "mastered":
          const aMastered = a.words && a.words.length > 0 
            ? a.words.filter(word => word.mastered).length / a.words.length 
            : 0;
          const bMastered = b.words && b.words.length > 0 
            ? b.words.filter(word => word.mastered).length / b.words.length 
            : 0;
          comparison = bMastered - aMastered;
          break;
      }
      
      return sortOrder === "asc" ? -comparison : comparison;
    });
    
    setFilteredLists(result);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLists();
    setRefreshing(false);
  };

  const handleCreateList = () => {
    router.push("/list/create");
  };

  const handleListPress = (listId: string) => {
    router.push(`/list/${listId}`);
  };

  const handleLearnPress = (listId: string) => {
    router.push(`/learning/${listId}`);
  };

  const handleQuizPress = (listId: string) => {
    router.push(`/quiz/${listId}`);
  };

  const toggleSearch = () => {
    if (showSearch) {
      // Hide search
      Keyboard.dismiss();
      Animated.parallel([
        Animated.timing(searchHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(searchOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.spring(filterButtonAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowSearch(false);
        setSearchQuery("");
      });
    } else {
      // Show search
      setShowSearch(true);
      Animated.parallel([
        Animated.timing(searchHeight, {
          toValue: 60,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(searchOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.spring(filterButtonAnim, {
          toValue: 0.8,
          friction: 5,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const handleFilter = () => {
    setFilterModalVisible(true);
  };

  const applyFiltersAndCloseModal = () => {
    applyFilters();
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setSortBy("date");
    setSortOrder("desc");
    setFilterMastered("all");
  };

  const handleSearchSubmit = () => {
    saveRecentSearch(searchQuery);
    Keyboard.dismiss();
  };

  const handleRecentSearchPress = (search: string) => {
    setSearchQuery(search);
    saveRecentSearch(search);
  };

  const renderHeader = () => (
    <View>
      <View style={styles.listHeader}>
        <View style={styles.listHeaderContent}>
          <Text style={[styles.listHeaderTitle, { color: colors.text }]}>Kelime Listeleriniz</Text>
          <Text style={[styles.listHeaderSubtitle, { color: colors.textLight }]}>
            {filteredLists.length} {filteredLists.length === 1 ? "liste" : "liste"}
            {filteredLists.length !== lists.length && ` (${lists.length} listeden filtrelendi)`}
          </Text>
        </View>
        
        <View style={styles.listHeaderActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.backgroundLight }]}
            onPress={toggleSearch}
          >
            {showSearch ? (
              <X size={20} color={colors.text} />
            ) : (
              <Search size={20} color={colors.text} />
            )}
          </TouchableOpacity>
          
          <Animated.View style={{ transform: [{ scale: filterButtonAnim }] }}>
            <TouchableOpacity
              style={[
                styles.iconButton, 
                { 
                  backgroundColor: 
                    sortBy !== "date" || 
                    sortOrder !== "desc" || 
                    filterMastered !== "all" 
                      ? colors.primaryLight 
                      : colors.backgroundLight 
                }
              ]}
              onPress={handleFilter}
            >
              <SlidersHorizontal size={20} color={
                sortBy !== "date" || 
                sortOrder !== "desc" || 
                filterMastered !== "all" 
                  ? colors.primary 
                  : colors.text
              } />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
      
      {showSearch && (
        <Animated.View 
          style={[
            styles.searchContainer, 
            { 
              height: searchHeight,
              opacity: searchOpacity,
              backgroundColor: colors.backgroundLight,
            }
          ]}
        >
          <Search size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Listeleri ara..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Recent searches */}
      {showSearch && searchQuery.length === 0 && recentSearches.length > 0 && (
        <View style={[styles.recentSearchesContainer, { backgroundColor: colors.backgroundLight }]}>
          <View style={styles.recentSearchesHeader}>
            <View style={styles.recentSearchesTitle}>
              <History size={16} color={colors.textLight} />
              <Text style={[styles.recentSearchesText, { color: colors.textLight }]}>Son Aramalar</Text>
            </View>
            <TouchableOpacity onPress={clearRecentSearches}>
              <Trash2 size={16} color={colors.textLight} />
            </TouchableOpacity>
          </View>
          
          {recentSearches.map((search, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.recentSearchItem}
              onPress={() => handleRecentSearchPress(search)}
            >
              <Search size={16} color={colors.textLight} />
              <Text style={[styles.recentSearchText, { color: colors.text }]}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <Header title="Kelime Listeleri" />
      
      <View style={styles.container}>
        {lists.length > 0 ? (
          <FlatList
            data={filteredLists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <WordListItem
                list={item}
                onPress={() => handleListPress(item.id)}
                onLearnPress={() => handleLearnPress(item.id)}
                onQuizPress={() => handleQuizPress(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <View style={styles.emptySearchContainer}>
                <BookOpen size={40} color={colors.textLight} />
                <Text style={[styles.emptySearchText, { color: colors.textLight }]}>
                  Arama kriterlerinize uygun liste bulunamadı
                </Text>
                <Button 
                  title="Filtreleri Temizle" 
                  onPress={() => {
                    setSearchQuery("");
                    resetFilters();
                  }}
                  style={styles.clearFiltersButton}
                />
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        ) : (
          <EmptyState
            type="lists"
            onButtonPress={handleCreateList}
          />
        )}
        
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleCreateList}
          activeOpacity={0.8}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filtrele & Sırala</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.filterHeaderRow}>
                <Filter size={20} color={colors.primary} />
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Sıralama Kriteri</Text>
              </View>
              
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    sortBy === "date" && [styles.filterOptionSelected, { backgroundColor: colors.primaryLight }]
                  ]}
                  onPress={() => setSortBy("date")}
                >
                  <Calendar size={20} color={sortBy === "date" ? colors.primary : colors.textLight} />
                  <Text style={[
                    styles.filterOptionText,
                    { color: sortBy === "date" ? colors.primary : colors.text }
                  ]}>Güncelleme Tarihi</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    sortBy === "name" && [styles.filterOptionSelected, { backgroundColor: colors.primaryLight }]
                  ]}
                  onPress={() => setSortBy("name")}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: sortBy === "name" ? colors.primary : colors.text }
                  ]}>Alfabetik</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    sortBy === "words" && [styles.filterOptionSelected, { backgroundColor: colors.primaryLight }]
                  ]}
                  onPress={() => setSortBy("words")}
                >
                  <Hash size={20} color={sortBy === "words" ? colors.primary : colors.textLight} />
                  <Text style={[
                    styles.filterOptionText,
                    { color: sortBy === "words" ? colors.primary : colors.text }
                  ]}>Kelime Sayısı</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    sortBy === "mastered" && [styles.filterOptionSelected, { backgroundColor: colors.primaryLight }]
                  ]}
                  onPress={() => setSortBy("mastered")}
                >
                  <CheckCircle size={20} color={sortBy === "mastered" ? colors.primary : colors.textLight} />
                  <Text style={[
                    styles.filterOptionText,
                    { color: sortBy === "mastered" ? colors.primary : colors.text }
                  ]}>Öğrenme İlerlemesi</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.filterHeaderRow}>
                <SortAsc size={20} color={colors.secondary} />
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Sıralama Yönü</Text>
              </View>
              
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    sortOrder === "desc" && [styles.filterOptionSelected, { backgroundColor: colors.secondaryLight }]
                  ]}
                  onPress={() => setSortOrder("desc")}
                >
                  <SortDesc size={20} color={sortOrder === "desc" ? colors.secondary : colors.textLight} />
                  <Text style={[
                    styles.filterOptionText,
                    { color: sortOrder === "desc" ? colors.secondary : colors.text }
                  ]}>Azalan</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    sortOrder === "asc" && [styles.filterOptionSelected, { backgroundColor: colors.secondaryLight }]
                  ]}
                  onPress={() => setSortOrder("asc")}
                >
                  <SortAsc size={20} color={sortOrder === "asc" ? colors.secondary : colors.textLight} />
                  <Text style={[
                    styles.filterOptionText,
                    { color: sortOrder === "asc" ? colors.secondary : colors.text }
                  ]}>Artan</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.filterHeaderRow}>
                <CheckCircle size={20} color={colors.accent} />
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Öğrenme Durumu</Text>
              </View>
              
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filterMastered === "all" && [styles.filterOptionSelected, { backgroundColor: colors.accentLight }]
                  ]}
                  onPress={() => setFilterMastered("all")}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: filterMastered === "all" ? colors.accent : colors.text }
                  ]}>Tüm Listeler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filterMastered === "mastered" && [styles.filterOptionSelected, { backgroundColor: colors.accentLight }]
                  ]}
                  onPress={() => setFilterMastered("mastered")}
                >
                  <CheckCircle size={20} color={filterMastered === "mastered" ? colors.accent : colors.textLight} />
                  <Text style={[
                    styles.filterOptionText,
                    { color: filterMastered === "mastered" ? colors.accent : colors.text }
                  ]}>Çoğunlukla Öğrenilmiş (≥80%)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filterMastered === "learning" && [styles.filterOptionSelected, { backgroundColor: colors.accentLight }]
                  ]}
                  onPress={() => setFilterMastered("learning")}
                >
                  <Clock size={20} color={filterMastered === "learning" ? colors.accent : colors.textLight} />
                  <Text style={[
                    styles.filterOptionText,
                    { color: filterMastered === "learning" ? colors.accent : colors.text }
                  ]}>Hala Öğreniliyor (%80'den az)</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.resetButton, { borderColor: colors.border }]}
                onPress={resetFilters}
              >
                <CircleX size={20} color={colors.text} />
                <Text style={[styles.resetButtonText, { color: colors.text }]}>Sıfırla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={applyFiltersAndCloseModal}
              >
                <CheckCircle size={20} color="white" />
                <Text style={styles.applyButtonText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  listHeaderContent: {
    flex: 1,
  },
  listHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  listHeaderSubtitle: {
    fontSize: 14,
  },
  listHeaderActions: {
    flexDirection: "row",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  recentSearchesContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentSearchesTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentSearchesText: {
    fontSize: 14,
    marginLeft: 6,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recentSearchText: {
    fontSize: 14,
    marginLeft: 8,
  },
  emptySearchContainer: {
    alignItems: "center",
    padding: 24,
  },
  emptySearchText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
  clearFiltersButton: {
    width: 150,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalContent: {
    padding: 24,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  filterOptions: {
    marginBottom: 24,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  filterOptionSelected: {
    borderRadius: 12,
  },
  filterOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resetButton: {
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  applyButton: {
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
});