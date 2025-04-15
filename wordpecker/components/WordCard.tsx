import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Image } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { Word } from "@/types";
import { Check, RotateCcw, Volume2, RefreshCw, ArrowLeft, ArrowRight } from "lucide-react-native";

interface WordCardProps {
  word: Word;
  showTranslation?: boolean;
  onFlip?: () => void;
  onMarkLearned?: () => void;
  onMarkNotLearned?: () => void;
  onPlayPronunciation?: () => void;
  flippable?: boolean;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  showTranslation = false,
  onFlip,
  onMarkLearned,
  onMarkNotLearned,
  onPlayPronunciation,
  flippable = true,
}) => {
  const { colors } = useThemeStore();
  
  // Animation values
  const flipAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const swipeHintAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate flip when showTranslation changes
    Animated.timing(flipAnim, {
      toValue: showTranslation ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
    
    // Start subtle rotation animation for card
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 0.01,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -0.01,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Animate swipe hint
    Animated.loop(
      Animated.sequence([
        Animated.timing(swipeHintAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(swipeHintAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [showTranslation]);

  const handlePressIn = () => {
    if (flippable) {
      Animated.spring(bounceAnim, {
        toValue: 0.95,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (flippable) {
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  };

  // Interpolate for the flip animation
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const frontScale = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.9, 0.9],
  });

  const backScale = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.9, 0.9, 1],
  });
  
  const rotateY = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "90deg", "180deg"],
  });
  
  const cardRotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-1deg", "1deg"],
  });

  // Swipe hint animations
  const leftSwipeOpacity = swipeHintAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  const rightSwipeOpacity = swipeHintAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  const leftSwipeTranslate = swipeHintAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const rightSwipeTranslate = swipeHintAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  return (
    <View style={styles.container}>
      {/* Swipe hint arrows */}
      {(onMarkLearned || onMarkNotLearned) && (
        <View style={styles.swipeHintContainer}>
          <Animated.View 
            style={[
              styles.swipeHintLeft, 
              { 
                opacity: leftSwipeOpacity,
                transform: [{ translateX: leftSwipeTranslate }],
                backgroundColor: colors.errorLight
              }
            ]}
          >
            <ArrowLeft size={24} color={colors.error} />
            <Text style={[styles.swipeHintText, { color: colors.error }]}>Review Again</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.swipeHintRight, 
              { 
                opacity: rightSwipeOpacity,
                transform: [{ translateX: rightSwipeTranslate }],
                backgroundColor: colors.successLight
              }
            ]}
          >
            <Text style={[styles.swipeHintText, { color: colors.success }]}>I Know This</Text>
            <ArrowRight size={24} color={colors.success} />
          </Animated.View>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={flippable ? 0.7 : 1}
        onPress={flippable ? onFlip : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardTouchable}
      >
        <Animated.View 
          style={[
            styles.card, 
            { 
              backgroundColor: colors.card,
              shadowColor: colors.shadow,
              transform: [
                { scale: bounceAnim },
                { rotate: cardRotate }
              ]
            }
          ]}
        >
          {/* Front of card (source word) */}
          <Animated.View 
            style={[
              styles.cardContent,
              {
                opacity: frontOpacity,
                transform: [
                  { scale: frontScale },
                  { rotateY: rotateY }
                ],
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }
            ]}
          >
            <Text style={[styles.wordText, { color: colors.text }]}>
              {word.sourceWord}
            </Text>
            
            {word.imageUrl && (
              <Image 
                source={{ uri: word.imageUrl }} 
                style={styles.wordImage}
                resizeMode="cover"
              />
            )}
            
            {word.contextSentence && (
              <Text style={[styles.sentenceText, { color: colors.textLight }]}>
                {word.contextSentence}
              </Text>
            )}
            
            {word.pronunciation && (
              <TouchableOpacity
                style={[styles.pronunciationButton, { backgroundColor: colors.primaryLight }]}
                onPress={onPlayPronunciation}
              >
                <Volume2 size={20} color={colors.primary} />
                <Text style={[styles.pronunciationText, { color: colors.primary }]}>
                  {word.pronunciation}
                </Text>
              </TouchableOpacity>
            )}
            
            {flippable && (
              <View style={styles.flipHintContainer}>
                <RefreshCw size={16} color={colors.textLight} />
                <Text style={[styles.tapHint, { color: colors.textLight }]}>
                  Tap to see translation
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Back of card (target word) */}
          <Animated.View 
            style={[
              styles.cardContent,
              {
                opacity: backOpacity,
                transform: [
                  { scale: backScale },
                  { rotateY: "180deg" }
                ],
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }
            ]}
          >
            <Text style={[styles.wordText, { color: colors.text }]}>
              {word.targetWord}
            </Text>
            
            {word.imageUrl && (
              <Image 
                source={{ uri: word.imageUrl }} 
                style={styles.wordImage}
                resizeMode="cover"
              />
            )}
            
            {word.contextSentence && (
              <Text style={[styles.sentenceText, { color: colors.textLight }]}>
                {word.contextSentence}
              </Text>
            )}
            
            <View style={styles.translationContainer}>
              <Text style={[styles.translationLabel, { color: colors.textLight }]}>
                Original:
              </Text>
              <Text style={[styles.translationText, { color: colors.text }]}>
                {word.sourceWord}
              </Text>
            </View>
            
            {flippable && (
              <View style={styles.flipHintContainer}>
                <RefreshCw size={16} color={colors.textLight} />
                <Text style={[styles.tapHint, { color: colors.textLight }]}>
                  Tap to see word
                </Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
      
      {(onMarkLearned || onMarkNotLearned) && (
        <View style={styles.actionsContainer}>
          {onMarkNotLearned && (
            <TouchableOpacity
              style={[styles.actionButton, styles.notLearnedButton, { backgroundColor: colors.error }]}
              onPress={onMarkNotLearned}
            >
              <RotateCcw size={24} color="white" />
              <Text style={styles.actionButtonText}>Review Again</Text>
            </TouchableOpacity>
          )}
          
          {onMarkLearned && (
            <TouchableOpacity
              style={[styles.actionButton, styles.learnedButton, { backgroundColor: colors.success }]}
              onPress={onMarkLearned}
            >
              <Check size={24} color="white" />
              <Text style={styles.actionButtonText}>I Know This</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  cardTouchable: {
    width: "90%",
  },
  card: {
    minHeight: 300,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardContent: {
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
    borderRadius: 24,
    backfaceVisibility: "hidden",
  },
  wordText: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  wordImage: {
    width: "80%",
    height: 120,
    borderRadius: 12,
    marginBottom: 20,
  },
  sentenceText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  translationContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  translationLabel: {
    fontSize: 16,
    marginBottom: 6,
  },
  translationText: {
    fontSize: 22,
    fontWeight: "600",
  },
  pronunciationButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 10,
    borderRadius: 12,
  },
  pronunciationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  flipHintContainer: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  tapHint: {
    fontSize: 14,
    fontStyle: "italic",
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  learnedButton: {
  },
  notLearnedButton: {
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
  },
  swipeHintContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  swipeHintLeft: {
    position: 'absolute',
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  swipeHintRight: {
    position: 'absolute',
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  swipeHintText: {
    fontWeight: '600',
    fontSize: 14,
    marginHorizontal: 4,
  }
});