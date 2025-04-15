import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/themeStore";
import { useWordListStore } from "@/store/wordListStore";
import { useStatsStore } from "@/store/statsStore";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { Word } from "@/types";
import { CheckCircle, Clock, Share2, Trophy, X } from "lucide-react-native";

type QuizQuestion = {
  word: Word;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
};

export default function QuizScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getListById } = useWordListStore();
  const { addQuizResult } = useStatsStore();
  const { colors } = useThemeStore();
  
  const [list, setList] = useState<any>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      const fetchList = async () => {
        try {
          const foundList = await getListById(id);
          setList(foundList);
          
          if (foundList && foundList.words && foundList.words.length > 0) {
            // Generate quiz questions
            const generatedQuestions = generateQuizQuestions(foundList.words);
            setQuestions(generatedQuestions);
          }
        } catch (error) {
          console.error("Error fetching list:", error);
        }
      };
      
      fetchList();
    }
    
    // Start timer
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [id]);

  const generateQuizQuestions = (words: Word[]): QuizQuestion[] => {
    // Shuffle words
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    
    // Take up to 10 words for the quiz
    const quizWords = shuffledWords.slice(0, 10);
    
    // Generate questions
    return quizWords.map(word => {
      // Get 3 random incorrect options
      const incorrectOptions = words
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.targetWord);
      
      // Combine correct answer with incorrect options and shuffle
      const options = [word.targetWord, ...incorrectOptions].sort(
        () => Math.random() - 0.5
      );
      
      return {
        word,
        options,
        correctAnswer: word.targetWord,
      };
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    
    // Update question with user's answer
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].userAnswer = option;
    setQuestions(updatedQuestions);
    
    // Update score
    if (isCorrect) {
      setScore(score + 1);
    } else {
      setWrongAnswers([...wrongAnswers, currentQuestion.word.id]);
    }
    
    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        // Quiz completed
        setQuizCompleted(true);
        
        // Save quiz result
        addQuizResult({
          listId: id,
          score: isCorrect ? score + 1 : score,
          totalQuestions: questions.length,
          timeSpent: elapsedTime,
          wrongAnswers,
        });
      }
    }, 1500);
  };

  const handleRestartQuiz = () => {
    // Reset quiz state
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    setElapsedTime(0);
    setWrongAnswers([]);
    
    // Generate new questions
    if (list && list.words) {
      const generatedQuestions = generateQuizQuestions(list.words);
      setQuestions(generatedQuestions);
    }
  };

  const handleFinishQuiz = () => {
    router.back();
  };

  const handleShareResults = () => {
    // In a real app, this would share the results
    console.log("Share results");
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (!list || !list.words || questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Header
          title="Sınav"
          showBackButton
          onBackPress={handleBack}
        />
        <View style={styles.container}>
          <Text style={styles.errorText}>
            {!list
              ? "Liste bulunamadı"
              : !list.words || list.words.length === 0
              ? "Bu listede kelime yok"
              : "Sınav soruları oluşturulamadı"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header
        title="Sınav"
        showBackButton
        onBackPress={handleBack}
      />
      
      <View style={styles.container}>
        {quizCompleted ? (
          <ScrollView contentContainerStyle={styles.resultsContainer}>
            <View style={styles.resultsTrophyContainer}>
              <Trophy size={48} color={colors.secondary} />
            </View>
            
            <Text style={styles.resultsTitle}>Sınav Tamamlandı!</Text>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>Puanınız</Text>
              <Text style={styles.scoreValue}>
                {score}/{questions.length}
              </Text>
              <ProgressBar
                progress={score / questions.length}
                height={8}
                style={styles.scoreProgress}
                showPercentage
              />
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Clock size={24} color={colors.primary} />
                <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
                <Text style={styles.statLabel}>Süre</Text>
              </View>
              
              <View style={styles.statItem}>
                <CheckCircle size={24} color={colors.success} />
                <Text style={styles.statValue}>{score}</Text>
                <Text style={styles.statLabel}>Doğru</Text>
              </View>
              
              <View style={styles.statItem}>
                <X size={24} color={colors.error} />
                <Text style={styles.statValue}>{questions.length - score}</Text>
                <Text style={styles.statLabel}>Yanlış</Text>
              </View>
            </View>
            
            {wrongAnswers.length > 0 && (
              <View style={styles.wrongAnswersContainer}>
                <Text style={styles.wrongAnswersTitle}>Hataları İncele</Text>
                
                {questions
                  .filter(q => q.userAnswer !== q.correctAnswer)
                  .map((q, index) => (
                    <View key={index} style={styles.wrongAnswerItem}>
                      <Text style={styles.wrongAnswerWord}>{q.word.sourceWord}</Text>
                      <View style={styles.wrongAnswerDetails}>
                        <Text style={styles.wrongAnswerCorrect}>
                          Doğru: {q.correctAnswer}
                        </Text>
                        <Text style={styles.wrongAnswerIncorrect}>
                          Cevabınız: {q.userAnswer}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            )}
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareResults}
              >
                <Share2 size={20} color={colors.primary} />
                <Text style={styles.shareButtonText}>Sonuçları Paylaş</Text>
              </TouchableOpacity>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.restartButton]}
                  onPress={handleRestartQuiz}
                >
                  <Text style={styles.restartButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.finishButton]}
                  onPress={handleFinishQuiz}
                >
                  <Text style={styles.finishButtonText}>Bitir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : (
          <>
            <View style={styles.quizHeader}>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Soru {currentQuestionIndex + 1} / {questions.length}
                </Text>
                <ProgressBar
                  progress={(currentQuestionIndex + 1) / questions.length}
                  height={6}
                  style={styles.progressBar}
                />
              </View>
              
              <View style={styles.timerContainer}>
                <Clock size={16} color={colors.text} />
                <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
              </View>
            </View>
            
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                Şu kelimenin çevirisi nedir:
              </Text>
              <Text style={styles.wordText}>{currentQuestion.word.sourceWord}</Text>
              
              {currentQuestion.word.contextSentence && (
                <Text style={styles.contextText}>
                  "{currentQuestion.word.contextSentence}"
                </Text>
              )}
            </View>
            
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOption === option && styles.selectedOption,
                    isAnswered && option === currentQuestion.correctAnswer && styles.correctOption,
                    isAnswered && selectedOption === option && option !== currentQuestion.correctAnswer && styles.incorrectOption,
                  ]}
                  onPress={() => handleSelectOption(option)}
                  disabled={isAnswered}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === option && styles.selectedOptionText,
                      isAnswered && option === currentQuestion.correctAnswer && styles.correctOptionText,
                      isAnswered && selectedOption === option && option !== currentQuestion.correctAnswer && styles.incorrectOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.scoreIndicator}>
              <Text style={styles.scoreIndicatorText}>
                Puan: {score}/{questions.length}
              </Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  quizHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  progressBar: {
    marginBottom: 8,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  timerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 4,
  },
  questionContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  questionText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  wordText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 12,
    textAlign: "center",
  },
  contextText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666666",
    textAlign: "center",
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: "#e6f7ff",
    borderColor: "#1890ff",
  },
  correctOption: {
    backgroundColor: "rgba(82, 196, 26, 0.1)",
    borderColor: "#52c41a",
  },
  incorrectOption: {
    backgroundColor: "rgba(245, 34, 45, 0.1)",
    borderColor: "#f5222d",
  },
  optionText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#1890ff",
    fontWeight: "600",
  },
  correctOptionText: {
    color: "#52c41a",
    fontWeight: "600",
  },
  incorrectOptionText: {
    color: "#f5222d",
    fontWeight: "600",
  },
  scoreIndicator: {
    alignItems: "center",
  },
  scoreIndicatorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  resultsContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  resultsTrophyContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(250, 173, 20, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 24,
    textAlign: "center",
  },
  scoreContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 12,
  },
  scoreProgress: {
    width: "80%",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666666",
  },
  wrongAnswersContainer: {
    width: "100%",
    marginBottom: 32,
  },
  wrongAnswersTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 16,
  },
  wrongAnswerItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  wrongAnswerWord: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  wrongAnswerDetails: {
    borderLeftWidth: 2,
    borderLeftColor: "#e8e8e8",
    paddingLeft: 12,
  },
  wrongAnswerCorrect: {
    fontSize: 14,
    color: "#52c41a",
    marginBottom: 4,
  },
  wrongAnswerIncorrect: {
    fontSize: 14,
    color: "#f5222d",
  },
  actionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1890ff",
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
  },
  restartButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  finishButton: {
    backgroundColor: "#1890ff",
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  errorText: {
    fontSize: 16,
    color: "#f5222d",
    textAlign: "center",
    marginTop: 24,
  },
});