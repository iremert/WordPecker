import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useWordListStore } from "@/store/wordListStore";
import { useStatsStore } from "@/store/statsStore";
import { useThemeStore } from "@/store/themeStore";
import { useLanguage } from "@/components/LanguageProvider";
import { WordListItem } from "@/components/WordListItem";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { 
  Plus, 
  Search, 
  Flame, 
  Trophy, 
  Sparkles, 
  CheckSquare,
  BookOpen,
  Brain,
  Languages,
  Globe,
  Zap,
  Star,
  CalendarClock,
  Award,
  Compass,
  Mic,
} from "lucide-react-native";

// Language bubbles for animation
const languageBubbles = [
  { id: 1, text: "Hello", color: "#6C5CE7", size: 60, delay: 0 },
  { id: 2, text: "Hola", color: "#FF9F43", size: 50, delay: 200 },
  { id: 3, text: "Bonjour", color: "#00D2D3", size: 55, delay: 400 },
  { id: 4, text: "Ciao", color: "#FF6B6B", size: 45, delay: 600 },
  { id: 5, text: "こんにちは", color: "#10AC84", size: 65, delay: 800 },
  { id: 6, text: "你好", color: "#FECA57", size: 50, delay: 1000 },
  { id: 7, text: "Merhaba", color: "#54A0FF", size: 55, delay: 1200 },
  { id: 8, text: "Привет", color: "#FF78C4", size: 48, delay: 1400 },
  { id: 9, text: "안녕하세요", color: "#9C88FF", size: 52, delay: 1600 },
  { id: 10, text: "Olá", color: "#FF7F50", size: 46, delay: 1800 },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { lists, fetchLists, isLoading: listsLoading } = useWordListStore();
  const { stats, updateStreak, fetchStats } = useStatsStore();
  const { colors } = useThemeStore();
  const { t, currentLanguage } = useLanguage();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Language bubbles animations
  const bubbleAnims = useRef(languageBubbles.map(() => ({
    position: new Animated.ValueXY({ x: 0, y: 0 }),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0.5),
    rotate: new Animated.Value(0),
  }))).current;

  useEffect(() => {
    fetchLists();
    fetchStats();
    
    // Update streak with today's date
    const today = new Date().toISOString().split('T')[0];
    updateStreak(today);

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();

    // Start rotation animation for globe
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Animate language bubbles
    languageBubbles.forEach((bubble, index) => {
      setTimeout(() => {
        animateBubble(index);
      }, bubble.delay);
    });
  }, []);

  const animateBubble = (index: number) => {
    // Reset values
    bubbleAnims[index].position.setValue({ x: 0, y: 0 });
    bubbleAnims[index].opacity.setValue(0);
    bubbleAnims[index].scale.setValue(0.5);
    bubbleAnims[index].rotate.setValue(0);

    // Create random path
    const randomX = Math.random() * 300 - 150;
    const randomY = -150 - Math.random() * 200;
    const randomRotation = Math.random() * 360;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(bubbleAnims[index].opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(bubbleAnims[index].scale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(bubbleAnims[index].position, {
          toValue: {
            x: randomX,
            y: randomY,
          },
          duration: 8000 + Math.random() * 4000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(bubbleAnims[index].rotate, {
          toValue: 1,
          duration: 8000 + Math.random() * 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleAnims[index].opacity, {
          toValue: 0,
          duration: 8000,
          delay: 2000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Restart animation after a delay
      setTimeout(() => {
        animateBubble(index);
      }, Math.random() * 2000);
    });
  };

  const handleCreateList = () => {
    router.push("/list/create");
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

  const handleSearch = () => {
    router.push("/search");
  };

  const handleTranslate = () => {
    router.push("/(tabs)/translate");
  };

  // Get the 3 most recent lists
  const recentLists = [...lists].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 3);

  // Rotation for globe
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Check if stats and achievements are loaded
  const achievementsLoaded = stats && stats.achievements && Array.isArray(stats.achievements);

  // Map achievement icons to components
  const getAchievementIcon = (iconName: string, size: number = 24, color: string = "white") => {
    switch (iconName) {
      case "Zap":
        return <Zap size={size} color={color} />;
      case "Star":
        return <Star size={size} color={color} />;
      case "Calendar":
        return <CalendarClock size={size} color={color} />;
      case "BookOpen":
        return <BookOpen size={size} color={color} />;
      case "Mic":
        return <Mic size={size} color={color} />;
      case "Compass":
        return <Compass size={size} color={color} />;
      case "Award":
        return <Award size={size} color={color} />;
      case "Trophy":
        return <Trophy size={size} color={color} />;
      default:
        return <Star size={size} color={color} />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View>
              <Text style={[styles.greeting, { color: colors.text }]}>
                {t("home.hello")}, {user?.name || "User"}!
              </Text>
              <Text style={[styles.date, { color: colors.textLight }]}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: colors.cardLight }]}
              onPress={handleSearch}
            >
              <Search size={24} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>
          
          {/* Language animation container */}
          <View style={styles.languageAnimationContainer}>
            <View style={styles.languageIconContainer}>
              <Languages size={40} color={colors.primary} />
              <Animated.View style={{ 
                position: 'absolute', 
                top: -15, 
                right: -15,
                transform: [{ rotate: spin }]
              }}>
                <Globe size={30} color={colors.secondary} />
              </Animated.View>
            </View>
            
            {languageBubbles.map((bubble, index) => (
              <Animated.View
                key={bubble.id}
                style={[
                  styles.languageBubble,
                  {
                    backgroundColor: bubble.color,
                    width: bubble.size,
                    height: bubble.size,
                    borderRadius: bubble.size / 2,
                    opacity: bubbleAnims[index].opacity,
                    transform: [
                      { translateX: bubbleAnims[index].position.x },
                      { translateY: bubbleAnims[index].position.y },
                      { scale: bubbleAnims[index].scale },
                      { 
                        rotate: bubbleAnims[index].rotate.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', `${Math.random() > 0.5 ? '' : '-'}${Math.random() * 30}deg`]
                        }) 
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.languageBubbleText}>{bubble.text}</Text>
              </Animated.View>
            ))}
          </View>
          
          <Animated.View 
            style={[
              styles.streakCard,
              { 
                backgroundColor: colors.primaryLight,
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <View style={styles.streakInfo}>
              <View style={[styles.streakIconContainer, { backgroundColor: colors.primary }]}>
                <Flame size={24} color="white" />
              </View>
              <View>
                <Text style={[styles.streakTitle, { color: colors.text }]}>{t("home.dailyStreak")}</Text>
                <Text style={[styles.streakCount, { color: colors.primary }]}>{stats?.streakDays || 0} {t("home.days")}</Text>
              </View>
            </View>
            <Text style={[styles.streakMessage, { color: colors.textLight }]}>
              {t("home.keepLearning")}
            </Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.statsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={[styles.statCard, { 
              backgroundColor: colors.card,
              shadowColor: colors.shadow
            }]}>
              <Sparkles size={24} color={colors.secondary} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats?.totalWordsMastered || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>{t("home.wordsMastered")}</Text>
            </View>
            
            <View style={[styles.statCard, { 
              backgroundColor: colors.card,
              shadowColor: colors.shadow
            }]}>
              <CheckSquare size={24} color={colors.accent} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats?.totalLists || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>{t("home.wordLists")}</Text>
            </View>
            
            <View style={[styles.statCard, { 
              backgroundColor: colors.card,
              shadowColor: colors.shadow
            }]}>
              <Trophy size={24} color={colors.warning} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats?.quizResults && stats.quizResults.length > 0
                  ? Math.round(
                      stats.quizResults.reduce(
                        (acc, result) => acc + (result.score / result.totalQuestions) * 100,
                        0
                      ) / stats.quizResults.length
                    )
                  : 0}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>{t("home.quizAvg")}</Text>
            </View>
          </Animated.View>
          
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View style={styles.achievementsContainer}>
              <Text style={[styles.achievementsTitle, { color: colors.text }]}>Achievements</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
                {achievementsLoaded && stats.achievements ? (
                  stats.achievements
                    .filter(a => a.isUnlocked || a.progress > 0)
                    .slice(0, 4)
                    .map((achievement) => (
                      <View 
                        key={achievement.id} 
                        style={[
                          styles.achievementCard, 
                          { 
                            backgroundColor: `${achievement.color}20`,
                            borderColor: achievement.isUnlocked ? achievement.color : 'transparent',
                            borderWidth: achievement.isUnlocked ? 2 : 0
                          }
                        ]}
                      >
                        <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                          {getAchievementIcon(achievement.icon)}
                        </View>
                        <Text style={[styles.achievementName, { color: achievement.color }]}>{achievement.title}</Text>
                        
                        {achievement.isUnlocked ? (
                          <View style={[styles.achievementBadge, { backgroundColor: achievement.color }]}>
                            <Text style={styles.achievementBadgeText}>Unlocked!</Text>
                          </View>
                        ) : (
                          <View style={styles.achievementProgressWrapper}>
                            <ProgressBar 
                              progress={achievement.progress / achievement.maxProgress}
                              height={4}
                              backgroundColor={`${achievement.color}30`}
                              progressColor={achievement.color}
                            />
                            <Text style={[styles.achievementProgressText, { color: achievement.color }]}>
                              {achievement.progress}/{achievement.maxProgress}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))
                ) : (
                  <View style={styles.loadingAchievements}>
                    <Text style={{ color: colors.textLight }}>Loading achievements...</Text>
                  </View>
                )}
              </ScrollView>
            </View>
            
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: colors.successLight }]}
                onPress={() => router.push("/lists")}
              >
                <BookOpen size={24} color={colors.success} />
                <Text style={[styles.quickActionText, { color: colors.success }]}>All Lists</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: colors.infoLight }]}
                onPress={() => router.push("/progress")}
              >
                <Brain size={24} color={colors.info} />
                <Text style={[styles.quickActionText, { color: colors.info }]}>Progress</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: colors.secondaryLight }]}
                onPress={handleTranslate}
              >
                <Languages size={24} color={colors.secondary} />
                <Text style={[styles.quickActionText, { color: colors.secondary }]}>Translate</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("home.recentLists")}</Text>
              <TouchableOpacity onPress={() => router.push("/lists")}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>{t("home.seeAll")}</Text>
              </TouchableOpacity>
            </View>
            
            {recentLists.length > 0 ? (
              recentLists.map((list) => (
                <WordListItem
                  key={list.id}
                  list={list}
                  onPress={() => handleListPress(list.id)}
                  onLearnPress={() => handleLearnPress(list.id)}
                  onQuizPress={() => handleQuizPress(list.id)}
                />
              ))
            ) : (
              <EmptyState
                type="lists"
                onButtonPress={handleCreateList}
              />
            )}
            
            <Button
              title={t("home.createNewList")}
              onPress={handleCreateList}
              style={styles.createButton}
              fullWidth
              animated={true}
              icon={<Plus size={20} color="white" />}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  languageAnimationContainer: {
    height: 150,
    marginBottom: 24,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  languageIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  languageBubble: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  languageBubbleText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
  },
  streakCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  streakInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  streakIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  streakCount: {
    fontSize: 24,
    fontWeight: "700",
  },
  streakMessage: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  achievementsContainer: {
    marginBottom: 24,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  achievementsScroll: {
    marginBottom: 8,
  },
  achievementCard: {
    width: 110,
    height: 110,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  achievementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  achievementBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  achievementProgressWrapper: {
    width: "100%",
    marginTop: 4,
  },
  achievementProgressText: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },
  loadingAchievements: {
    width: 200,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});