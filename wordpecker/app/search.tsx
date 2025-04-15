import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/themeStore";
import { useWordListStore } from "@/store/wordListStore";
import { Header } from "@/components/Header";
import { WordListItem } from "@/components/WordListItem";
import { Search as SearchIcon, X, BookOpen, ArrowLeft } from "lucide-react-native";

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { lists } = useWordListStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(lists);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  useEffect(() => {
    // Filter lists based on search query
    if (searchQuery.trim() === "") {
      setSearchResults(lists);
    } else {
      const filteredLists = lists.filter(list => 
        list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.words.some(word => 
          word.sourceWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.targetWord.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setSearchResults(filteredLists);
    }
  }, [searchQuery, lists]);
  
  const handleSearch = () => {
    Keyboard.dismiss();
    
    // Add to recent searches if not empty and not already in the list
    if (searchQuery.trim() !== "" && !recentSearches.includes(searchQuery.trim())) {
      setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
    }
  };
  
  const handleClearSearch = () => {
    setSearchQuery("");
  };
  
  const handleRecentSearchPress = (search: string) => {
    setSearchQuery(search);
  };
  
  const handleClearRecentSearches = () => {
    setRecentSearches([]);
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
  
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.backgroundLight }]}
          onPress={handleBack}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.backgroundLight }]}>
          <SearchIcon size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search words, lists..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <X size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.container}>
        {searchQuery.trim() === "" && recentSearches.length > 0 ? (
          <View style={styles.recentSearchesContainer}>
            <View style={styles.recentSearchesHeader}>
              <Text style={[styles.recentSearchesTitle, { color: colors.text }]}>Recent Searches</Text>
              <TouchableOpacity onPress={handleClearRecentSearches}>
                <Text style={[styles.clearText, { color: colors.primary }]}>Clear All</Text>
              </TouchableOpacity>
            </View>
            
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.recentSearchItem, { borderBottomColor: colors.border }]}
                onPress={() => handleRecentSearchPress(search)}
              >
                <SearchIcon size={16} color={colors.textLight} style={styles.recentSearchIcon} />
                <Text style={[styles.recentSearchText, { color: colors.text }]}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <FlatList
            data={searchResults}
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
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                {searchQuery.trim() !== "" ? (
                  <>
                    <BookOpen size={48} color={colors.textLight} />
                    <Text style={[styles.emptyText, { color: colors.textLight }]}>
                      No results found for "{searchQuery}"
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
                      Try a different search term or browse all lists
                    </Text>
                  </>
                ) : (
                  <>
                    <BookOpen size={48} color={colors.textLight} />
                    <Text style={[styles.emptyText, { color: colors.textLight }]}>
                      No word lists found
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
                      Create your first list to get started
                    </Text>
                  </>
                )}
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  recentSearchesContainer: {
    marginBottom: 24,
  },
  recentSearchesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  recentSearchIcon: {
    marginRight: 12,
  },
  recentSearchText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});