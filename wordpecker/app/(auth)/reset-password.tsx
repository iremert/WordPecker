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
import { ArrowLeft, Mail } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const { colors, isDarkMode } = useThemeStore();
  const { t } = useLanguage();
  
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const backgroundAnim = React.useRef(new Animated.Value(0)).current;
  const successAnim = React.useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (isSubmitted) {
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isSubmitted]);

  const validateInputs = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError("");
    clearError();
    
    // Validate email
    if (!email.trim()) {
      setEmailError(t("error.required"));
      isValid = false;
    } else if (!email.includes("@")) {
      setEmailError(t("error.invalidEmail"));
      isValid = false;
    }
    
    return isValid;
  };

  const handleResetPassword = async () => {
    if (validateInputs()) {
      try {
        await resetPassword(email);
        setIsSubmitted(true);
      } catch (err) {
        // Error is handled in the store
      }
    }
  };

  const handleBackToLogin = () => {
    router.push("/(auth)/login");
  };

  const backgroundOpacity = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const successScale = successAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
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
          onPress={handleBackToLogin}
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
            <Text style={[styles.title, { color: colors.text }]}>{t("auth.resetPassword")}</Text>
            
            {!isSubmitted ? (
              <>
                <Text style={[styles.instructions, { color: colors.textLight }]}>
                  {t("auth.resetInstructions")}
                </Text>
                
                {error && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
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
                
                <Button
                  title={t("auth.sendInstructions")}
                  onPress={handleResetPassword}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.resetButton}
                  fullWidth
                />
              </>
            ) : (
              <Animated.View 
                style={[
                  styles.successContainer,
                  {
                    opacity: successAnim,
                    transform: [{ scale: successScale }]
                  }
                ]}
              >
                <View style={[styles.successIcon, { backgroundColor: colors.successLight }]}>
                  <Mail size={40} color={colors.success} />
                </View>
                <Text style={[styles.successText, { color: colors.success }]}>
                  Sıfırlama talimatları gönderildi!
                </Text>
                <Text style={[styles.successInstructions, { color: colors.textLight }]}>
                  Şifrenizi sıfırlamak için e-postanızı kontrol edin.
                </Text>
                <Button
                  title={t("auth.backToLogin")}
                  onPress={handleBackToLogin}
                  style={styles.backToLoginButton}
                  variant="outline"
                  fullWidth
                />
              </Animated.View>
            )}
            
            {!isSubmitted && (
              <TouchableOpacity
                style={styles.backToLoginContainer}
                onPress={handleBackToLogin}
              >
                <Text style={[styles.backToLoginText, { color: colors.primary }]}>
                  {t("auth.backToLogin")}
                </Text>
              </TouchableOpacity>
            )}
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
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    marginBottom: 16,
    textAlign: "center",
  },
  instructions: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
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
  resetButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  backToLoginContainer: {
    alignItems: "center",
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: "600",
  },
  successContainer: {
    alignItems: "center",
    padding: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successText: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  successInstructions: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  backToLoginButton: {
    marginBottom: 16,
  },
});