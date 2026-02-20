/**
 * StudySessionScreen — card queue for both Study and SRS modes.
 * Shows cards one at a time with reveal, practice, demo, and grading.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { getKanjiData } from '../data/kanjiDataService';
import { StudyCard } from '../components/StudyCard';
import { KanjiCanvas } from '../components/KanjiCanvas';
import { StrokeAnimatorWithReplay } from '../components/StrokeAnimatorWithReplay';
import { Icon } from '../components/Icon';
import { useStudySession } from '../hooks/useStudySession';
import { useFSRS } from '../hooks/useFSRS';
import { Rating, getDueCards } from '../utils/spacedRepetition';
import { StudyMode } from '../config/studyConfig';
import {
  fonts,
  spacing,
  borderRadius,
  typography,
  getShadow,
  useThemedStyles,
  useTheme,
} from '../theme';
import { ColorScheme } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type SessionRoute = RouteProp<RootStackParamList, 'StudySession'>;
type SessionNavProp = NativeStackNavigationProp<RootStackParamList, 'StudySession'>;

const createStyles = (colors: ColorScheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  progressBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  progressText: {
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sansMedium,
    color: colors.secondary,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  progressFill: {
    height: '100%' as const,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  exitButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  exitText: {
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sansMedium,
    color: colors.muted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContent: {
    width: '90%' as const,
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    ...getShadow(colors, 'high'),
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.serifBold,
    color: colors.primary,
    textAlign: 'center' as const,
    marginBottom: spacing.lg,
  },
  demoContainer: {
    alignItems: 'center' as const,
    marginVertical: spacing.md,
  },
  // Complete screen
  completeContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: spacing.xl,
  },
  completeIconContainer: {
    marginBottom: spacing.lg,
  },
  completeTitle: {
    fontSize: 24,
    fontFamily: fonts.serifBold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  completeSubtitle: {
    fontSize: typography.body.fontSize,
    fontFamily: fonts.sans,
    color: colors.secondary,
    textAlign: 'center' as const,
    marginBottom: spacing.xl,
  },
  completeStat: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    width: '100%' as const,
    maxWidth: 280,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  completeStatLabel: {
    fontSize: typography.body.fontSize,
    fontFamily: fonts.sans,
    color: colors.secondary,
  },
  completeStatValue: {
    fontSize: typography.body.fontSize,
    fontFamily: fonts.serifBold,
    color: colors.primary,
  },
  doneButton: {
    alignItems: 'center' as const,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xxxl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    marginTop: spacing.xl,
    ...getShadow(colors, 'medium'),
  },
  doneButtonText: {
    fontSize: typography.button.fontSize,
    fontFamily: fonts.sansBold,
    color: colors.accentText,
  },
});

export function StudySessionScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<SessionNavProp>();
  const route = useRoute<SessionRoute>();

  const {
    sessionType = 'study',
    mode = 'regular',
    shuffle = false,
    kanjiCharacters = [],
  } = route.params ?? {};

  const isSRS = sessionType === 'srs';

  // Load full kanji data for characters
  const [deck, setDeck] = useState<KanjiVGData[]>([]);
  const [loading, setLoading] = useState(true);
  const { cards: fsrsCards, grade: gradeFSRS } = useFSRS();

  useEffect(() => {
    let cancelled = false;
    const loadDeck = async () => {
      const kanjiData: KanjiVGData[] = [];
      for (const char of kanjiCharacters) {
        const data = await getKanjiData(char);
        if (data) kanjiData.push(data);
      }

      if (cancelled) return;

      if (isSRS) {
        // For SRS, filter to only due cards + some new cards
        const dueChars = new Set(
          getDueCards(fsrsCards).map((c) => c.character)
        );
        const dueKanji = kanjiData.filter((k) => dueChars.has(k.character));
        // Add a few new cards
        const newKanji = kanjiData
          .filter((k) => !dueChars.has(k.character))
          .slice(0, 5);
        setDeck([...dueKanji, ...newKanji]);
      } else {
        setDeck(kanjiData);
      }
      setLoading(false);
    };
    loadDeck();
    return () => { cancelled = true; };
  }, [kanjiCharacters, isSRS, fsrsCards]);

  const session = useStudySession({
    deck,
    mode: mode as StudyMode,
    shuffle,
  });

  // Modal states
  const [showPractice, setShowPractice] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const canvasSize = Math.min(width - 80, 300);

  // Get FSRS card state for current kanji
  const currentFSRSCard = useMemo(() => {
    if (!session.currentCard || !isSRS) return undefined;
    return fsrsCards.find((c) => c.character === session.currentCard!.character);
  }, [session.currentCard, fsrsCards, isSRS]);

  const handleGrade = useCallback(
    async (rating: Rating) => {
      if (!session.currentCard) return;
      await gradeFSRS(session.currentCard.character, rating);
      session.nextCard();
    },
    [session, gradeFSRS]
  );

  const handleNext = useCallback(() => {
    session.nextCard();
  }, [session]);

  if (loading || deck.length === 0) {
    return (
      <View style={[styles.container, styles.completeContainer]}>
        <Text style={styles.completeTitle}>
          {loading ? 'Loading...' : 'No cards to study'}
        </Text>
        <Pressable style={styles.doneButton} onPress={() => navigation.goBack()}>
          <Text style={styles.doneButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Session complete
  if (session.isComplete) {
    return (
      <View style={[styles.container, styles.completeContainer]}>
        <View style={styles.completeIconContainer}>
          <Icon name="award" size={48} color={colors.accent} />
        </View>
        <Text style={styles.completeTitle}>Session Complete!</Text>
        <Text style={styles.completeSubtitle}>
          {isSRS
            ? 'Great job reviewing your kanji!'
            : 'You studied all the cards in your deck.'}
        </Text>
        <View style={styles.completeStat}>
          <Text style={styles.completeStatLabel}>Cards reviewed</Text>
          <Text style={styles.completeStatValue}>{session.totalCards}</Text>
        </View>
        <View style={styles.completeStat}>
          <Text style={styles.completeStatLabel}>Session type</Text>
          <Text style={styles.completeStatValue}>
            {isSRS ? 'SRS Review' : 'Study'}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.doneButton,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  const { currentCard } = session;
  if (!currentCard) return null;

  const progress = (session.currentIndex + 1) / session.totalCards;

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <Text style={styles.progressText}>
          {session.currentIndex + 1} / {session.totalCards}
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <Pressable
          style={styles.exitButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.exitText}>Exit</Text>
        </Pressable>
      </View>

      {/* Card */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StudyCard
          kanji={currentCard}
          mode={session.effectiveMode}
          isRevealed={session.state !== 'front_shown'}
          onReveal={session.reveal}
          onPractice={() => {
            session.startPractice();
            setShowPractice(true);
          }}
          onDemo={() => setShowDemo(true)}
          showGradeButtons={isSRS}
          onGrade={isSRS ? handleGrade : undefined}
          onNext={!isSRS ? handleNext : undefined}
          cardState={currentFSRSCard}
        />
      </ScrollView>

      {/* Practice modal */}
      <Modal
        visible={showPractice}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowPractice(false);
          session.exitPractice();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentCard.character}</Text>
            <View style={{ alignItems: 'center' }}>
              <KanjiCanvas
                key={`practice-${currentCard.character}`}
                width={canvasSize}
                height={canvasSize}
                strokeWidth={8}
                expectedKanji={currentCard}
                canvasMode="practice"
                strokeMode="basic"
              />
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.doneButton,
                { opacity: pressed ? 0.85 : 1, alignSelf: 'center', marginTop: spacing.md },
              ]}
              onPress={() => {
                setShowPractice(false);
                session.exitPractice();
              }}
            >
              <Text style={styles.doneButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Demo modal */}
      <Modal
        visible={showDemo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDemo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentCard.character}</Text>
            <View style={styles.demoContainer}>
              <StrokeAnimatorWithReplay
                kanjiVGData={currentCard}
                width={canvasSize}
                height={canvasSize}
              />
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.doneButton,
                { opacity: pressed ? 0.85 : 1, alignSelf: 'center', marginTop: spacing.md },
              ]}
              onPress={() => setShowDemo(false)}
            >
              <Text style={styles.doneButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
