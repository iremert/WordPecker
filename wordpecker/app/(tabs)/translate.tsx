import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Animated,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/themeStore";
import { useLanguage } from "@/components/LanguageProvider";
import { useWordListStore } from "@/store/wordListStore";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { LANGUAGES } from "@/constants/mockData";
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Star,
  History,
  X,
  Check,
  ChevronDown,
  Plus,
  BookOpen,
  Save,
  Languages,
} from "lucide-react-native";
import { doc, collection, addDoc, updateDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuthStore } from "@/store/authStore";

// Translation history
const initialHistory = [
  {
    id: "1",
    sourceText: "Hello, how are you?",
    translatedText: "Merhaba, nasılsın?",
    sourceLanguage: "en",
    targetLanguage: "tr",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    sourceText: "I love learning languages",
    translatedText: "Dil öğrenmeyi seviyorum",
    sourceLanguage: "en",
    targetLanguage: "tr",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "3",
    sourceText: "What time is it?",
    translatedText: "Saat kaç?",
    sourceLanguage: "en",
    targetLanguage: "tr",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Real translation function using MyMemory Translation API (free tier)
const translateText = async (text, sourceLang, targetLang) => {
  try {
    if (!text.trim()) {
      throw new Error("Please enter text to translate");
    }

    // Format language codes for the API
    // MyMemory uses ISO language codes
    const formattedSourceLang = sourceLang;
    const formattedTargetLang = targetLang;
    
    // Construct the API URL
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${formattedSourceLang}|${formattedTargetLang}`;
    
    console.log("Calling translation API:", apiUrl);
    
    // Make the API request
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Translation API response:", data);
    
    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || "Translation failed");
    }
    
    // Extract the translated text from the response
    const translatedText = data.responseData.translatedText;
    
    // Return the translated text
    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

export default function TranslateScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { t } = useLanguage();
  const { lists, fetchLists, addWord } = useWordListStore();
  const { user } = useAuthStore();
  
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState(LANGUAGES.find(lang => lang.code === "en")); // Default to English
  const [targetLanguage, setTargetLanguage] = useState(LANGUAGES.find(lang => lang.code === "tr")); // Default to Turkish
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(initialHistory);
  const [showSourceLanguages, setShowSourceLanguages] = useState(false);
  const [showTargetLanguages, setShowTargetLanguages] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [selectedListId, setSelectedListId] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const historySlideAnim = useRef(new Animated.Value(300)).current;
  const saveOptionsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Load translation history from Firestore if user is authenticated
    if (user) {
      loadTranslationHistory();
    }
    
    // Fetch lists
    fetchLists();
  }, [user]);

  useEffect(() => {
    // Animate history panel
    Animated.timing(historySlideAnim, {
      toValue: showHistory ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showHistory]);

  useEffect(() => {
    // Animate save options panel
    Animated.timing(saveOptionsAnim, {
      toValue: showSaveOptions ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSaveOptions]);

  // Load translation history from Firestore
  const loadTranslationHistory = async () => {
    if (!user) return;
    
    try {
      const historyRef = collection(db, "users", user.uid, "translationHistory");
      const q = query(historyRef, orderBy("timestamp", "desc"), limit(20));
      const querySnapshot = await getDocs(q);
      
      const historyData = [];
      querySnapshot.forEach((doc) => {
        historyData.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      if (historyData.length > 0) {
        setHistory(historyData);
      }
    } catch (error) {
      console.error("Error loading translation history:", error);
    }
  };

  // Save translation to history in Firestore
  const saveTranslationToHistory = async (translationData) => {
    if (!user) return;
    
    try {
      const historyRef = collection(db, "users", user.uid, "translationHistory");
      await addDoc(historyRef, {
        ...translationData,
        timestamp: serverTimestamp(),
      });
      
      // Reload history
      loadTranslationHistory();
    } catch (error) {
      console.error("Error saving translation to history:", error);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      Alert.alert("Error", "Please enter text to translate");
      return;
    }
    
    Keyboard.dismiss();
    setIsTranslating(true);
    
    try {
      console.log("Starting translation...");
      console.log("Source language:", sourceLanguage.code);
      console.log("Target language:", targetLanguage.code);
      console.log("Text to translate:", sourceText);
      
      const result = await translateText(
        sourceText,
        sourceLanguage.code,
        targetLanguage.code
      );
      
      console.log("Translation result:", result);
      setTranslatedText(result);
      
      // Add to history
      const newHistoryItem = {
        sourceText,
        translatedText: result,
        sourceLanguage: sourceLanguage.code,
        targetLanguage: targetLanguage.code,
        timestamp: new Date().toISOString(),
      };
      
      // Update local state
      setHistory([newHistoryItem, ...history]);
      
      // Save to Firestore if user is authenticated
      if (user) {
        saveTranslationToHistory(newHistoryItem);
      }
    } catch (error) {
      console.error("Translation error:", error);
      Alert.alert("Translation Error", error.message || "Failed to translate text. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    // Swap languages
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    // Swap text if there's a translation
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const handleCopyTranslation = () => {
    if (!translatedText) return;
    
    // In a real app, this would use Clipboard.setString
    if (Platform.OS !== "web") {
      // For native platforms
      try {
        import("expo-clipboard").then(({ setStringAsync }) => {
          setStringAsync(translatedText);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        });
      } catch (error) {
        console.error("Clipboard error:", error);
      }
    } else {
      // For web
      navigator.clipboard.writeText(translatedText)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error("Clipboard error:", err);
        });
    }
  };

  const handleSaveTranslation = () => {
    if (!translatedText) return;
    setShowSaveOptions(true);
  };

  const handleAddToList = async () => {
    if (!selectedListId || !translatedText) {
      Alert.alert("Error", "Please select a list and ensure you have a translation.");
      return;
    }
    
    try {
      console.log("Adding word to list:", selectedListId);
      console.log("Source word:", sourceText);
      console.log("Target word:", translatedText);
      
      // Create a new word object
      const newWord = {
        sourceWord: sourceText,
        targetWord: translatedText,
        contextSentence: "",
        pronunciation: "",
        difficulty: "medium",
        imageUrl: "",
      };
      
      // Add the word to the list
      await addWord(selectedListId, newWord);
      
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setShowSaveOptions(false);
      }, 2000);
      
      Alert.alert(
        "Word Saved",
        `"${sourceText}" has been added to your word list.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error adding word to list:", error);
      Alert.alert("Error", "Failed to add word to list. Please try again.");
    }
  };

  const handleToggleRecording = () => {
    // In a real app, this would start/stop speech recognition
    if (Platform.OS === "web") {
      Alert.alert("Not Available", "Speech recognition is not available on web.");
      return;
    }
    
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate recording
      setTimeout(() => {
        setSourceText("How are you?");
        setIsRecording(false);
      }, 2000);
    }
  };

  const handlePlayPronunciation = () => {
    // In a real app, this would play text-to-speech
    Alert.alert("Playing", `Playing pronunciation for "${translatedText}"`);
  };

  const handleSelectHistoryItem = (item) => {
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    
    // Find and set the languages
    const sourceLang = LANGUAGES.find(lang => lang.code === item.sourceLanguage);
    const targetLang = LANGUAGES.find(lang => lang.code === item.targetLanguage);
    
    if (sourceLang) setSourceLanguage(sourceLang);
    if (targetLang) setTargetLanguage(targetLang);
    
    setShowHistory(false);
  };

  const handleClearHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your translation history?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          onPress: async () => {
            setHistory([]);
            
            // Clear history in Firestore if user is authenticated
            if (user) {
              try {
                const historyRef = collection(db, "users", user.uid, "translationHistory");
                const q = query(historyRef);
                const querySnapshot = await getDocs(q);
                
                // Delete each document
                const batch = db.batch();
                querySnapshot.forEach((doc) => {
                  batch.delete(doc.ref);
                });
                
                await batch.commit();
              } catch (error) {
                console.error("Error clearing translation history:", error);
              }
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleSelectLanguage = (language, type) => {
    if (type === "source") {
      setSourceLanguage(language);
      setShowSourceLanguages(false);
    } else {
      setTargetLanguage(language);
      setShowTargetLanguages(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    
    let date;
    try {
      // Handle Firestore Timestamp objects
      if (timestamp.toDate && typeof timestamp.toDate === "function") {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 60) {
        return `${diffMins} min ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      } else {
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      }
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "";
    }
  };

  // Generate example sentences based on the translation
  const generateExamples = () => {
    if (!sourceText || !translatedText) return [];
    
    return [
      {
        source: `${sourceText} is commonly used in conversations.`,
        translated: `${translatedText} genellikle konuşmalarda kullanılır.`
      },
      {
        source: `When greeting someone, you can say "${sourceText}".`,
        translated: `Birini selamlarken, "${translatedText}" diyebilirsiniz.`
      }
    ];
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <Header title="Çeviri" />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View 
            style={[
              styles.mainContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Language Selection */}
            <View style={styles.languageSelectionContainer}>
              <View style={styles.languageSelectors}>
                <TouchableOpacity
                  style={[styles.languageSelector, { backgroundColor: colors.cardLight }]}
                  onPress={() => setShowSourceLanguages(!showSourceLanguages)}
                >
                  <Text style={[styles.languageSelectorText, { color: colors.text }]}>
                    {sourceLanguage.flag} {sourceLanguage.name}
                  </Text>
                  <ChevronDown size={20} color={colors.textLight} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.swapButton, { backgroundColor: colors.primaryLight }]}
                  onPress={handleSwapLanguages}
                >
                  <View style={styles.swapButtonContent}>
                    <ArrowRight size={16} color={colors.primary} />
                    <ArrowLeft size={16} color={colors.primary} />
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.languageSelector, { backgroundColor: colors.cardLight }]}
                  onPress={() => setShowTargetLanguages(!showTargetLanguages)}
                >
                  <Text style={[styles.languageSelectorText, { color: colors.text }]}>
                    {targetLanguage.flag} {targetLanguage.name}
                  </Text>
                  <ChevronDown size={20} color={colors.textLight} />
                </TouchableOpacity>
              </View>
              
              {/* Source Language Dropdown */}
              {showSourceLanguages && (
                <View style={[styles.languageDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ScrollView style={styles.languageDropdownScroll} nestedScrollEnabled={true}>
                    {LANGUAGES.map((language) => (
                      <TouchableOpacity
                        key={language.code}
                        style={[
                          styles.languageOption,
                          language.code === sourceLanguage.code && { backgroundColor: colors.primaryLight }
                        ]}
                        onPress={() => handleSelectLanguage(language, "source")}
                      >
                        <Text style={[styles.languageOptionText, { color: colors.text }]}>
                          {language.flag} {language.name}
                        </Text>
                        {language.code === sourceLanguage.code && (
                          <Check size={16} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              {/* Target Language Dropdown */}
              {showTargetLanguages && (
                <View style={[
                  styles.languageDropdown, 
                  styles.targetLanguageDropdown,
                  { backgroundColor: colors.card, borderColor: colors.border }
                ]}>
                  <ScrollView style={styles.languageDropdownScroll} nestedScrollEnabled={true}>
                    {LANGUAGES.map((language) => (
                      <TouchableOpacity
                        key={language.code}
                        style={[
                          styles.languageOption,
                          language.code === targetLanguage.code && { backgroundColor: colors.primaryLight }
                        ]}
                        onPress={() => handleSelectLanguage(language, "target")}
                      >
                        <Text style={[styles.languageOptionText, { color: colors.text }]}>
                          {language.flag} {language.name}
                        </Text>
                        {language.code === targetLanguage.code && (
                          <Check size={16} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            
            {/* Source Text Input */}
            <View style={[styles.textInputContainer, { backgroundColor: colors.cardLight, borderColor: colors.border }]}>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder={`${sourceLanguage.name} dilinde metin girin`}
                placeholderTextColor={colors.textLight}
                value={sourceText}
                onChangeText={setSourceText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.inputActions}>
                <TouchableOpacity
                  style={[styles.inputActionButton, { backgroundColor: colors.backgroundLight }]}
                  onPress={() => setSourceText("")}
                  disabled={!sourceText}
                >
                  <X size={18} color={sourceText ? colors.textLight : colors.border} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.inputActionButton, 
                    { backgroundColor: isRecording ? colors.errorLight : colors.backgroundLight }
                  ]}
                  onPress={handleToggleRecording}
                >
                  {isRecording ? (
                    <MicOff size={18} color={colors.error} />
                  ) : (
                    <Mic size={18} color={colors.textLight} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Translate Button */}
            <Button
              title="Çevir"
              onPress={handleTranslate}
              loading={isTranslating}
              disabled={isTranslating || !sourceText.trim()}
              style={styles.translateButton}
              fullWidth
              icon={<Languages size={20} color="white" />}
              iconPosition="left"
            />
            
            {/* Translation Result */}
            <View style={[
              styles.resultContainer, 
              { 
                backgroundColor: colors.card, 
                borderColor: colors.border
              }
            ]}>
              <Text style={[styles.resultLabel, { color: colors.textLight }]}>
                {targetLanguage.flag} Çeviri ({targetLanguage.name})
              </Text>
              
              {isTranslating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textLight }]}>Çevriliyor...</Text>
                </View>
              ) : (
                <>
                  <Text style={[
                    styles.translatedText, 
                    { 
                      color: translatedText ? colors.text : colors.textLight 
                    }
                  ]}>
                    {translatedText || "Çeviri burada görünecek"}
                  </Text>
                  
                  {translatedText && (
                    <View style={styles.resultActions}>
                      <TouchableOpacity
                        style={[styles.resultActionButton, { backgroundColor: colors.backgroundLight }]}
                        onPress={handlePlayPronunciation}
                      >
                        <Volume2 size={20} color={colors.textLight} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.resultActionButton, 
                          { backgroundColor: isCopied ? colors.successLight : colors.backgroundLight }
                        ]}
                        onPress={handleCopyTranslation}
                      >
                        {isCopied ? (
                          <Check size={20} color={colors.success} />
                        ) : (
                          <Copy size={20} color={colors.textLight} />
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.resultActionButton, 
                          { backgroundColor: isSaved ? colors.successLight : colors.backgroundLight }
                        ]}
                        onPress={handleSaveTranslation}
                      >
                        {isSaved ? (
                          <Check size={20} color={colors.success} />
                        ) : (
                          <Star size={20} color={colors.textLight} />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
            
            {/* Examples Section */}
            {translatedText && !isTranslating && (
              <View style={[styles.examplesContainer, { borderColor: colors.border }]}>
                <Text style={[styles.examplesTitle, { color: colors.text }]}>Örnekler</Text>
                
                {generateExamples().map((example, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.exampleItem, 
                      index < generateExamples().length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }
                    ]}
                  >
                    <Text style={[styles.exampleSourceText, { color: colors.text }]}>
                      {example.source}
                    </Text>
                    <Text style={[styles.exampleTranslatedText, { color: colors.primary }]}>
                      {example.translated}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* History Button */}
            <View style={styles.historyButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.historyButton, 
                  { 
                    backgroundColor: showHistory ? colors.primaryLight : colors.cardLight,
                    borderColor: showHistory ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setShowHistory(!showHistory)}
              >
                <History size={20} color={showHistory ? colors.primary : colors.textLight} />
                <Text 
                  style={[
                    styles.historyButtonText, 
                    { color: showHistory ? colors.primary : colors.textLight }
                  ]}
                >
                  Geçmiş
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* History Panel */}
      <Animated.View 
        style={[
          styles.historyPanel,
          { 
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            transform: [{ translateX: historySlideAnim }]
          }
        ]}
      >
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, { color: colors.text }]}>Çeviri Geçmişi</Text>
          <TouchableOpacity onPress={() => setShowHistory(false)}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {history.length > 0 ? (
          <>
            <ScrollView style={styles.historyList}>
              {history.map((item) => {
                const sourceLang = LANGUAGES.find(lang => lang.code === item.sourceLanguage);
                const targetLang = LANGUAGES.find(lang => lang.code === item.targetLanguage);
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.historyItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleSelectHistoryItem(item)}
                  >
                    <View style={styles.historyItemHeader}>
                      <Text style={[styles.historyItemLanguages, { color: colors.textLight }]}>
                        {sourceLang?.flag || ""} → {targetLang?.flag || ""}
                      </Text>
                      <Text style={[styles.historyItemTime, { color: colors.textLight }]}>
                        {formatTimestamp(item.timestamp)}
                      </Text>
                    </View>
                    <Text 
                      style={[styles.historyItemSource, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.sourceText}
                    </Text>
                    <Text 
                      style={[styles.historyItemTranslation, { color: colors.primary }]}
                      numberOfLines={1}
                    >
                      {item.translatedText}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.clearHistoryButton, { backgroundColor: colors.errorLight }]}
              onPress={handleClearHistory}
            >
              <Text style={[styles.clearHistoryText, { color: colors.error }]}>Geçmişi Temizle</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyHistoryContainer}>
            <History size={60} color={colors.textLight} style={styles.emptyHistoryIcon} />
            <Text style={[styles.emptyHistoryText, { color: colors.textLight }]}>
              Çeviri geçmişiniz burada görünecek
            </Text>
          </View>
        )}
      </Animated.View>
      
      {/* Save Options Panel */}
      {showSaveOptions && (
        <Animated.View 
          style={[
            styles.saveOptionsOverlay,
            {
              backgroundColor: `rgba(0, 0, 0, ${saveOptionsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              })})`,
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.saveOptionsPanel,
              { 
                backgroundColor: colors.card,
                transform: [{
                  translateY: saveOptionsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                }],
              }
            ]}
          >
            <View style={styles.saveOptionsHeader}>
              <Text style={[styles.saveOptionsTitle, { color: colors.text }]}>Kelime Listesine Kaydet</Text>
              <TouchableOpacity onPress={() => setShowSaveOptions(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.wordPreview}>
              <View style={styles.wordPreviewRow}>
                <Text style={[styles.wordPreviewLabel, { color: colors.textLight }]}>Kaynak:</Text>
                <Text style={[styles.wordPreviewText, { color: colors.text }]}>{sourceText}</Text>
              </View>
              <View style={styles.wordPreviewRow}>
                <Text style={[styles.wordPreviewLabel, { color: colors.textLight }]}>Çeviri:</Text>
                <Text style={[styles.wordPreviewText, { color: colors.text }]}>{translatedText}</Text>
              </View>
            </View>
            
            <Text style={[styles.saveOptionsSubtitle, { color: colors.text }]}>Bir liste seçin:</Text>
            
            <ScrollView style={styles.listSelector}>
              {lists && lists.length > 0 ? (
                lists.map((list) => (
                  <TouchableOpacity
                    key={list.id}
                    style={[
                      styles.listOption,
                      { 
                        backgroundColor: selectedListId === list.id ? colors.primaryLight : colors.cardLight,
                        borderColor: selectedListId === list.id ? colors.primary : colors.border
                      }
                    ]}
                    onPress={() => setSelectedListId(list.id)}
                  >
                    <BookOpen 
                      size={20} 
                      color={selectedListId === list.id ? colors.primary : colors.textLight} 
                    />
                    <View style={styles.listOptionContent}>
                      <Text 
                        style={[
                          styles.listOptionTitle, 
                          { color: selectedListId === list.id ? colors.primary : colors.text }
                        ]}
                      >
                        {list.title}
                      </Text>
                      <Text style={[styles.listOptionSubtitle, { color: colors.textLight }]}>
                        {list.fromLanguage} → {list.toLanguage} • {list.totalWords || 0} kelime
                      </Text>
                    </View>
                    {selectedListId === list.id && (
                      <Check size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noListsContainer}>
                  <Text style={[styles.noListsText, { color: colors.textLight }]}>
                    Henüz kelime listeniz yok
                  </Text>
                  <TouchableOpacity
                    style={[styles.createListButton, { backgroundColor: colors.primaryLight }]}
                    onPress={() => {
                      setShowSaveOptions(false);
                      router.push("/list/create");
                    }}
                  >
                    <Plus size={16} color={colors.primary} />
                    <Text style={[styles.createListText, { color: colors.primary }]}>
                      Liste Oluştur
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.saveOptionsActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.backgroundLight }]}
                onPress={() => setShowSaveOptions(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.saveButton, 
                  { 
                    backgroundColor: selectedListId ? colors.primary : colors.backgroundLight,
                    opacity: selectedListId ? 1 : 0.5
                  }
                ]}
                onPress={handleAddToList}
                disabled={!selectedListId}
              >
                <Save size={20} color={selectedListId ? "white" : colors.textLight} />
                <Text 
                  style={[
                    styles.saveButtonText, 
                    { color: selectedListId ? "white" : colors.textLight }
                  ]}
                >
                  Kaydet
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    padding: 16,
  },
  languageSelectionContainer: {
    marginBottom: 20,
    zIndex: 10,
  },
  languageSelectors: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  languageSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  languageSelectorText: {
    fontSize: 16,
    fontWeight: "500",
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  swapButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  languageDropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    width: "45%",
    maxHeight: 200,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  targetLanguageDropdown: {
    left: "auto",
    right: 0,
  },
  languageDropdownScroll: {
    padding: 8,
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  languageOptionText: {
    fontSize: 14,
  },
  textInputContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  textInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  inputActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  translateButton: {
    marginBottom: 20,
  },
  resultContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    minHeight: 120,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  translatedText: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  resultActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  examplesContainer: {
    marginBottom: 20,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  exampleItem: {
    paddingVertical: 12,
  },
  exampleSourceText: {
    fontSize: 14,
    marginBottom: 4,
  },
  exampleTranslatedText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  historyButtonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  historyPanel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: 300,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    zIndex: 100,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  historyItemLanguages: {
    fontSize: 14,
  },
  historyItemTime: {
    fontSize: 12,
  },
  historyItemSource: {
    fontSize: 16,
    marginBottom: 4,
  },
  historyItemTranslation: {
    fontSize: 14,
    fontWeight: "500",
  },
  clearHistoryButton: {
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearHistoryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyHistoryContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyHistoryIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyHistoryText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  saveOptionsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  saveOptionsPanel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  saveOptionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  saveOptionsTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  wordPreview: {
    marginBottom: 20,
  },
  wordPreviewRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  wordPreviewLabel: {
    width: 100,
    fontSize: 16,
    fontWeight: "500",
  },
  wordPreviewText: {
    flex: 1,
    fontSize: 16,
  },
  saveOptionsSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  listSelector: {
    maxHeight: 200,
    marginBottom: 20,
  },
  listOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  listOptionContent: {
    flex: 1,
    marginLeft: 12,
  },
  listOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  listOptionSubtitle: {
    fontSize: 12,
  },
  noListsContainer: {
    alignItems: "center",
    padding: 20,
  },
  noListsText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  createListButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createListText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  saveOptionsActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});