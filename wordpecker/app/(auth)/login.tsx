import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useLanguage } from "@/components/LanguageProvider";
import { Moon, Sun, Globe, Info, Lock, Mail } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { colors, isDarkMode, toggleTheme } = useThemeStore();
  const { t, currentLanguage, availableLanguages, setLanguage } = useLanguage();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showCredentialsInfo, setShowCredentialsInfo] = useState(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const { width, height } = Dimensions.get("window");
  const logoSlide = React.useRef(new Animated.Value(-width)).current;
  const logoScale = React.useRef(new Animated.Value(0.5)).current;
  const logoRotate = React.useRef(new Animated.Value(0)).current;
  const languageSelectorAnim = React.useRef(new Animated.Value(0)).current;
  const credentialsInfoAnim = React.useRef(new Animated.Value(0)).current;
  const backgroundAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate elements when component mounts
    Animated.sequence([
      Animated.parallel([
        Animated.timing(backgroundAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoSlide, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    // Animate language selector
    Animated.timing(languageSelectorAnim, {
      toValue: showLanguageSelector ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showLanguageSelector]);

  useEffect(() => {
    // Animate credentials info
    Animated.timing(credentialsInfoAnim, {
      toValue: showCredentialsInfo ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showCredentialsInfo]);

  const validateInputs = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError("");
    setPasswordError("");
    clearError();
    
    // Validate email
    if (!email.trim()) {
      setEmailError(t("error.required"));
      isValid = false;
    } else if (!email.includes("@")) {
      setEmailError(t("error.invalidEmail"));
      isValid = false;
    }
    
    // Validate password
    if (!password.trim()) {
      setPasswordError(t("error.required"));
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t("error.passwordLength"));
      isValid = false;
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (validateInputs()) {
      try {
        await login(email, password);
           router.replace("/(tabs)");
      } catch (err) {
        // Error is handled in the store
      }
    }
  };

  const handleRegister = () => {
    router.push("/(auth)/register");
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/reset-password");
  };

  const toggleLanguageSelector = () => {
    setShowLanguageSelector(!showLanguageSelector);
    if (showCredentialsInfo) setShowCredentialsInfo(false);
  };

  const toggleCredentialsInfo = () => {
    setShowCredentialsInfo(!showCredentialsInfo);
    if (showLanguageSelector) setShowLanguageSelector(false);
  };

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode);
    setShowLanguageSelector(false);
  };

  const languageSelectorHeight = languageSelectorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const languageSelectorOpacity = languageSelectorAnim;

  const credentialsInfoHeight = credentialsInfoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  const credentialsInfoOpacity = credentialsInfoAnim;

  const backgroundOpacity = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const logoRotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Animated.View style={[
        styles.backgroundContainer,
        { opacity: backgroundOpacity }
      ]}>
        <ImageBackground
          source={{ uri: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" }}
          style={styles.backgroundImage}
          blurRadius={5}
        >
          <LinearGradient
            colors={isDarkMode ? 
              ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)'] : 
              ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.9)']}
            style={styles.gradient}
          />
        </ImageBackground>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.themeToggle, { backgroundColor: colors.cardLight }]} 
              onPress={toggleTheme}
            >
              {isDarkMode ? (
                <Sun size={24} color={colors.secondary} />
              ) : (
                <Moon size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.languageToggle, { backgroundColor: colors.cardLight }]} 
              onPress={toggleLanguageSelector}
            >
              <Globe size={24} color={colors.primary} />
              <Text style={[styles.currentLanguage, { color: colors.text }]}>
                {currentLanguage.flag}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoToggle, { backgroundColor: colors.cardLight }]} 
              onPress={toggleCredentialsInfo}
            >
              <Info size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Animated.View 
            style={[
              styles.languageSelector,
              { 
                backgroundColor: colors.card,
                height: languageSelectorHeight,
                opacity: languageSelectorOpacity,
                borderColor: colors.border,
              },
              { display: showLanguageSelector ? "flex" : "none" }
            ]}
          >
            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  language.code === currentLanguage.code && { 
                    backgroundColor: colors.primaryLight 
                  }
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <Text style={[styles.languageName, { color: colors.text }]}>
                  {language.name}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          <Animated.View 
            style={[
              styles.credentialsInfo,
              { 
                backgroundColor: colors.card,
                height: credentialsInfoHeight,
                opacity: credentialsInfoOpacity,
                borderColor: colors.border,
              },
              { display: showCredentialsInfo ? "flex" : "none" }
            ]}
          >
            <Text style={[styles.credentialsTitle, { color: colors.text }]}>
              {t("auth.testCredentials")}
            </Text>
            <View style={styles.credentialRow}>
              <Text style={[styles.credentialLabel, { color: colors.textLight }]}>
                {t("auth.email")}:
              </Text>
              <Text style={[styles.credentialValue, { color: colors.text }]}>
                demo@example.com
              </Text>
            </View>
            <View style={styles.credentialRow}>
              <Text style={[styles.credentialLabel, { color: colors.textLight }]}>
                {t("auth.password")}:
              </Text>
              <Text style={[styles.credentialValue, { color: colors.text }]}>
                password123
              </Text>
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.logoContainer,
              { 
                transform: [
                  { translateX: logoSlide },
                  { scale: logoScale },
                  { rotate: logoRotateInterpolate }
                ] 
              }
            ]}
          >
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" }}
              style={styles.logo}
            />
            <Text style={[styles.appName, { color: colors.text }]}>{t("app.name")}</Text>
            <Text style={[styles.tagline, { color: colors.textLight }]}>{t("app.tagline")}</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.formContainer,
              { 
                backgroundColor: colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={[styles.title, { color: colors.text }]}>{t("auth.welcome")}</Text>
            
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            
            <View style={styles.inputWrapper}>
              <Mail size={20} color={colors.primary} style={styles.inputIcon} />
              <Input
                label={t("auth.email")}
                value={email}
                onChangeText={setEmail}
                placeholder="E-posta adresinizi girin"
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
                style={styles.input}
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Lock size={20} color={colors.primary} style={styles.inputIcon} />
              <Input
                label={t("auth.password")}
                value={password}
                onChangeText={setPassword}
                placeholder="Şifrenizi girin"
                secureTextEntry
                error={passwordError}
                style={styles.input}
              />
            </View>
            
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                {t("auth.forgotPassword")}
              </Text>
            </TouchableOpacity>
            
            <Button
              title={t("auth.login")}
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              fullWidth
            />
            
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: colors.textLight }]}>
                {t("auth.noAccount")}
              </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={[styles.registerLink, { color: colors.primary }]}>
                  {t("auth.signup")}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  headerButtons: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    zIndex: 10,
  },
  themeToggle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  languageToggle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoToggle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentLanguage: {
    position: "absolute",
    bottom: 5,
    right: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
  languageSelector: {
    position: "absolute",
    top: 80,
    right: 80,
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    zIndex: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  languageFlag: {
    fontSize: 18,
    marginRight: 10,
  },
  languageName: {
    fontSize: 16,
  },
  credentialsInfo: {
    position: "absolute",
    top: 80,
    right: 20,
    width: 220,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    overflow: "hidden",
    zIndex: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  credentialsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  credentialRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  credentialLabel: {
    fontSize: 14,
    fontWeight: "500",
    width: 80,
  },
  credentialValue: {
    fontSize: 14,
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontSize: 18,
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  formContainer: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 16,
    textAlign: "center",
  },
  inputWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  inputIcon: {
    position: "absolute",
    top: 38,
    left: 12,
    zIndex: 1,
  },
  input: {
    paddingLeft: 40,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});