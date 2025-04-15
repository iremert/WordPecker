import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/themeStore";
import { useWordListStore } from "@/store/wordListStore";
import { useStatsStore } from "@/store/statsStore";
import { Header } from "@/components/Header";
import { WordCard } from "@/components/WordCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Word } from "@/types";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Award,
  Star
} from "lucide-react-native";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;

export default function LearningScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getListById, markWordAsMastered } = useWordListStore();
  const { addLearningSession } = useStatsStore();
  const { colors } = useThemeStore();
  
  const [list, setList] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [learningWords, setLearningWords] = useState<Word[]>([]);
  const [sessionStats, setSessionStats] = useState({
    wordsReviewed: 0,
    wordsMastered: 0,
    startTime: new Date(),
  });
  const [isCompleted, setIsCompleted] = useState(false);

  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const swipeOpacity = useRef(new Animated.Value(0)).current;
  const swipeDirection = useRef<"left" | "right" | null>(null);
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (id) {
      const fetchList = async () => {
        try {
          const foundList = await getListById(id);
          setList(foundList);
          
          if (foundList && foundList.words) {
            // Filter words that are not mastered or haven't been reviewed recently
            const wordsToLearn = foundList.words.filter(
              word => !word.mastered || (word.reviewCount || 0) < 3
            );
            
            // If no words to learn, use all words
            setLearningWords(wordsToLearn.length > 0 ? wordsToLearn : foundList.words);
          }
        } catch (error) {
          console.error("Error fetching list:", error);
        }
      };
      
      fetchList();
    }
  }, [id]);

  useEffect(() => {
    if (isCompleted) {
      // Animate completion celebration
      Animated.parallel([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isCompleted]);

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: true,
    }).start();
    swipeDirection.current = null;
    Animated.timing(swipeOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSwipeComplete = (direction: "left" | "right") => {
    const x = direction === "right" ? width + 100 : -width - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (direction === "right") {
        handleMarkLearned();
      } else {
        handleMarkNotLearned();
      }
      position.setValue({ x: 0, y: 0 });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
        
        // Show swipe hint based on direction
        if (gesture.dx > 50 && swipeDirection.current !== "right") {
          swipeDirection.current = "right";
          Animated.timing(swipeOpacity, {
            toValue: Math.min(gesture.dx / 200, 1),
            duration: 100,
            useNativeDriver: true,
          }).start();
        } else if (gesture.dx < -50 && swipeDirection.current !== "left") {
          swipeDirection.current = "left";
          Animated.timing(swipeOpacity, {
            toValue: Math.min(Math.abs(gesture.dx) / 200, 1),
            duration: 100,
            useNativeDriver: true,
          }).start();
        } else if (gesture.dx > -50 && gesture.dx < 50) {
          swipeDirection.current = null;
          Animated.timing(swipeOpacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          handleSwipeComplete("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          handleSwipeComplete("left");
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const handleBack = () => {
    if (sessionStats.wordsReviewed > 0) {
      Alert.alert(
        "Oturumu Sonlandır",
        "Bu öğrenme oturumunu sonlandırmak istediğinizden emin misiniz?",
        [
          {
            text: "İptal",
            style: "cancel",
          },
          {
            text: "Sonlandır",
            onPress: handleEndSession,
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleEndSession = async () => {
    // Calculate time spent in seconds
    const timeSpent = Math.round(
      (new Date().getTime() - sessionStats.startTime.getTime()) / 1000
    );
    
    // Save session stats
    if (sessionStats.wordsReviewed > 0) {
      await addLearningSession({
        listId: id,
        date: new Date().toISOString().split('T')[0], // Use simple YYYY-MM-DD format
        wordsReviewed: sessionStats.wordsReviewed,
        wordsMastered: sessionStats.wordsMastered,
        timeSpent,
      });
    }
    
    router.back();
  };

  const handleFlipCard = () => {
    setShowTranslation(!showTranslation);
  };

  const handleMarkLearned = async () => {
    if (currentIndex >= learningWords.length) return;
    
    const word = learningWords[currentIndex];
    
    // Mark word as mastered
    await markWordAsMastered(id, word.id, true);
    
    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      wordsReviewed: prev.wordsReviewed + 1,
      wordsMastered: prev.wordsMastered + 1,
    }));
    
    // Move to next word
    moveToNextWord();
  };

  const handleMarkNotLearned = async () => {
    if (currentIndex >= learningWords.length) return;
    
    const word = learningWords[currentIndex];
    
    // Mark word as not mastered
    await markWordAsMastered(id, word.id, false);
    
    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      wordsReviewed: prev.wordsReviewed + 1,
    }));
    
    // Move to next word
    moveToNextWord();
  };

  const moveToNextWord = () => {
    // Reset card to show source word
    setShowTranslation(false);
    
    // Move to next word
    if (currentIndex < learningWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of list
      setIsCompleted(true);
    }
  };

  const handlePlayPronunciation = () => {
    // In a real app, this would play the pronunciation
    Alert.alert("Telaffuz", "Bu kelime için telaffuz çalınıyor");
  };

  const handleRestartSession = () => {
    setCurrentIndex(0);
    setShowTranslation(false);
    setIsCompleted(false);
    
    // Reset session stats
    setSessionStats({
      wordsReviewed: 0,
      wordsMastered: 0,
      startTime: new Date(),
    });
  };

  const getCardRotation = () => {
    return position.x.interpolate({
      inputRange: [-width / 2, 0, width / 2],
      outputRange: ["-10deg", "0deg", "10deg"],
      extrapolate: "clamp",
    });
  };

  // Generate confetti particles
  const renderConfetti = () => {
    const confetti = [];
    const confettiColors = [
      colors.primary, 
      colors.secondary, 
      colors.success, 
      colors.warning, 
      colors.error, 
      colors.info,
      colors.pink,
      colors.purple,
      colors.orange,
      colors.teal,
      colors.lime
    ];
    
    for (let i = 0; i < 50; i++) {
      const translateY = confettiAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 500 + Math.random() * 200]
      });
      
      const translateX = confettiAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, (Math.random() - 0.5) * 400]
      });
      
      const rotate = confettiAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", `${Math.random() * 360}deg`]
      });
      
      const opacity = confettiAnim.interpolate({
        inputRange: [0, 0.7, 1],
        outputRange: [0, 1, 0]
      });
      
      const size = 10 + Math.random() * 20;
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      
      confetti.push(
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: -20,
            left: width / 2,
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: Math.random() > 0.5 ? size / 2 : 0,
            transform: [
              { translateY },
              { translateX },
              { rotate }
            ],
            opacity
          }}
        />
      );
    }
    
    return confetti;
  };

  if (!list || !learningWords.length) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
        <Header
          title="Öğrenme"
          showBackButton
          onBackPress={handleBack}
        />
        <View style={styles.container}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {!list ? "Liste bulunamadı" : "Bu listede öğrenilecek kelime yok"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <Header
        title="Öğrenme"
        showBackButton
        onBackPress={handleBack}
      />
      
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {currentIndex + 1} / {learningWords.length}
          </Text>
          <ProgressBar
            progress={(currentIndex + 1) / learningWords.length}
            height={6}
            style={styles.progressBar}
          />
        </View>
        
        {isCompleted ? (
          <View style={styles.completedContainer}>
            {/* Confetti animation */}
            {renderConfetti()}
            
            <Animated.View 
              style={[
                styles.completedContent,
                {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <View style={[styles.completedIconContainer, { backgroundColor: colors.primaryLight }]}>
                <CheckCircle size={48} color={colors.success} />
              </View>
              
              <Text style={[styles.completedTitle, { color: colors.text }]}>Oturum Tamamlandı!</Text>
              
              <View style={styles.statsContainer}>
                <View style={[styles.statItem, { backgroundColor: colors.cardLight }]}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{sessionStats.wordsReviewed}</Text>
                  <Text style={[styles.statLabel, { color: colors.textLight }]}>İncelenen Kelimeler</Text>
                </View>
                
                <View style={[styles.statItem, { backgroundColor: colors.cardLight }]}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{sessionStats.wordsMastered}</Text>
                  <Text style={[styles.statLabel, { color: colors.textLight }]}>Öğrenilen Kelimeler</Text>
                </View>
                
                <View style={[styles.statItem, { backgroundColor: colors.cardLight }]}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {sessionStats.wordsReviewed > 0
                      ? Math.round((sessionStats.wordsMastered / sessionStats.wordsReviewed) * 100)
                      : 0}%
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textLight }]}>Başarı Oranı</Text>
                </View>
              </View>
              
              <View style={styles.achievementsContainer}>
                <View style={[styles.achievementBadge, { backgroundColor: colors.warningLight }]}>
                  <Star size={20} color={colors.warning} />
                  <Text style={[styles.achievementText, { color: colors.warning }]}>
                    Öğrenme Serisi +1
                  </Text>
                </View>
                
                {sessionStats.wordsMastered >= 5 && (
                  <View style={[styles.achievementBadge, { backgroundColor: colors.successLight }]}>
                    <Award size={20} color={colors.success} />
                    <Text style={[styles.achievementText, { color: colors.success }]}>
                      Hızlı Öğrenen
                    </Text>
                  </View>
                )}
                
                {sessionStats.wordsMastered / sessionStats.wordsReviewed >= 0.8 && (
                  <View style={[styles.achievementBadge, { backgroundColor: colors.primaryLight }]}>
                    <Sparkles size={20} color={colors.primary} />
                    <Text style={[styles.achievementText, { color: colors.primary }]}>
                      Hafıza Ustası
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.restartButton, { backgroundColor: colors.primaryLight }]}
                  onPress={handleRestartSession}
                >
                  <ArrowLeft size={20} color={colors.primary} />
                  <Text style={[styles.restartButtonText, { color: colors.primary }]}>Yeniden Başlat</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.finishButton, { backgroundColor: colors.primary }]}
                  onPress={handleEndSession}
                >
                  <Text style={styles.finishButtonText}>Bitir</Text>
                  <ArrowRight size={20} color="white" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        ) : (
          <View style={styles.cardContainer}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.cardWrapper,
                {
                  transform: [
                    { translateX: position.x },
                    { rotate: getCardRotation() }
                  ]
                }
              ]}
            >
              <WordCard
                word={learningWords[currentIndex]}
                showTranslation={showTranslation}
                onFlip={handleFlipCard}
                onMarkLearned={handleMarkLearned}
                onMarkNotLearned={handleMarkNotLearned}
                onPlayPronunciation={handlePlayPronunciation}
              />
            </Animated.View>
            
            {/* Swipe indicators */}
            <Animated.View 
              style={[
                styles.swipeIndicator, 
                styles.swipeLeft,
                { 
                  opacity: swipeDirection.current === "left" ? swipeOpacity : 0,
                  backgroundColor: colors.error + "40" // 40% opacity
                }
              ]}
            >
              <ChevronLeft size={40} color={colors.error} />
              <Text style={[styles.swipeText, { color: colors.error }]}>Tekrar İncele</Text>
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.swipeIndicator, 
                styles.swipeRight,
                { 
                  opacity: swipeDirection.current === "right" ? swipeOpacity : 0,
                  backgroundColor: colors.success + "40" // 40% opacity
                }
              ]}
            >
              <Text style={[styles.swipeText, { color: colors.success }]}>Bunu Biliyorum</Text>
              <ChevronRight size={40} color={colors.success} />
            </Animated.View>
            
            <View style={styles.swipeHintContainer}>
              <Text style={[styles.swipeHint, { color: colors.textLight }]}>
                Kelimeyi biliyorsanız sağa, tekrar incelemek istiyorsanız sola kaydırın
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    marginBottom: 8,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cardWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  swipeIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "40%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    flexDirection: "row",
    zIndex: 5,
  },
  swipeLeft: {
    left: 0,
  },
  swipeRight: {
    right: 0,
  },
  swipeText: {
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 8,
  },
  swipeHintContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  swipeHint: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    overflow: 'hidden',
  },
  completedContent: {
    width: '100%',
    alignItems: 'center',
  },
  completedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    width: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  achievementsContainer: {
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  achievementText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
  },
  restartButton: {
  },
  finishButton: {
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
  },
});