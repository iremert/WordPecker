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
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useLanguage } from "@/components/LanguageProvider";
import { Check, Square, ArrowLeft, User, Mail, Lock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const { colors, isDarkMode } = useThemeStore();
  const { t } = useLanguage();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const backgroundAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate elements when component mounts
    Animated.sequence([
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
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

  const validateInputs = () => {
    let isValid = true;
    
    // Reset errors
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");
    clearError();
    
    // Validate name
    if (!name.trim()) {
      setNameError(t("error.required"));
      isValid = false;
    }
    
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
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError(t("error.passwordMatch"));
      isValid = false;
    }
    
    // Validate terms acceptance
    if (!acceptTerms) {
      setTermsError(t("error.required"));
      isValid = false;
    }
    
    return isValid;
  };

  const handleRegister = async () => {
    if (validateInputs()) {
      try {
        await register(name, email, password);
        // If successful, the auth store will update isAuthenticated
        // and the index.tsx useEffect will redirect to the main app
      } catch (err) {
        // Error is handled in the store
      }
    }
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const toggleTerms = () => {
    setAcceptTerms(!acceptTerms);
    if (termsError) setTermsError("");
  };

  const backgroundOpacity = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
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
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.cardLight }]} 
          onPress={handleLogin}
        >
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" }}
              style={styles.logo}
            />
            <Text style={[styles.appName, { color: colors.text }]}>{t("app.name")}</Text>
            <Text style={[styles.tagline, { color: colors.textLight }]}>{t("app.tagline")}</Text>
          </View>

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
            <Text style={[styles.title, { color: colors.text }]}>{t("auth.createAccount")}</Text>
            
            {error && (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            )}
            
            <View style={styles.inputWrapper}>
              <User size={20} color={colors.primary} style={styles.inputIcon} />
              <Input
                label={t("auth.name")}
                value={name}
                onChangeText={setName}
                placeholder="Adınızı ve soyadınızı girin"
                error={nameError}
                style={styles.input}
              />
            </View>
            
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
                placeholder="Şifre oluşturun"
                secureTextEntry
                error={passwordError}
                style={styles.input}
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Lock size={20} color={colors.primary} style={styles.inputIcon} />
              <Input
                label={t("auth.confirmPassword")}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Şifrenizi onaylayın"
                secureTextEntry
                error={confirmPasswordError}
                style={styles.input}
              />
            </View>
            
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={toggleTerms}
              activeOpacity={0.7}
            >
              <View style={[styles.checkboxContainer, { borderColor: termsError ? colors.error : colors.border }]}>
                {acceptTerms ? (
                  <Check size={20} color={colors.primary} />
                ) : (
                  <Square size={20} color={colors.textLight} />
                )}
              </View>
              <Text style={[styles.termsText, { color: colors.textLight }]}>
                Kullanım Şartları ve Gizlilik Politikasını kabul ediyorum
              </Text>
            </TouchableOpacity>
            
            {termsError && (
              <Text style={[styles.termsErrorText, { color: colors.error }]}>{termsError}</Text>
            )}
            
            <Button
              title={t("auth.signup")}
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
              fullWidth
            />
            
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textLight }]}>
                {t("auth.alreadyAccount")}
              </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>
                  {t("auth.login")}
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
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontSize: 16,
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkboxContainer: {
    marginRight: 8,
    borderWidth: 1,
    borderRadius: 4,
    padding: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
  },
  termsErrorText: {
    fontSize: 12,
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});