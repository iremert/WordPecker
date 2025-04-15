import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import {
  User,
  Mail,
  Camera,
  FileImage,
  Globe,
  Bell,
  Lock,
  Save,
  X,
  UserCircle,
  CheckCircle,
} from "lucide-react-native";

// Sample profile image URLs
const profileImageOptions = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
];

// Language options
const languageOptions = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { user, updateUser } = useAuthStore();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [language, setLanguage] = useState(user?.settings?.language || "en");
  const [receiveNotifications, setReceiveNotifications] = useState(
    user?.settings?.receiveNotifications !== undefined 
      ? user.settings.receiveNotifications 
      : true
  );
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setNameError("");
    setEmailError("");
    
    // Validate name
    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    }
    
    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }
    
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user profile
      if (user) {
        updateUser({
          ...user,
          name,
          email,
          profileImage,
          settings: {
            ...(user.settings || {}),
            receiveNotifications,
            language,
          },
        });
      }
      
      Alert.alert(
        "Success",
        "Your profile has been updated successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSelectImage = (imageUrl: string) => {
    setProfileImage(imageUrl);
    setShowImageOptions(false);
  };

  const handleSelectLanguage = (languageCode: string) => {
    setLanguage(languageCode);
    setShowLanguageOptions(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <Header
        title="Edit Profile"
        showBackButton
        onBackPress={handleCancel}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView style={styles.container}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primaryLight }]}>
                <UserCircle size={60} color={colors.primary} />
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.changeImageButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowImageOptions(true)}
            >
              <Camera size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.formContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              icon={<User size={20} color={colors.textLight} />}
              error={nameError}
            />
            
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={20} color={colors.textLight} />}
              error={emailError}
            />
            
            <View style={styles.sectionTitle}>
              <Globe size={20} color={colors.primary} />
              <Text style={[styles.sectionTitleText, { color: colors.text }]}>Language Preferences</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.backgroundLight }]}
              onPress={() => setShowLanguageOptions(true)}
            >
              <View style={styles.optionButtonContent}>
                <Text style={[styles.optionButtonLabel, { color: colors.text }]}>App Language</Text>
                <View style={styles.optionButtonValue}>
                  <Text style={[styles.optionButtonValueText, { color: colors.textLight }]}>
                    {languageOptions.find(lang => lang.code === language)?.flag} {" "}
                    {languageOptions.find(lang => lang.code === language)?.name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            
            <View style={styles.sectionTitle}>
              <Bell size={20} color={colors.primary} />
              <Text style={[styles.sectionTitleText, { color: colors.text }]}>Notification Settings</Text>
            </View>
            
            <View style={[styles.switchOption, { borderBottomColor: colors.border }]}>
              <Text style={[styles.switchOptionLabel, { color: colors.text }]}>Receive Notifications</Text>
              <Switch
                value={receiveNotifications}
                onValueChange={setReceiveNotifications}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={receiveNotifications ? colors.primary : "#f4f3f4"}
                ios_backgroundColor={colors.border}
              />
            </View>
            
            <View style={styles.sectionTitle}>
              <Lock size={20} color={colors.primary} />
              <Text style={[styles.sectionTitleText, { color: colors.text }]}>Security</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.backgroundLight }]}
              onPress={() => Alert.alert("Change Password", "This would open the change password screen in a real app.")}
            >
              <View style={styles.optionButtonContent}>
                <Text style={[styles.optionButtonLabel, { color: colors.text }]}>Change Password</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={isLoading}
              style={styles.saveButton}
              icon={<Save size={20} color="white" />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Profile Image Options Modal */}
      {showImageOptions && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Profile Picture</Text>
              <TouchableOpacity onPress={() => setShowImageOptions(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.imageOptionsContainer}>
              <TouchableOpacity 
                style={[styles.imageSourceButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => {
                  Alert.alert("Camera", "This would open the camera in a real app");
                  setShowImageOptions(false);
                }}
              >
                <Camera size={24} color={colors.primary} />
                <Text style={[styles.imageSourceText, { color: colors.primary }]}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.imageSourceButton, { backgroundColor: colors.secondaryLight }]}
                onPress={() => {
                  Alert.alert("Gallery", "This would open the photo gallery in a real app");
                  setShowImageOptions(false);
                }}
              >
                <FileImage size={24} color={colors.secondary} />
                <Text style={[styles.imageSourceText, { color: colors.secondary }]}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.sampleImagesTitle, { color: colors.text }]}>Sample Profile Pictures</Text>
            
            <View style={styles.sampleImagesGrid}>
              {profileImageOptions.map((url, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.sampleImageContainer,
                    profileImage === url && { borderColor: colors.primary, borderWidth: 3 }
                  ]}
                  onPress={() => handleSelectImage(url)}
                >
                  <Image source={{ uri: url }} style={styles.sampleImage} />
                  {profileImage === url && (
                    <View style={[styles.selectedImageCheck, { backgroundColor: colors.primary }]}>
                      <CheckCircle size={16} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <Button
              title="Close"
              onPress={() => setShowImageOptions(false)}
              style={styles.closeButton}
            />
          </View>
        </View>
      )}
      
      {/* Language Options Modal */}
      {showLanguageOptions && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageOptions(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.languageOptionsContainer}>
              {languageOptions.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    { borderBottomColor: colors.border },
                    language === lang.code && { backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => handleSelectLanguage(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={[
                    styles.languageName,
                    { color: language === lang.code ? colors.primary : colors.text }
                  ]}>
                    {lang.name}
                  </Text>
                  {language === lang.code && (
                    <CheckCircle size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <Button
              title="Close"
              onPress={() => setShowLanguageOptions(false)}
              style={styles.closeButton}
            />
          </View>
        </View>
      )}
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
    padding: 16,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  optionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  optionButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionButtonLabel: {
    fontSize: 16,
  },
  optionButtonValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionButtonValueText: {
    fontSize: 16,
  },
  switchOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  switchOptionLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 2,
    marginLeft: 8,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  imageOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  imageSourceButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  imageSourceText: {
    marginTop: 8,
    fontWeight: "600",
  },
  sampleImagesTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  sampleImagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sampleImageContainer: {
    width: "30%",
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  sampleImage: {
    width: "100%",
    height: "100%",
  },
  selectedImageCheck: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    marginTop: 16,
  },
  languageOptionsContainer: {
    marginBottom: 16,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 16,
    flex: 1,
  },
});