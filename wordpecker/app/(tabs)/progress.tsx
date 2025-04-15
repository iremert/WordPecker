import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/themeStore";
import { useStatsStore } from "@/store/statsStore";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { 
  BarChart, 
  Trophy, 
  Calendar, 
  Clock, 
  Brain, 
  CheckCircle, 
  TrendingUp,
  Award,
  Target,
  BookOpen,
  Zap,
  Star,
  Sparkles,
  Flame,
  Medal,
  Crown,
  Lightbulb,
  Rocket,
  Gift,
  PartyPopper,
  Compass,
  Mic,
  Download,
  Upload,
  Copy,
  Check,
  X,
} from "lucide-react-native";
import { Button } from "@/components/Button";

export default function ProgressScreen() {
  const { stats, fetchStats, updateStreak, exportData, importData, unlockAchievement } = useStatsStore();
  const { colors } = useThemeStore();
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [exportCopied, setExportCopied] = useState(false);
  const [exportedData, setExportedData] = useState("");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchStats();
    
    // Simulate updating streak when app opens
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

    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  // Check if stats is loaded
  const statsLoaded = stats && stats.quizResults && stats.learningSessions && stats.achievements;

  // Calculate quiz average
  const quizAverage = statsLoaded && stats.quizResults.length > 0
    ? Math.round(
        stats.quizResults.reduce(
          (acc, result) => acc + (result.score / result.totalQuestions) * 100,
          0
        ) / stats.quizResults.length
      )
    : 0;

  // Calculate total time spent learning (in minutes)
  const totalTimeSpent = statsLoaded
    ? stats.learningSessions.reduce(
        (acc, session) => acc + session.timeSpent,
        0
      ) / 60
    : 0;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Rotation for trophy
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const handleAchievementPress = (id: string) => {
    setSelectedAchievement(id === selectedAchievement ? null : id);
  };

  const renderAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap": return <Zap size={28} color="white" />;
      case "Star": return <Star size={28} color="white" />;
      case "Calendar": return <Calendar size={28} color="white" />;
      case "BookOpen": return <BookOpen size={28} color="white" />;
      case "Mic": return <Mic size={28} color="white" />;
      case "Compass": return <Compass size={28} color="white" />;
      case "Award": return <Award size={28} color="white" />;
      case "Trophy": return <Trophy size={28} color="white" />;
      default: return <Gift size={28} color="white" />;
    }
  };

  const handleStreakClick = () => {
    Alert.alert(
      "Daily Streak",
      `You've been learning for ${stats?.streakDays || 0} consecutive days! Keep it up to earn rewards and achievements.`,
      [
        {
          text: "Learn Now",
          onPress: () => console.log("Navigate to learning screen"),
          style: "default",
        },
        {
          text: "OK",
          style: "cancel",
        }
      ]
    );
  };

  const handleExportData = async () => {
    const data = exportData();
    setExportedData(data);
    setExportModalVisible(true);
    
    try {
      await Share.share({
        message: data,
        title: "VocabVault Data Export"
      });
    } catch (error) {
      console.error("Error sharing data:", error);
    }
  };

  const handleCopyExportData = () => {
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  };

  const handleImportData = () => {
    setImportError("");
    if (!importText.trim()) {
      setImportError("Please enter data to import");
      return;
    }

    const success = importData(importText);
    if (success) {
      Alert.alert(
        "Import Successful",
        "Your data has been imported successfully!",
        [{ text: "OK", onPress: () => setImportModalVisible(false) }]
      );
    } else {
      setImportError("Invalid data format. Please check your import data.");
    }
  };

  const handleUnlockAchievement = (id: string) => {
    // This is just for demonstration purposes
    unlockAchievement(id);
    Alert.alert(
      "Achievement Unlocked!",
      "You've manually unlocked this achievement for testing purposes.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <Header title="Your Progress" />
      
      <ScrollView style={styles.container}>
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
          <TouchableOpacity 
            style={styles.streakHeader}
            onPress={handleStreakClick}
            activeOpacity={0.8}
          >
            <Animated.View 
              style={[
                styles.streakIconContainer, 
                { 
                  backgroundColor: colors.primary,
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <Flame size={36} color="white" />
            </Animated.View>
            <View>
              <Text style={[styles.streakTitle, { color: colors.text }]}>Daily Streak</Text>
              <Text style={[styles.streakCount, { color: colors.primary }]}>{stats?.streakDays || 0} days</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.streakMessage, { color: colors.textLight }]}>
            {stats?.streakDays && stats.streakDays > 0
              ? "Keep going! Consistency is key to language learning."
              : "Start learning today to build your streak!"}
          </Text>
          
          <View style={styles.streakProgressContainer}>
            <ProgressBar
              progress={Math.min((stats?.streakDays || 0) / 30, 1)}
              height={10}
              backgroundColor={colors.primaryLight}
              progressColor={colors.primary}
            />
            <View style={styles.streakGoalContainer}>
              <Text style={[styles.streakGoalText, { color: colors.textLight }]}>Goal: 30 days</Text>
              <Text style={[styles.streakProgressText, { color: colors.primary }]}>
                {stats?.streakDays || 0}/30
              </Text>
            </View>
          </View>

          <View style={styles.streakBadges}>
            {[...Array(Math.min(stats?.streakDays || 0, 7))].map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.streakBadge, 
                  { 
                    backgroundColor: i < 3 ? colors.secondaryLight : 
                                    i < 5 ? colors.primaryLight : 
                                    colors.primaryLight 
                  }
                ]}
              >
                <Text style={[
                  styles.streakBadgeText, 
                  { 
                    color: i < 3 ? colors.secondary : 
                           i < 5 ? colors.primary : 
                           colors.success 
                  }
                ]}>
                  {i + 1}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
        
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Learning Stats</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { 
              backgroundColor: colors.card,
              shadowColor: colors.shadow,
              borderLeftColor: colors.primary,
            }]}>
              <Brain size={40} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats?.totalWordsMastered || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>Words Mastered</Text>
            </View>
            
            <View style={[styles.statCard, { 
              backgroundColor: colors.card,
              shadowColor: colors.shadow,
              borderLeftColor: colors.secondary,
            }]}>
              <CheckCircle size={40} color={colors.secondary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats?.totalWordsLearned || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>Words Reviewed</Text>
            </View>
            
            <View style={[styles.statCard, { 
              backgroundColor: colors.card,
              shadowColor: colors.shadow,
              borderLeftColor: colors.warning,
            }]}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Trophy size={40} color={colors.warning} />
              </Animated.View>
              <Text style={[styles.statValue, { color: colors.text }]}>{quizAverage}%</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>Quiz Average</Text>
            </View>
            
            <View style={[styles.statCard, { 
              backgroundColor: colors.card,
              shadowColor: colors.shadow,
              borderLeftColor: colors.accent,
            }]}>
              <Clock size={40} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(totalTimeSpent)}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>Minutes Spent</Text>
            </View>
          </View>
          
          <View style={styles.achievementsContainer}>
            <View style={styles.achievementHeader}>
              <View style={styles.achievementTitleContainer}>
                <Medal size={24} color={colors.warning} />
                <Text style={[styles.achievementTitle, { color: colors.text }]}>Achievements</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAllAchievements(!showAllAchievements)}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>
                  {showAllAchievements ? "Show Less" : "View All"}
                </Text>
              </TouchableOpacity>
            </View>
            
            {statsLoaded ? (
              showAllAchievements ? (
                <View style={styles.achievementsGrid}>
                  {stats.achievements.map((achievement) => (
                    <TouchableOpacity
                      key={achievement.id}
                      style={[
                        styles.achievementGridCard,
                        { 
                          backgroundColor: `${achievement.color}20`,
                          borderColor: achievement.color,
                          borderWidth: selectedAchievement === achievement.id ? 2 : 1,
                        }
                      ]}
                      onPress={() => handleAchievementPress(achievement.id)}
                      onLongPress={() => handleUnlockAchievement(achievement.id)}
                    >
                      <View style={[styles.achievementIconContainer, { backgroundColor: achievement.color }]}>
                        {renderAchievementIcon(achievement.icon)}
                      </View>
                      <Text style={[styles.achievementName, { color: achievement.color }]}>
                        {achievement.title}
                      </Text>
                      
                      {selectedAchievement === achievement.id && (
                        <View style={styles.achievementDetails}>
                          <Text style={[styles.achievementDesc, { color: colors.textLight }]}>
                            {achievement.description}
                          </Text>
                          <View style={styles.achievementProgressContainer}>
                            <ProgressBar
                              progress={achievement.progress / achievement.maxProgress}
                              height={6}
                              backgroundColor={`${achievement.color}30`}
                              progressColor={achievement.color}
                              style={styles.achievementProgress}
                            />
                            <Text style={[styles.achievementProgressText, { color: achievement.color }]}>
                              {achievement.progress}/{achievement.maxProgress}
                            </Text>
                          </View>
                          
                          {achievement.isUnlocked && (
                            <View style={[styles.unlockedBadge, { backgroundColor: achievement.color }]}>
                              <PartyPopper size={14} color="white" />
                              <Text style={styles.unlockedText}>Unlocked!</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
                  {stats.achievements.slice(0, 4).map((achievement) => (
                    <View 
                      key={achievement.id}
                      style={[styles.achievementCard, { 
                        backgroundColor: `${achievement.color}20`,
                        borderColor: achievement.color,
                      }]}
                    >
                      <View style={[styles.achievementIconContainer, { backgroundColor: achievement.color }]}>
                        {renderAchievementIcon(achievement.icon)}
                      </View>
                      <Text style={[styles.achievementName, { color: achievement.color }]}>{achievement.title}</Text>
                      <Text style={[styles.achievementDesc, { color: colors.textLight }]}>{achievement.description}</Text>
                      <View style={styles.achievementProgressContainer}>
                        <ProgressBar
                          progress={achievement.progress / achievement.maxProgress}
                          height={4}
                          backgroundColor={`${achievement.color}30`}
                          progressColor={achievement.color}
                          style={styles.achievementProgress}
                        />
                        <Text style={[styles.achievementProgressText, { color: achievement.color }]}>
                          {achievement.progress}/{achievement.maxProgress}
                        </Text>
                      </View>
                      
                      {achievement.isUnlocked && (
                        <View style={[styles.unlockedBadge, { backgroundColor: achievement.color }]}>
                          <PartyPopper size={14} color="white" />
                          <Text style={styles.unlockedText}>Unlocked!</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )
            ) : (
              <View style={[styles.loadingContainer, { backgroundColor: colors.cardLight }]}>
                <Text style={{ color: colors.textLight }}>Loading achievements...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <BarChart size={24} color={colors.secondary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Quiz Results</Text>
            </View>
            
            {statsLoaded && stats.quizResults.length > 0 ? (
              stats.quizResults.slice(0, 3).map((result, index) => (
                <View key={index} style={[styles.resultCard, { 
                  backgroundColor: colors.card,
                  shadowColor: colors.shadow,
                }]}>
                  <View style={styles.resultHeader}>
                    <View style={styles.resultDateContainer}>
                      <Calendar size={18} color={colors.textLight} style={styles.resultIcon} />
                      <Text style={[styles.resultDate, { color: colors.textLight }]}>{formatDate(result.date)}</Text>
                    </View>
                    <View style={[
                      styles.resultScoreBadge, 
                      { 
                        backgroundColor: colors.primaryLight
                      }
                    ]}>
                      <Text style={[
                        styles.resultScoreText,
                        { 
                          color: 
                            result.score / result.totalQuestions >= 0.8 ? colors.success :
                            result.score / result.totalQuestions >= 0.6 ? colors.warning :
                            colors.error
                        }
                      ]}>
                        {result.score}/{result.totalQuestions}
                      </Text>
                    </View>
                  </View>
                  
                  <ProgressBar
                    progress={result.score / result.totalQuestions}
                    height={8}
                    style={styles.resultProgress}
                    backgroundColor={colors.backgroundLight}
                    progressColor={
                      result.score / result.totalQuestions >= 0.8 ? colors.success :
                      result.score / result.totalQuestions >= 0.6 ? colors.warning :
                      colors.error
                    }
                  />
                  
                  <View style={styles.resultFooter}>
                    <View style={styles.resultTimeContainer}>
                      <Clock size={18} color={colors.textLight} style={styles.resultIcon} />
                      <Text style={[styles.resultTime, { color: colors.textLight }]}>
                        {Math.round(result.timeSpent / 60)} minutes
                      </Text>
                    </View>
                    
                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.retryButtonText, { color: colors.primary }]}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.emptyContainer, { backgroundColor: colors.cardLight }]}>
                <Target size={50} color={colors.textLight} />
                <Text style={[styles.emptyMessage, { color: colors.textLight }]}>
                  No quiz results yet. Take a quiz to see your performance!
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Rocket size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Learning Sessions</Text>
            </View>
            
            {statsLoaded && stats.learningSessions.length > 0 ? (
              stats.learningSessions.slice(0, 3).map((session, index) => (
                <View key={index} style={[styles.sessionCard, { 
                  backgroundColor: colors.card,
                  shadowColor: colors.shadow,
                }]}>
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionDateContainer}>
                      <Calendar size={18} color={colors.textLight} style={styles.sessionIcon} />
                      <Text style={[styles.sessionDate, { color: colors.textLight }]}>{formatDate(session.date)}</Text>
                    </View>
                    <View style={[styles.sessionStatsBadge, { backgroundColor: colors.primaryLight }]}>
                      <Sparkles size={18} color={colors.primary} />
                      <Text style={[styles.sessionMastered, { color: colors.primary }]}>
                        {session.wordsMastered} mastered
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.sessionProgressContainer}>
                    <Text style={[styles.sessionProgressLabel, { color: colors.textLight }]}>
                      Mastery Rate:
                    </Text>
                    <ProgressBar
                      progress={session.wordsMastered / session.wordsReviewed}
                      height={8}
                      style={styles.sessionProgress}
                      backgroundColor={colors.backgroundLight}
                      progressColor={colors.primary}
                    />
                    <Text style={[styles.sessionProgressText, { color: colors.primary }]}>
                      {Math.round((session.wordsMastered / session.wordsReviewed) * 100)}%
                    </Text>
                  </View>
                  
                  <View style={styles.sessionDetails}>
                    <View style={styles.sessionDetailItem}>
                      <BookOpen size={18} color={colors.textLight} />
                      <Text style={[styles.sessionDetailText, { color: colors.text }]}>
                        {session.wordsReviewed} words
                      </Text>
                    </View>
                    
                    <View style={styles.sessionDetailItem}>
                      <Clock size={18} color={colors.textLight} />
                      <Text style={[styles.sessionDetailText, { color: colors.text }]}>
                        {Math.round(session.timeSpent / 60)} minutes
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.emptyContainer, { backgroundColor: colors.cardLight }]}>
                <Brain size={50} color={colors.textLight} />
                <Text style={[styles.emptyMessage, { color: colors.textLight }]}>
                  No learning sessions yet. Start learning to track your progress!
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.dataManagementContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Data Management</Text>
            
            <View style={styles.dataButtonsContainer}>
              <TouchableOpacity 
                style={[styles.dataButton, { backgroundColor: colors.primaryLight }]}
                onPress={handleExportData}
              >
                <Download size={24} color={colors.primary} />
                <Text style={[styles.dataButtonText, { color: colors.primary }]}>Export Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dataButton, { backgroundColor: colors.secondaryLight }]}
                onPress={() => setImportModalVisible(true)}
              >
                <Upload size={24} color={colors.secondary} />
                <Text style={[styles.dataButtonText, { color: colors.secondary }]}>Import Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Export Modal */}
      <Modal
        visible={exportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Export Data</Text>
              <TouchableOpacity onPress={() => setExportModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalText, { color: colors.textLight }]}>
              Copy the text below to save your data. You can import it later to restore your progress.
            </Text>
            
            <ScrollView 
              style={[styles.exportTextContainer, { backgroundColor: colors.backgroundLight }]}
              contentContainerStyle={styles.exportTextContent}
            >
              <Text style={[styles.exportText, { color: colors.text }]}>{exportedData}</Text>
            </ScrollView>
            
            <View style={styles.modalButtonsContainer}>
              <Button 
                title={exportCopied ? "Copied!" : "Copy to Clipboard"}
                onPress={handleCopyExportData}
                style={styles.modalButton}
                icon={exportCopied ? <Check size={20} color="white" /> : <Copy size={20} color="white" />}
              />
              <Button 
                title="Close"
                onPress={() => setExportModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: colors.textLight }]}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Import Modal */}
      <Modal
        visible={importModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Import Data</Text>
              <TouchableOpacity onPress={() => setImportModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalText, { color: colors.textLight }]}>
              Paste your exported data below to restore your progress.
            </Text>
            
            <TextInput
              style={[
                styles.importTextInput,
                { 
                  backgroundColor: colors.backgroundLight,
                  color: colors.text,
                  borderColor: importError ? colors.error : colors.backgroundLight
                }
              ]}
              multiline
              placeholder="Paste your data here..."
              placeholderTextColor={colors.textLight}
              value={importText}
              onChangeText={setImportText}
            />
            
            {importError ? (
              <Text style={[styles.importError, { color: colors.error }]}>{importError}</Text>
            ) : null}
            
            <View style={styles.modalButtonsContainer}>
              <Button 
                title="Import"
                onPress={handleImportData}
                style={styles.modalButton}
                icon={<Upload size={20} color="white" />}
              />
              <Button 
                title="Cancel"
                onPress={() => setImportModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: colors.textLight }]}
              />
            </View>
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
    padding: 16,
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
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  streakIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  streakCount: {
    fontSize: 32,
    fontWeight: "700",
  },
  streakMessage: {
    fontSize: 14,
    marginBottom: 16,
  },
  streakProgressContainer: {
    marginTop: 8,
  },
  streakGoalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  streakGoalText: {
    fontSize: 14,
  },
  streakProgressText: {
    fontSize: 14,
    fontWeight: "600",
  },
  streakBadges: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'center',
  },
  streakBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  streakBadgeText: {
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  achievementsContainer: {
    marginBottom: 24,
  },
  achievementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  achievementTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  achievementsScroll: {
    marginBottom: 8,
  },
  achievementCard: {
    width: 160,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  achievementGridCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  achievementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  achievementDesc: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  achievementDetails: {
    marginTop: 8,
    width: "100%",
  },
  achievementProgressContainer: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  achievementProgress: {
    flex: 1,
    marginRight: 8,
  },
  achievementProgressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  unlockedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  resultCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultIcon: {
    marginRight: 6,
  },
  resultDate: {
    fontSize: 14,
  },
  resultScoreBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  resultScoreText: {
    fontSize: 14,
    fontWeight: "700",
  },
  resultProgress: {
    marginBottom: 12,
  },
  resultFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  resultTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultTime: {
    fontSize: 14,
  },
  retryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sessionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sessionDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionIcon: {
    marginRight: 6,
  },
  sessionDate: {
    fontSize: 14,
  },
  sessionStatsBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  sessionMastered: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  sessionProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sessionProgressLabel: {
    fontSize: 14,
    marginRight: 8,
    width: 90,
  },
  sessionProgress: {
    flex: 1,
  },
  sessionProgressText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    width: 40,
    textAlign: "right",
  },
  sessionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sessionDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionDetailText: {
    fontSize: 14,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderRadius: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderRadius: 16,
    height: 160,
  },
  emptyMessage: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
  dataManagementContainer: {
    marginBottom: 32,
  },
  dataButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dataButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  dataButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 16,
  },
  exportTextContainer: {
    maxHeight: 200,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  exportTextContent: {
    paddingBottom: 12,
  },
  exportText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  importTextInput: {
    height: 200,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 2,
    textAlignVertical: "top",
    fontSize: 12,
    fontFamily: "monospace",
  },
  importError: {
    fontSize: 14,
    marginBottom: 16,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});