import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Animated,
  Easing,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useLanguage } from "@/components/LanguageProvider";
import { Header } from "@/components/Header";
import {
  User,
  Moon,
  Sun,
  Bell,
  Globe,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Download,
  Upload,
  Check,
  UserCog,
  Lock,
  MessageSquare,
  Heart,
  Star,
  Info,
  Headphones,
  BookOpen,
  Pencil,
  X,
  UserCircle,
  LogIn,
  UserPlus,
  FileJson,
  FileText,
  Save,
  Share,
} from "lucide-react-native";

// Sample FAQ data
const faqData = [
  {
    question: "How do I create a new word list?",
    answer: "Tap the '+' button on the Lists screen to create a new list. You can add a title, description, and choose a language pair."
  },
  {
    question: "How does the learning algorithm work?",
    answer: "Our spaced repetition system shows you words at increasing intervals as you master them. Words you find difficult will appear more frequently."
  },
  {
    question: "Can I import words from other apps?",
    answer: "Yes! Go to Settings > Data > Import Data to import word lists from CSV files or other supported formats."
  },
  {
    question: "How do I track my progress?",
    answer: "Visit the Progress tab to see detailed statistics about your learning journey, including mastered words, quiz scores, and daily streak."
  },
  {
    question: "What's the difference between Learning and Quiz modes?",
    answer: "Learning mode helps you memorize words through flashcards, while Quiz mode tests your knowledge with multiple choice questions and typing exercises."
  }
];

// Sample privacy policy
const privacyPolicy = `
# Privacy Policy

## 1. Information We Collect

We collect information you provide directly to us when you create an account, such as your name, email address, and password. We also collect data about your usage of the app, including words learned, quiz results, and time spent learning.

## 2. How We Use Your Information

We use your information to:
- Provide, maintain, and improve our services
- Personalize your learning experience
- Track your progress and provide statistics
- Send you notifications and updates

## 3. Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## 4. Your Rights

You have the right to access, correct, or delete your personal information. You can do this through your account settings or by contacting us.

## 5. Changes to This Policy

We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
`;

// Sample support topics
const supportTopics = [
  {
    title: "Account Issues",
    icon: <User size={24} color="#6C5CE7" />,
    description: "Help with login, registration, and account management"
  },
  {
    title: "Learning Features",
    icon: <BookOpen size={24} color="#FF9F43" />,
    description: "Questions about flashcards, quizzes, and learning modes"
  },
  {
    title: "Technical Problems",
    icon: <HelpCircle size={24} color="#00D2D3" />,
    description: "App crashes, performance issues, and bugs"
  },
  {
    title: "Subscription & Billing",
    icon: <Download size={24} color="#10AC84" />,
    description: "Questions about premium features and payments"
  },
  {
    title: "Feature Requests",
    icon: <Star size={24} color="#FECA57" />,
    description: "Suggest new features or improvements"
  }
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { colors, isDarkMode, toggleTheme } = useThemeStore();
  const { t, currentLanguage, availableLanguages, setLanguage } = useLanguage();
  const [notifications, setNotifications] = React.useState(true);
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);
  const [faqModalVisible, setFaqModalVisible] = React.useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = React.useState(false);
  const [supportModalVisible, setSupportModalVisible] = React.useState(false);
  const [selectedFaq, setSelectedFaq] = React.useState<number | null>(null);
  const [selectedSupportTopic, setSelectedSupportTopic] = React.useState<number | null>(null);
  const [loginOptionsVisible, setLoginOptionsVisible] = React.useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [importSource, setImportSource] = useState<'file' | 'url' | null>(null);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

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
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      t("settings.logout"),
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: t("settings.logout"),
          onPress: async () => {
            try {
              await logout();
              console.log("Logged out successfully, redirecting to login screen");
              router.replace("/(auth)/login");
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Logout Error", "There was a problem logging out. Please try again.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const handleRegister = () => {
    router.push("/(auth)/register");
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleExportData = () => {
    setExportModalVisible(true);
  };

  const handleImportData = () => {
    setImportModalVisible(true);
  };

  const performExport = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      setExportModalVisible(false);
      Alert.alert(
        "Export Successful", 
        `Your data has been exported as ${exportFormat.toUpperCase()} file.`,
        [
          {
            text: "Share File",
            onPress: () => {
              Alert.alert("Share", "This would open the share dialog in a real app.");
            }
          },
          {
            text: "OK",
            style: "cancel"
          }
        ]
      );
    }, 2000);
  };

  const performImport = () => {
    setIsImporting(true);
    
    // Simulate import process
    setTimeout(() => {
      setIsImporting(false);
      setImportModalVisible(false);
      Alert.alert(
        "Import Successful", 
        "Your data has been imported successfully.",
        [{ text: "OK" }]
      );
    }, 2000);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("settings.deleteAccount"),
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            // In a real app, this would delete the account
            logout();
            router.replace("/(auth)/login");
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode);
    setLanguageModalVisible(false);
  };

  const handleFaqPress = (index: number) => {
    setSelectedFaq(selectedFaq === index ? null : index);
  };

  const handleSupportTopicPress = (index: number) => {
    setSelectedSupportTopic(index);
    Alert.alert(
      supportTopics[index].title,
      "This would open a support chat or form in a real app.",
      [{ text: "OK" }]
    );
  };

  const toggleLoginOptions = () => {
    setLoginOptionsVisible(!loginOptionsVisible);
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    subtitle?: string
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { 
        backgroundColor: colors.card,
        borderBottomColor: colors.border 
      }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: colors.backgroundLight }]}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textLight }]}>{subtitle}</Text>}
      </View>
      {rightComponent || (
        onPress && <ChevronRight size={20} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <Header title={t("settings.title")} />
      
      <ScrollView style={styles.container}>
        <Animated.View 
          style={[
            styles.profileSection,
            { 
              backgroundColor: colors.card,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {isAuthenticated ? (
            <>
              <View style={styles.profileInfo}>
                <View style={styles.profileImageContainer}>
                  {user?.photoURL ? (
                    <Image 
                      source={{ uri: user.photoURL }} 
                      style={styles.profileImage} 
                    />
                  ) : (
                    <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primaryLight }]}>
                      <UserCircle size={40} color={colors.primary} />
                    </View>
                  )}
                </View>
                <View>
                  <Text style={[styles.profileName, { color: colors.text }]}>{user?.name}</Text>
                  <Text style={[styles.profileEmail, { color: colors.textLight }]}>{user?.email}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.editProfileButton, { backgroundColor: colors.primaryLight }]}
                onPress={handleEditProfile}
              >
                <Pencil size={16} color={colors.primary} />
                <Text style={[styles.editProfileText, { color: colors.primary }]}>{t("settings.editProfile")}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.profileInfo}>
                <View style={[styles.guestAvatarContainer, { backgroundColor: colors.backgroundLight }]}>
                  <UserCircle size={40} color={colors.textLight} />
                </View>
                <View>
                  <Text style={[styles.profileName, { color: colors.text }]}>Guest User</Text>
                  <Text style={[styles.profileEmail, { color: colors.textLight }]}>Sign in to sync your progress</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.loginButton, { backgroundColor: colors.primary }]}
                onPress={toggleLoginOptions}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
        
        {/* Login options popup */}
        {loginOptionsVisible && (
          <Animated.View 
            style={[
              styles.loginOptionsContainer,
              { 
                backgroundColor: colors.card,
                shadowColor: colors.shadow,
                opacity: fadeAnim,
              }
            ]}
          >
            <View style={styles.loginOptionsHeader}>
              <Text style={[styles.loginOptionsTitle, { color: colors.text }]}>Account Options</Text>
              <TouchableOpacity onPress={toggleLoginOptions}>
                <X size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.loginOptionButton, { backgroundColor: colors.primaryLight }]}
              onPress={handleLogin}
            >
              <LogIn size={20} color={colors.primary} />
              <Text style={[styles.loginOptionText, { color: colors.primary }]}>Log In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.loginOptionButton, { backgroundColor: colors.secondaryLight }]}
              onPress={handleRegister}
            >
              <UserPlus size={20} color={colors.secondary} />
              <Text style={[styles.loginOptionText, { color: colors.secondary }]}>Create Account</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("settings.preferences")}</Text>
            
            {renderSettingItem(
              isDarkMode ? 
                <Sun size={24} color={colors.warning} /> : 
                <Moon size={24} color={colors.primary} />,
              t("settings.darkMode"),
              undefined,
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={isDarkMode ? colors.primary : "#f4f3f4"}
                ios_backgroundColor={colors.border}
              />
            )}
            
            {renderSettingItem(
              <Bell size={24} color={colors.error} />,
              t("settings.notifications"),
              undefined,
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={notifications ? colors.primary : "#f4f3f4"}
                ios_backgroundColor={colors.border}
              />
            )}
            
            {renderSettingItem(
              <Globe size={24} color={colors.accent} />,
              t("settings.language"),
              () => setLanguageModalVisible(true),
              <View style={styles.languageValue}>
                <Text style={[styles.settingValue, { color: colors.textLight }]}>
                  {currentLanguage.flag} {currentLanguage.name}
                </Text>
                <ChevronRight size={20} color={colors.textLight} />
              </View>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("settings.data")}</Text>
            
            {renderSettingItem(
              <Download size={24} color={colors.success} />,
              t("settings.exportData"),
              handleExportData,
              <ChevronRight size={20} color={colors.textLight} />,
              t("settings.exportDescription")
            )}
            
            {renderSettingItem(
              <Upload size={24} color={colors.secondary} />,
              t("settings.importData"),
              handleImportData,
              <ChevronRight size={20} color={colors.textLight} />,
              t("settings.importDescription")
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("settings.support")}</Text>
            
            {renderSettingItem(
              <HelpCircle size={24} color={colors.primary} />,
              t("settings.helpFaq"),
              () => setFaqModalVisible(true)
            )}
            
            {renderSettingItem(
              <MessageSquare size={24} color={colors.secondary} />,
              "Contact Support",
              () => setSupportModalVisible(true)
            )}
            
            {renderSettingItem(
              <Shield size={24} color={colors.accent} />,
              t("settings.privacyPolicy"),
              () => setPrivacyModalVisible(true)
            )}
            
            {renderSettingItem(
              <Heart size={24} color={colors.error} />,
              "Rate the App",
              () => Alert.alert("Rate", "This would open the app store rating in a real app.")
            )}
          </View>
          
          <View style={styles.section}>
            {isAuthenticated ? (
              <>
                <TouchableOpacity
                  style={[styles.logoutButton, { backgroundColor: colors.card }]}
                  onPress={handleLogout}
                >
                  <LogOut size={24} color={colors.error} />
                  <Text style={[styles.logoutText, { color: colors.error }]}>{t("settings.logout")}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteAccountButton}
                  onPress={handleDeleteAccount}
                >
                  <Text style={[styles.deleteAccountText, { color: colors.error }]}>{t("settings.deleteAccount")}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.guestMessage}>
                <Text style={[styles.guestMessageText, { color: colors.textLight }]}>
                  Create an account to access all features and sync your progress across devices
                </Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.versionText, { color: colors.textLight }]}>{t("settings.version")} 1.0.0</Text>
        </Animated.View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.languageModal, { backgroundColor: colors.card }]}>
            <Text style={[styles.languageModalTitle, { color: colors.text }]}>{t("settings.language")}</Text>
            
            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  { borderBottomColor: colors.border }
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <View style={styles.languageOptionContent}>
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text style={[styles.languageName, { color: colors.text }]}>
                    {language.name}
                  </Text>
                </View>
                {language.code === currentLanguage.code && (
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

      {/* FAQ Modal */}
      <Modal
        visible={faqModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFaqModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.faqModal, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
              <TouchableOpacity onPress={() => setFaqModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.faqScrollView}>
              {faqData.map((faq, index) => (
                <View key={index} style={[styles.faqItem, { borderBottomColor: colors.border }]}>
                  <TouchableOpacity 
                    style={styles.faqQuestion}
                    onPress={() => handleFaqPress(index)}
                  >
                    <Text style={[styles.faqQuestionText, { color: colors.text }]}>{faq.question}</Text>
                    <ChevronRight 
                      size={20} 
                      color={colors.primary}
                      style={{ 
                        transform: [{ rotate: selectedFaq === index ? '90deg' : '0deg' }]
                      }} 
                    />
                  </TouchableOpacity>
                  
                  {selectedFaq === index && (
                    <View style={[styles.faqAnswer, { backgroundColor: colors.backgroundLight }]}>
                      <Text style={[styles.faqAnswerText, { color: colors.text }]}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
              
              <View style={styles.faqContact}>
                <Text style={[styles.faqContactText, { color: colors.textLight }]}>
                  Didn't find what you're looking for?
                </Text>
                <TouchableOpacity 
                  style={[styles.faqContactButton, { backgroundColor: colors.primaryLight }]}
                  onPress={() => {
                    setFaqModalVisible(false);
                    setSupportModalVisible(true);
                  }}
                >
                  <Text style={[styles.faqContactButtonText, { color: colors.primary }]}>Contact Support</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.privacyModal, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.privacyScrollView}>
              <Text style={[styles.privacyText, { color: colors.text }]}>
                {privacyPolicy}
              </Text>
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.privacyCloseButton, { backgroundColor: colors.primary }]}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.privacyCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Support Modal */}
      <Modal
        visible={supportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.supportModal, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Support Center</Text>
              <TouchableOpacity onPress={() => setSupportModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.supportScrollView}>
              <Text style={[styles.supportIntro, { color: colors.textLight }]}>
                Select a topic to get help with:
              </Text>
              
              {supportTopics.map((topic, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.supportTopic,
                    { 
                      backgroundColor: selectedSupportTopic === index ? colors.primaryLight : colors.card,
                      borderColor: selectedSupportTopic === index ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => handleSupportTopicPress(index)}
                >
                  <View style={styles.supportTopicIcon}>
                    {topic.icon}
                  </View>
                  <View style={styles.supportTopicContent}>
                    <Text style={[
                      styles.supportTopicTitle, 
                      { 
                        color: selectedSupportTopic === index ? colors.primary : colors.text 
                      }
                    ]}>
                      {topic.title}
                    </Text>
                    <Text style={[styles.supportTopicDescription, { color: colors.textLight }]}>
                      {topic.description}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={selectedSupportTopic === index ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              ))}
              
              <View style={styles.supportContact}>
                <Text style={[styles.supportContactTitle, { color: colors.text }]}>
                  Contact Us Directly
                </Text>
                <TouchableOpacity 
                  style={[styles.supportContactButton, { backgroundColor: colors.secondaryLight }]}
                  onPress={() => {
                    Alert.alert("Email Support", "This would open an email client in a real app.");
                  }}
                >
                  <MessageSquare size={20} color={colors.secondary} />
                  <Text style={[styles.supportContactButtonText, { color: colors.secondary }]}>
                    Email Support
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.supportContactButton, { backgroundColor: colors.accentLight }]}
                  onPress={() => {
                    Alert.alert("Live Chat", "This would open a live chat in a real app.");
                  }}
                >
                  <Headphones size={20} color={colors.accent} />
                  <Text style={[styles.supportContactButtonText, { color: colors.accent }]}>
                    Live Chat
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Export Data Modal */}
      <Modal
        visible={exportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isExporting && setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.dataModal, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Export Data</Text>
              {!isExporting && (
                <TouchableOpacity onPress={() => setExportModalVisible(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
            
            {isExporting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text }]}>Exporting your data...</Text>
              </View>
            ) : (
              <>
                <View style={styles.dataOptionsContainer}>
                  <Text style={[styles.dataOptionsTitle, { color: colors.text }]}>Choose export format:</Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.dataFormatOption,
                      { 
                        backgroundColor: exportFormat === 'json' ? colors.primaryLight : colors.card,
                        borderColor: exportFormat === 'json' ? colors.primary : colors.border
                      }
                    ]}
                    onPress={() => setExportFormat('json')}
                  >
                    <FileJson size={24} color={exportFormat === 'json' ? colors.primary : colors.textLight} />
                    <View style={styles.dataFormatContent}>
                      <Text style={[
                        styles.dataFormatTitle,
                        { color: exportFormat === 'json' ? colors.primary : colors.text }
                      ]}>
                        JSON Format
                      </Text>
                      <Text style={[styles.dataFormatDesc, { color: colors.textLight }]}>
                        Best for importing back into this app
                      </Text>
                    </View>
                    {exportFormat === 'json' && (
                      <Check size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.dataFormatOption,
                      { 
                        backgroundColor: exportFormat === 'csv' ? colors.primaryLight : colors.card,
                        borderColor: exportFormat === 'csv' ? colors.primary : colors.border
                      }
                    ]}
                    onPress={() => setExportFormat('csv')}
                  >
                    <FileText size={24} color={exportFormat === 'csv' ? colors.primary : colors.textLight} />
                    <View style={styles.dataFormatContent}>
                      <Text style={[
                        styles.dataFormatTitle,
                        { color: exportFormat === 'csv' ? colors.primary : colors.text }
                      ]}>
                        CSV Format
                      </Text>
                      <Text style={[styles.dataFormatDesc, { color: colors.textLight }]}>
                        Compatible with spreadsheet applications
                      </Text>
                    </View>
                    {exportFormat === 'csv' && (
                      <Check size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.dataOptionsInfo}>
                  <Info size={20} color={colors.textLight} />
                  <Text style={[styles.dataOptionsInfoText, { color: colors.textLight }]}>
                    This will export all your word lists, learning progress, and statistics.
                  </Text>
                </View>
                
                <View style={styles.dataActionButtons}>
                  <TouchableOpacity
                    style={[styles.dataActionButton, { backgroundColor: colors.backgroundLight }]}
                    onPress={() => setExportModalVisible(false)}
                  >
                    <Text style={[styles.dataActionButtonText, { color: colors.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.dataActionButton, { backgroundColor: colors.primary }]}
                    onPress={performExport}
                  >
                    <Save size={20} color="white" />
                    <Text style={styles.dataActionButtonTextWhite}>Export</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Import Data Modal */}
      <Modal
        visible={importModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isImporting && setImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.dataModal, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Import Data</Text>
              {!isImporting && (
                <TouchableOpacity onPress={() => setImportModalVisible(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
            
            {isImporting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text }]}>Importing your data...</Text>
              </View>
            ) : (
              <>
                <View style={styles.dataOptionsContainer}>
                  <Text style={[styles.dataOptionsTitle, { color: colors.text }]}>Choose import source:</Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.dataFormatOption,
                      { 
                        backgroundColor: importSource === 'file' ? colors.primaryLight : colors.card,
                        borderColor: importSource === 'file' ? colors.primary : colors.border
                      }
                    ]}
                    onPress={() => setImportSource('file')}
                  >
                    <FileJson size={24} color={importSource === 'file' ? colors.primary : colors.textLight} />
                    <View style={styles.dataFormatContent}>
                      <Text style={[
                        styles.dataFormatTitle,
                        { color: importSource === 'file' ? colors.primary : colors.text }
                      ]}>
                        From File
                      </Text>
                      <Text style={[styles.dataFormatDesc, { color: colors.textLight }]}>
                        Import from a JSON or CSV file
                      </Text>
                    </View>
                    {importSource === 'file' && (
                      <Check size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.dataFormatOption,
                      { 
                        backgroundColor: importSource === 'url' ? colors.primaryLight : colors.card,
                        borderColor: importSource === 'url' ? colors.primary : colors.border
                      }
                    ]}
                    onPress={() => setImportSource('url')}
                  >
                    <Globe size={24} color={importSource === 'url' ? colors.primary : colors.textLight} />
                    <View style={styles.dataFormatContent}>
                      <Text style={[
                        styles.dataFormatTitle,
                        { color: importSource === 'url' ? colors.primary : colors.text }
                      ]}>
                        From URL
                      </Text>
                      <Text style={[styles.dataFormatDesc, { color: colors.textLight }]}>
                        Import from a web address
                      </Text>
                    </View>
                    {importSource === 'url' && (
                      <Check size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.dataOptionsInfo}>
                  <Info size={20} color={colors.warning} />
                  <Text style={[styles.dataOptionsInfoText, { color: colors.warning }]}>
                    Warning: Importing data may overwrite your existing word lists and progress.
                  </Text>
                </View>
                
                <View style={styles.dataActionButtons}>
                  <TouchableOpacity
                    style={[styles.dataActionButton, { backgroundColor: colors.backgroundLight }]}
                    onPress={() => setImportModalVisible(false)}
                  >
                    <Text style={[styles.dataActionButtonText, { color: colors.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.dataActionButton, 
                      { 
                        backgroundColor: importSource ? colors.primary : colors.backgroundLight,
                        opacity: importSource ? 1 : 0.5
                      }
                    ]}
                    onPress={importSource ? performImport : undefined}
                    disabled={!importSource}
                  >
                    <Upload size={20} color={importSource ? "white" : colors.textLight} />
                    <Text style={importSource ? styles.dataActionButtonTextWhite : [styles.dataActionButtonText, { color: colors.textLight }]}>
                      Import
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    marginBottom: 20,
    borderRadius: 20,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  loginOptionsContainer: {
    position: 'absolute',
    top: 90,
    right: 16,
    width: 200,
    borderRadius: 12,
    padding: 12,
    zIndex: 100,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loginOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  loginOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  loginOptionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  authButtonsContainer: {
    flexDirection: "row",
  },
  authButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  authButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 16,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
  },
  languageValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  deleteAccountButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  deleteAccountText: {
    fontSize: 14,
  },
  guestMessage: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  guestMessageText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  versionText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  languageModal: {
    width: "80%",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  languageModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  languageOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
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
  faqModal: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  faqScrollView: {
    padding: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  faqAnswer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  faqContact: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  faqContactText: {
    fontSize: 14,
    marginBottom: 12,
  },
  faqContactButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  faqContactButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  privacyModal: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    overflow: "hidden",
  },
  privacyScrollView: {
    padding: 16,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  privacyCloseButton: {
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  privacyCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  supportModal: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    overflow: "hidden",
  },
  supportScrollView: {
    padding: 16,
  },
  supportIntro: {
    fontSize: 14,
    marginBottom: 16,
  },
  supportTopic: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  supportTopicIcon: {
    marginRight: 16,
  },
  supportTopicContent: {
    flex: 1,
  },
  supportTopicTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  supportTopicDescription: {
    fontSize: 12,
  },
  supportContact: {
    marginTop: 24,
    marginBottom: 16,
  },
  supportContactTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  supportContactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  supportContactButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  dataModal: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    overflow: "hidden",
  },
  dataOptionsContainer: {
    padding: 16,
  },
  dataOptionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  dataFormatOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  dataFormatContent: {
    flex: 1,
    marginLeft: 12,
  },
  dataFormatTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  dataFormatDesc: {
    fontSize: 12,
  },
  dataOptionsInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 159, 67, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  dataOptionsInfoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  dataActionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  dataActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  dataActionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dataActionButtonTextWhite: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
});