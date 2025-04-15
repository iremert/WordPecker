import React, { useState } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/themeStore";
import { useLanguage } from "@/components/LanguageProvider";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { useWordListStore } from "@/store/wordListStore";
import { useAuthStore } from "@/store/authStore";
import { LANGUAGES } from "@/constants/mockData";
import { ChevronDown, Check } from "lucide-react-native";

export default function CreateListScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createList, isLoading, error } = useWordListStore();
  const { colors } = useThemeStore();
  const { t } = useLanguage();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Beginner");
  const [source, setSource] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("tr");
  
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [languageType, setLanguageType] = useState<"source" | "target">("source");

  const validateInputs = () => {
    let isValid = true;
    
    // Reset errors
    setTitleError("");
    setDescriptionError("");
    
    // Validate title
    if (!title.trim()) {
      setTitleError(t("error.required"));
      isValid = false;
    }
    
    // Validate description
    if (!description.trim()) {
      setDescriptionError(t("error.required"));
      isValid = false;
    }
    
    return isValid;
  };

  const handleCreateList = async () => {
    if (validateInputs()) {
      try {
        const newList = await createList({
          userId: user?.id || "user1",
          title,
          description,
          category,
          source,
          sourceLanguage,
          targetLanguage,
        });
        
        // Navigate to add words screen
        router.push(`/word/add?listId=${newList.id}`);
      } catch (err) {
        Alert.alert("Error", t("error.failedCreateList"));
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const openLanguageModal = (type: "source" | "target") => {
    setLanguageType(type);
    setLanguageModalVisible(true);
  };

  const handleLanguageSelect = (languageCode: string) => {
    if (languageType === "source") {
      setSourceLanguage(languageCode);
      // If same language selected for both, change target
      if (languageCode === targetLanguage) {
        const otherLanguage = LANGUAGES.find(l => l.code !== languageCode);
        if (otherLanguage) {
          setTargetLanguage(otherLanguage.code);
        }
      }
    } else {
      setTargetLanguage(languageCode);
      // If same language selected for both, change source
      if (languageCode === sourceLanguage) {
        const otherLanguage = LANGUAGES.find(l => l.code !== languageCode);
        if (otherLanguage) {
          setSourceLanguage(otherLanguage.code);
        }
      }
    }
    setLanguageModalVisible(false);
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setCategoryModalVisible(false);
  };

  // Find language objects
  const sourceLanguageObj = LANGUAGES.find(lang => lang.code === sourceLanguage);
  const targetLanguageObj = LANGUAGES.find(lang => lang.code === targetLanguage);

  const categories = ["Beginner", "Intermediate", "Advanced"];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <Header
        title={t("createList.title")}
        showBackButton
        onBackPress={handleCancel}
        colors={colors}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("createList.listDetails")}</Text>
          
          {error && (
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          )}
          
          <Input
            label={t("createList.listTitle")}
            value={title}
            onChangeText={setTitle}
            placeholder={t("createList.titlePlaceholder")}
            error={titleError}
            colors={colors}
          />
          
          <Input
            label={t("createList.description")}
            value={description}
            onChangeText={setDescription}
            placeholder={t("createList.descriptionPlaceholder")}
            multiline
            numberOfLines={3}
            error={descriptionError}
            colors={colors}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>{t("createList.category")}</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { 
              borderColor: colors.border,
              backgroundColor: colors.backgroundLight
            }]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={[styles.pickerText, { color: colors.text }]}>{category}</Text>
            <ChevronDown size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <Text style={[styles.label, { color: colors.text }]}>{t("createList.languages")}</Text>
          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[styles.languageButton, { 
                borderColor: colors.border,
                backgroundColor: colors.backgroundLight
              }]}
              onPress={() => openLanguageModal("source")}
            >
              <Text style={[styles.languageLabel, { color: colors.textLight }]}>{t("createList.from")}</Text>
              <Text style={[styles.languageText, { color: colors.text }]}>
                {sourceLanguageObj?.flag} {sourceLanguageObj?.name}
              </Text>
              <ChevronDown size={16} color={colors.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.languageButton, { 
                borderColor: colors.border,
                backgroundColor: colors.backgroundLight
              }]}
              onPress={() => openLanguageModal("target")}
            >
              <Text style={[styles.languageLabel, { color: colors.textLight }]}>{t("createList.to")}</Text>
              <Text style={[styles.languageText, { color: colors.text }]}>
                {targetLanguageObj?.flag} {targetLanguageObj?.name}
              </Text>
              <ChevronDown size={16} color={colors.textLight} />
            </TouchableOpacity>
          </View>
          
          <Input
            label={t("createList.source")}
            value={source}
            onChangeText={setSource}
            placeholder={t("createList.sourcePlaceholder")}
            colors={colors}
          />
          
          <View style={styles.buttonContainer}>
            <Button
              title={t("createList.cancel")}
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
              colors={colors}
            />
            <Button
              title={t("createList.createAddWords")}
              onPress={handleCreateList}
              loading={isLoading}
              disabled={isLoading}
              style={styles.createButton}
              colors={colors}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("createList.category")}</Text>
            
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.modalOption,
                  { borderBottomColor: colors.border }
                ]}
                onPress={() => handleCategorySelect(cat)}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{cat}</Text>
                {cat === category && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {languageType === "source" ? t("createList.from") : t("createList.to")}
            </Text>
            
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.modalOption,
                  { borderBottomColor: colors.border }
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <View style={styles.languageOptionContent}>
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text style={[styles.modalOptionText, { color: colors.text }]}>
                    {language.name}
                  </Text>
                </View>
                {(languageType === "source" ? sourceLanguage : targetLanguage) === language.code && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>Close</Text>
            </TouchableOpacity>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  pickerText: {
    fontSize: 16,
  },
  languageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  languageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  languageLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  languageText: {
    flex: 1,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  createButton: {
    flex: 2,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  languageOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});