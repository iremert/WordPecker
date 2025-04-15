import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  Image,
  Animated,
  Easing,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/themeStore";
import { useLanguageStore } from "@/store/languageStore";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { useWordListStore } from "@/store/wordListStore";
import { 
  Plus, 
  X, 
  Volume2, 
  Image as ImageIcon, 
  Mic, 
  Camera, 
  FileImage, 
  Check, 
  Trash2,
  Sparkles,
  Wand,
  Lightbulb,
  Loader,
  ScanText,
  Languages,
  FileText,
  RefreshCw,
  AlignLeft,
  Type,
  ArrowLeft,
  ArrowRight
} from "lucide-react-native";

// Sample images for demonstration
const sampleImages = [
  "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1504006833117-8886a355efbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1557180295-76eee20ae8aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1497752531616-c3afd9760a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
];

// Sample images with text for OCR demonstration
const sampleImagesWithText = [
  {
    url: "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    text: "Good morning",
    language: "en"
  },
  {
    url: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    text: "Bonjour",
    language: "fr"
  },
  {
    url: "https://images.unsplash.com/photo-1584473457409-ae5c91d7d8b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    text: "Guten Tag",
    language: "de"
  },
  {
    url: "https://images.unsplash.com/photo-1503551723145-6c040742065b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    text: "Merhaba",
    language: "tr"
  },
];

export default function AddWordScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { getListById, addWord, isLoading } = useWordListStore();
  const { colors } = useThemeStore();
  const { translateText, availableLanguages, currentLanguage } = useLanguageStore();
  
  const [list, setList] = useState<any>(null);
  const [sourceWord, setSourceWord] = useState("");
  const [targetWord, setTargetWord] = useState("");
  const [contextSentence, setContextSentence] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [imageUrl, setImageUrl] = useState("");
  
  const [sourceWordError, setSourceWordError] = useState("");
  const [targetWordError, setTargetWordError] = useState("");
  const [words, setWords] = useState<Array<{
    sourceWord: string;
    targetWord: string;
    contextSentence?: string;
    pronunciation?: string;
    difficulty: "easy" | "medium" | "hard";
    imageUrl?: string;
  }>>([]);

  // Modals
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [pronunciationModalVisible, setPronunciationModalVisible] = useState(false);
  const [textExtractionModalVisible, setTextExtractionModalVisible] = useState(false);
  const [translationModalVisible, setTranslationModalVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Text extraction and translation states
  const [extractedImage, setExtractedImage] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedTextTranslation, setExtractedTextTranslation] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("tr");
  const [textToTranslate, setTextToTranslate] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [translationLoading, setTranslationLoading] = useState(false);

  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingAnim = useRef(new Animated.Value(0)).current;
  const extractAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (listId) {
      const fetchList = async () => {
        try {
          const foundList = await getListById(listId);
          setList(foundList);
          if (foundList) {
            setSourceLanguage(foundList.fromLanguage || "en");
            setTargetLanguage(foundList.toLanguage || "tr");
          }
        } catch (error) {
          console.error("Error fetching list:", error);
        }
      };
      
      fetchList();
    }
  }, [listId, getListById]);

  useEffect(() => {
    return () => {
      // Clean up recording interval if component unmounts
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [recordingInterval]);

  useEffect(() => {
    if (isTranslating) {
      // Start rotation animation for translation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Stop animation
      rotateAnim.setValue(0);
    }
  }, [isTranslating]);

  useEffect(() => {
    if (isExtracting) {
      // Start rotation animation for extraction
      Animated.loop(
        Animated.timing(extractAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Stop animation
      extractAnim.setValue(0);
    }
  }, [isExtracting]);

  useEffect(() => {
    if (isRecording) {
      // Start pulse animation for recording
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ).start();

      // Start recording visualization animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      // Stop animations
      pulseAnim.setValue(1);
      recordingAnim.setValue(0);
    }
  }, [isRecording]);

  const validateWord = () => {
    let isValid = true;
    
    // Reset errors
    setSourceWordError("");
    setTargetWordError("");
    
    // Validate source word
    if (!sourceWord.trim()) {
      setSourceWordError("Kelime gereklidir");
      isValid = false;
    }
    
    // Validate target word
    if (!targetWord.trim()) {
      setTargetWordError("Çeviri gereklidir");
      isValid = false;
    }
    
    return isValid;
  };

  const handleAddToList = () => {
    if (validateWord()) {
      setWords([
        ...words,
        {
          sourceWord,
          targetWord,
          contextSentence: contextSentence || undefined,
          pronunciation: pronunciation || undefined,
          difficulty,
          imageUrl: imageUrl || undefined,
        },
      ]);
      
      // Clear form
      setSourceWord("");
      setTargetWord("");
      setContextSentence("");
      setPronunciation("");
      setDifficulty("medium");
      setImageUrl("");

      // Show success message
      Alert.alert("Başarılı", "Kelime listeye başarıyla eklendi!");
    }
  };

  const handleRemoveWord = (index: number) => {
    const newWords = [...words];
    newWords.splice(index, 1);
    setWords(newWords);
  };

  const handleSaveAll = async () => {
    if (!listId) {
      Alert.alert("Hata", "Liste ID bulunamadı.");
      return;
    }
    
    try {
      // Add current word if form is filled
      if (sourceWord.trim() && targetWord.trim()) {
        if (validateWord()) {
          // Add to local state first
          const newWord = {
            sourceWord,
            targetWord,
            contextSentence: contextSentence || undefined,
            pronunciation: pronunciation || undefined,
            difficulty,
            imageUrl: imageUrl || undefined,
          };
          
          setWords(prevWords => [...prevWords, newWord]);
          
          // Clear form
          setSourceWord("");
          setTargetWord("");
          setContextSentence("");
          setPronunciation("");
          setDifficulty("medium");
          setImageUrl("");
        } else {
          // If validation fails, don't proceed with saving
          return;
        }
      }
      
      // Save all words
      if (words.length === 0) {
        Alert.alert("Uyarı", "Kaydedilecek kelime yok.");
        return;
      }
      
      // Show loading indicator
      Alert.alert("Bilgi", "Kelimeler kaydediliyor...");
      
      // Save each word to the database
      for (const word of words) {
        console.log("Adding word to list:", listId, word);
        await addWord(listId, word);
      }
      
      // Show success message
      Alert.alert(
        "Başarılı", 
        `${words.length} kelime başarıyla kaydedildi.`,
        [
          {
            text: "Tamam",
            onPress: () => {
              // Navigate back to list detail
              router.replace(`/list/${listId}`);
            }
          }
        ]
      );
    } catch (err) {
      console.error("Error saving words:", err);
      Alert.alert("Hata", "Kelimeler kaydedilemedi. Lütfen tekrar deneyin.");
    }
  };

  const handleSelectImage = (url: string) => {
    setImageUrl(url);
    setImageModalVisible(false);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start timer
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    
    setRecordingInterval(interval);
    
    // In a real app, this would start recording
    // For demo, simulate recording for 3 seconds then stop
    setTimeout(() => {
      handleStopRecording();
    }, 3000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    // Clear interval
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    
    // In a real app, this would stop recording and process the audio
    // For demo, set a mock pronunciation
    setPronunciation("/həˈloʊ/");
    setPronunciationModalVisible(false);
  };

  const handleExtractText = (imageUrl: string) => {
    setIsExtracting(true);
    setExtractedImage(imageUrl);
    
    // In a real app, this would call an OCR API
    // For demo, simulate API call with timeout
    setTimeout(() => {
      // Find the sample image with text
      const sample = sampleImagesWithText.find(img => img.url === imageUrl);
      
      if (sample) {
        setExtractedText(sample.text);
        setSourceLanguage(sample.language);
      } else {
        setExtractedText("Örnek çıkarılan metin");
      }
      
      setIsExtracting(false);
    }, 2000);
  };

  const handleUseExtractedText = () => {
    setSourceWord(extractedText);
    setTextExtractionModalVisible(false);
  };

  const handleTranslateText = async () => {
    if (!textToTranslate) return;
    
    setTranslationLoading(true);
    
    try {
      // In a real app, this would call a translation API
      // For demo, simulate API call with timeout
      setTimeout(() => {
        // Simple mock translations
        const translations: Record<string, string> = {
          "Hello": "Merhaba",
          "Good morning": "Günaydın",
          "Thank you": "Teşekkür ederim",
          "How are you?": "Nasılsın?",
          "Goodbye": "Hoşça kal",
        };
        
        const result = translations[textToTranslate] || `${textToTranslate} (çevrildi)`;
        setTranslatedText(result);
        setTranslationLoading(false);
      }, 1500);
    } catch (error) {
      Alert.alert("Çeviri Hatası", "Metin çevrilemedi");
      setTranslationLoading(false);
    }
  };

  const handleUseTranslation = () => {
    setSourceWord(textToTranslate);
    setTargetWord(translatedText);
    setTranslationModalVisible(false);
    
    // Reset translation form
    setTextToTranslate("");
    setTranslatedText("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Render image selection modal
  const renderImageModal = () => (
    <Modal
      visible={imageModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setImageModalVisible(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Bir Resim Seçin</Text>
            <TouchableOpacity onPress={() => setImageModalVisible(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.imageGrid}>
            <View style={styles.imageGridContent}>
              {sampleImages.map((url, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.imageItem,
                    { borderColor: url === imageUrl ? colors.primary : "transparent" }
                  ]}
                  onPress={() => handleSelectImage(url)}
                >
                  <Image source={{ uri: url }} style={styles.thumbnailImage} />
                  {url === imageUrl && (
                    <View style={[styles.selectedImageOverlay, { backgroundColor: colors.primary + "80" }]}>
                      <Check size={24} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button
              title="İptal"
              onPress={() => setImageModalVisible(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Seç"
              onPress={() => setImageModalVisible(false)}
              style={styles.modalButton}
              disabled={!imageUrl}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render pronunciation recording modal
  const renderPronunciationModal = () => (
    <Modal
      visible={pronunciationModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setPronunciationModalVisible(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Telaffuz Kaydet</Text>
            <TouchableOpacity onPress={() => setPronunciationModalVisible(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.recordingContainer}>
            <Animated.View
              style={[
                styles.microphoneContainer,
                {
                  backgroundColor: isRecording ? colors.error : colors.primary,
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <Mic size={40} color="white" />
            </Animated.View>
            
            <Text style={[styles.recordingTime, { color: colors.text }]}>
              {formatTime(recordingTime)}
            </Text>
            
            {isRecording && (
              <View style={styles.waveformContainer}>
                {[...Array(10)].map((_, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.waveformBar,
                      {
                        backgroundColor: colors.primary,
                        height: 20 + Math.random() * 30,
                        opacity: recordingAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 0.8]
                        })
                      }
                    ]}
                  />
                ))}
              </View>
            )}
            
            <View style={styles.recordingActions}>
              {isRecording ? (
                <TouchableOpacity
                  style={[styles.recordingButton, { backgroundColor: colors.error }]}
                  onPress={handleStopRecording}
                >
                  <Text style={styles.recordingButtonText}>Kaydı Durdur</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.recordingButton, { backgroundColor: colors.primary }]}
                  onPress={handleStartRecording}
                >
                  <Text style={styles.recordingButtonText}>Kayda Başla</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <Button
              title="İptal"
              onPress={() => setPronunciationModalVisible(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Kaydet"
              onPress={() => setPronunciationModalVisible(false)}
              style={styles.modalButton}
              disabled={!pronunciation}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render text extraction modal
  const renderTextExtractionModal = () => (
    <Modal
      visible={textExtractionModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setTextExtractionModalVisible(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Resimden Metin Çıkar</Text>
            <TouchableOpacity onPress={() => setTextExtractionModalVisible(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.extractionContent}>
            <Text style={[styles.extractionLabel, { color: colors.textLight }]}>
              Metin çıkarmak için bir resim seçin:
            </Text>
            
            <View style={styles.extractionImagesContainer}>
              {sampleImagesWithText.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.extractionImageItem,
                    { borderColor: item.url === extractedImage ? colors.primary : colors.border }
                  ]}
                  onPress={() => handleExtractText(item.url)}
                >
                  <Image source={{ uri: item.url }} style={styles.extractionImage} />
                  <View style={[styles.extractionImageOverlay, { backgroundColor: colors.background + "80" }]}>
                    <ScanText size={20} color={colors.primary} />
                    <Text style={[styles.extractionImageText, { color: colors.text }]}>
                      Çıkar
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            {isExtracting ? (
              <View style={styles.extractingContainer}>
                <Animated.View style={{
                  transform: [{
                    rotate: extractAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"]
                    })
                  }]
                }}>
                  <Loader size={32} color={colors.primary} />
                </Animated.View>
                <Text style={[styles.extractingText, { color: colors.text }]}>
                  Metin çıkarılıyor...
                </Text>
              </View>
            ) : extractedText ? (
              <View style={[styles.extractedTextContainer, { backgroundColor: colors.backgroundLight }]}>
                <View style={styles.extractedTextHeader}>
                  <Text style={[styles.extractedTextTitle, { color: colors.text }]}>
                    Çıkarılan Metin:
                  </Text>
                  <View style={[styles.languageTag, { backgroundColor: colors.primaryLight }]}>
                    <Languages size={14} color={colors.primary} />
                    <Text style={[styles.languageTagText, { color: colors.primary }]}>
                      {sourceLanguage.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.extractedText, { color: colors.text }]}>
                  {extractedText}
                </Text>
              </View>
            ) : null}
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button
              title="İptal"
              onPress={() => setTextExtractionModalVisible(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Metni Kullan"
              onPress={handleUseExtractedText}
              style={styles.modalButton}
              disabled={!extractedText || isExtracting}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render translation modal
  const renderTranslationModal = () => (
    <Modal
      visible={translationModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setTranslationModalVisible(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Metin Çevir</Text>
            <TouchableOpacity onPress={() => setTranslationModalVisible(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.translationContent}>
            <View style={styles.translationLanguages}>
              <View style={[styles.translationLanguage, { backgroundColor: colors.backgroundLight }]}>
                <Text style={[styles.translationLanguageText, { color: colors.text }]}>
                  {sourceLanguage.toUpperCase()}
                </Text>
              </View>
              <View style={styles.translationArrow}>
                <View style={styles.arrowContainer}>
                  <ArrowRight size={20} color={colors.textLight} />
                </View>
              </View>
              <View style={[styles.translationLanguage, { backgroundColor: colors.backgroundLight }]}>
                <Text style={[styles.translationLanguageText, { color: colors.text }]}>
                  {targetLanguage.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <TextInput
              style={[
                styles.translationInput,
                { 
                  backgroundColor: colors.backgroundLight,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              placeholder="Çevrilecek metni girin"
              placeholderTextColor={colors.textLight}
              value={textToTranslate}
              onChangeText={setTextToTranslate}
              multiline
            />
            
            <Button
              title="Çevir"
              onPress={handleTranslateText}
              style={styles.translateButton}
              loading={translationLoading}
              disabled={!textToTranslate || translationLoading}
            />
            
            {translationLoading ? (
              <View style={styles.translationLoadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.translationLoadingText, { color: colors.textLight }]}>
                  Çevriliyor...
                </Text>
              </View>
            ) : translatedText ? (
              <View style={[
                styles.translationResultContainer,
                { backgroundColor: colors.backgroundLight, borderColor: colors.border }
              ]}>
                <Text style={[styles.translationResultLabel, { color: colors.textLight }]}>
                  Çeviri:
                </Text>
                <Text style={[styles.translationResultText, { color: colors.text }]}>
                  {translatedText}
                </Text>
              </View>
            ) : null}
          </View>
          
          <View style={styles.modalActions}>
            <Button
              title="İptal"
              onPress={() => setTranslationModalVisible(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Çeviriyi Kullan"
              onPress={handleUseTranslation}
              style={styles.modalButton}
              disabled={!translatedText || translationLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <Header
        title="Kelime Ekle"
        showBackButton
        onBackPress={() => router.back()}
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  Listeye Yeni Kelimeler Ekle
                </Text>
                <Text style={[styles.formSubtitle, { color: colors.textLight }]}>
                  {list?.title || "Liste yükleniyor..."}
                </Text>
              </View>
              
              <View style={styles.inputRow}>
                <Input
                  label="Kelime"
                  placeholder="Kelime girin"
                  value={sourceWord}
                  onChangeText={setSourceWord}
                  error={sourceWordError}
                  style={{ color: colors.text }}
                />
                
                <View style={styles.inputActions}>
                  <TouchableOpacity
                    style={[styles.inputActionButton, { backgroundColor: colors.primaryLight }]}
                    onPress={() => setTranslationModalVisible(true)}
                  >
                    <Languages size={20} color={colors.primary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.inputActionButton, { backgroundColor: colors.primaryLight }]}
                    onPress={() => setTextExtractionModalVisible(true)}
                  >
                    <ScanText size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputRow}>
                <Input
                  label="Çeviri"
                  placeholder="Çeviri girin"
                  value={targetWord}
                  onChangeText={setTargetWord}
                  error={targetWordError}
                  style={{ color: colors.text }}
                />
                
                <View style={styles.inputActions}>
                  <TouchableOpacity
                    style={[styles.inputActionButton, { backgroundColor: colors.primaryLight }]}
                    onPress={() => setTranslationModalVisible(true)}
                  >
                    <Wand size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Input
                label="Bağlam Cümlesi (İsteğe Bağlı)"
                placeholder="Bu kelimeyi kullanan bir cümle girin"
                value={contextSentence}
                onChangeText={setContextSentence}
                multiline
                style={{ color: colors.text }}
              />
              
              <View style={styles.inputRow}>
                <Input
                  label="Telaffuz (İsteğe Bağlı)"
                  placeholder="örn. /həˈloʊ/"
                  value={pronunciation}
                  onChangeText={setPronunciation}
                  style={{ color: colors.text }}
                />
                
                <View style={styles.inputActions}>
                  <TouchableOpacity
                    style={[styles.inputActionButton, { backgroundColor: colors.primaryLight }]}
                    onPress={() => setPronunciationModalVisible(true)}
                  >
                    <Mic size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>Zorluk</Text>
              <View style={styles.difficultyContainer}>
                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    difficulty === "easy" && { backgroundColor: colors.successLight, borderColor: colors.success }
                  ]}
                  onPress={() => setDifficulty("easy")}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: difficulty === "easy" ? colors.success : colors.textLight }
                    ]}
                  >
                    Kolay
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    difficulty === "medium" && { backgroundColor: colors.warningLight, borderColor: colors.warning }
                  ]}
                  onPress={() => setDifficulty("medium")}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: difficulty === "medium" ? colors.warning : colors.textLight }
                    ]}
                  >
                    Orta
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    difficulty === "hard" && { backgroundColor: colors.errorLight, borderColor: colors.error }
                  ]}
                  onPress={() => setDifficulty("hard")}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: difficulty === "hard" ? colors.error : colors.textLight }
                    ]}
                  >
                    Zor
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.imageContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Resim (İsteğe Bağlı)</Text>
                
                {imageUrl ? (
                  <View style={styles.selectedImageContainer}>
                    <Image source={{ uri: imageUrl }} style={styles.selectedImage} />
                    <TouchableOpacity
                      style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                      onPress={() => setImageUrl("")}
                    >
                      <Trash2 size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.addImageButton, { borderColor: colors.border }]}
                    onPress={() => setImageModalVisible(true)}
                  >
                    <FileImage size={24} color={colors.textLight} />
                    <Text style={[styles.addImageText, { color: colors.textLight }]}>
                      Resim Ekle
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <Button
                title="Listeye Ekle"
                onPress={handleAddToList}
                style={styles.addButton}
                icon={<Plus size={20} color="white" />}
                fullWidth
              />
            </View>
            
            {words.length > 0 && (
              <View style={styles.wordsListContainer}>
                <Text style={[styles.wordsListTitle, { color: colors.text }]}>
                  Eklenecek Kelimeler ({words.length})
                </Text>
                
                {words.map((word, index) => (
                  <View
                    key={index}
                    style={[styles.wordItem, { backgroundColor: colors.cardLight, borderColor: colors.border }]}
                  >
                    <View style={styles.wordItemContent}>
                      <View style={styles.wordItemHeader}>
                        <Text style={[styles.wordItemText, { color: colors.text }]}>
                          {word.sourceWord}
                        </Text>
                        <Text style={[styles.wordItemTranslation, { color: colors.primary }]}>
                          {word.targetWord}
                        </Text>
                      </View>
                      
                      <View style={styles.wordItemTags}>
                        <View
                          style={[
                            styles.difficultyTag,
                            word.difficulty === "easy" && { backgroundColor: colors.successLight },
                            word.difficulty === "medium" && { backgroundColor: colors.warningLight },
                            word.difficulty === "hard" && { backgroundColor: colors.errorLight },
                          ]}
                        >
                          <Text
                            style={[
                              styles.difficultyTagText,
                              word.difficulty === "easy" && { color: colors.success },
                              word.difficulty === "medium" && { color: colors.warning },
                              word.difficulty === "hard" && { color: colors.error },
                            ]}
                          >
                            {word.difficulty === "easy" ? "Kolay" : 
                             word.difficulty === "medium" ? "Orta" : "Zor"}
                          </Text>
                        </View>
                        
                        {word.pronunciation && (
                          <View style={[styles.pronunciationTag, { backgroundColor: colors.infoLight }]}>
                            <Volume2 size={12} color={colors.info} />
                            <Text style={[styles.pronunciationTagText, { color: colors.info }]}>
                              {word.pronunciation}
                            </Text>
                          </View>
                        )}
                        
                        {word.imageUrl && (
                          <View style={[styles.imageTag, { backgroundColor: colors.primaryLight }]}>
                            <ImageIcon size={12} color={colors.primary} />
                            <Text style={[styles.imageTagText, { color: colors.primary }]}>
                              Resim
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      style={[styles.removeWordButton, { backgroundColor: colors.errorLight }]}
                      onPress={() => handleRemoveWord(index)}
                    >
                      <X size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
        
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Button
            title="Tüm Kelimeleri Kaydet"
            onPress={handleSaveAll}
            loading={isLoading}
            disabled={isLoading || (words.length === 0 && !sourceWord)}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
      
      {/* Modals */}
      {renderImageModal()}
      {renderPronunciationModal()}
      {renderTextExtractionModal()}
      {renderTranslationModal()}
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
  content: {
    padding: 16,
  },
  formContainer: {
    marginBottom: 24,
  },
  formHeader: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  inputActions: {
    marginLeft: 8,
    marginTop: 30,
  },
  inputActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  difficultyContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    marginHorizontal: 4,
  },
  difficultyText: {
    fontWeight: "600",
  },
  imageContainer: {
    marginBottom: 16,
  },
  addImageButton: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: {
    marginTop: 8,
    fontWeight: "500",
  },
  selectedImageContainer: {
    position: "relative",
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    marginTop: 8,
  },
  wordsListContainer: {
    marginBottom: 24,
  },
  wordsListTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  wordItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  wordItemContent: {
    flex: 1,
  },
  wordItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  wordItemText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  wordItemTranslation: {
    fontSize: 16,
  },
  wordItemTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  difficultyTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  pronunciationTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  pronunciationTagText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  imageTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  imageTagText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  removeWordButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  imageGrid: {
    maxHeight: 300,
  },
  imageGridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imageItem: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 2,
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  selectedImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  microphoneContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  recordingTime: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 50,
    marginBottom: 16,
  },
  waveformBar: {
    width: 4,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  recordingActions: {
    marginBottom: 16,
  },
  recordingButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  recordingButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  extractionContent: {
    marginBottom: 20,
  },
  extractionLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  extractionImagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  extractionImageItem: {
    width: "48%",
    aspectRatio: 1.5,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 2,
    overflow: "hidden",
    position: "relative",
  },
  extractionImage: {
    width: "100%",
    height: "100%",
  },
  extractionImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  extractionImageText: {
    fontWeight: "600",
    marginLeft: 4,
  },
  extractingContainer: {
    alignItems: "center",
    padding: 20,
  },
  extractingText: {
    marginTop: 12,
    fontSize: 16,
  },
  extractedTextContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  extractedTextHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  extractedTextTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  languageTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageTagText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  extractedText: {
    fontSize: 18,
    lineHeight: 24,
  },
  translationContent: {
    marginBottom: 20,
  },
  translationLanguages: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  translationLanguage: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  translationLanguageText: {
    fontWeight: "600",
  },
  translationArrow: {
    marginHorizontal: 16,
  },
  arrowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  translationInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  translateButton: {
    marginBottom: 16,
  },
  translationLoadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  translationLoadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  translationResultContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  translationResultLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  translationResultText: {
    fontSize: 18,
    lineHeight: 24,
  },
});