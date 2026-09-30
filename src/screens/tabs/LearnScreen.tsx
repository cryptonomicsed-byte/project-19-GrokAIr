import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '@/utils/colors';
import { Button, Card, Timer } from '@/components';
import { useUserStore } from '@/stores/userStore';

interface Lesson {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  completed: boolean;
  xpReward: number;
}

export const LearnScreen: React.FC = () => {
  const userProfile = useUserStore((state) => state.profile);
  const [lessons, setLessons] = useState<Lesson[]>([
    {
      id: '1',
      title: 'Basic Greetings',
      description: 'Learn hello, goodbye, and common phrases',
      language: 'es',
      difficulty: 'beginner',
      duration: 5,
      completed: false,
      xpReward: 10,
    },
    {
      id: '2',
      title: 'Numbers 1-10',
      description: 'Master counting from one to ten',
      language: 'es',
      difficulty: 'beginner',
      duration: 7,
      completed: false,
      xpReward: 15,
    },
  ]);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [inLesson, setInLesson] = useState(false);

  const completedCount = lessons.filter((l) => l.completed).length;

  const handleStartLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setInLesson(true);
  };

  const handleCompleteLesson = () => {
    if (!selectedLesson) return;

    setLessons(
      lessons.map((l) =>
        l.id === selectedLesson.id ? { ...l, completed: true } : l
      )
    );
    setInLesson(false);
    setSelectedLesson(null);
  };

  if (inLesson && selectedLesson) {
    return <LessonContent lesson={selectedLesson} onComplete={handleCompleteLesson} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Streak and XP Header */}
      <View style={styles.header}>
        <Card style={styles.streakCard}>
          <View style={styles.streakContent}>
            <Text style={styles.streakLabel}>Daily Streak</Text>
            <Text style={styles.streakNumber}>{userProfile?.streakDays || 0}</Text>
            <Text style={styles.streakSub}>🔥 Keep it up!</Text>
          </View>
        </Card>

        <Card style={styles.xpCard}>
          <View style={styles.streakContent}>
            <Text style={styles.streakLabel}>Total XP</Text>
            <Text style={styles.streakNumber}>{userProfile?.totalXP || 0}</Text>
            <Text style={styles.streakSub}>Level 5</Text>
          </View>
        </Card>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Today's Lessons</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(completedCount / lessons.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {completedCount} of {lessons.length} completed
        </Text>
      </View>

      {/* Lessons List */}
      <View style={styles.lessonsSection}>
        {lessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.id}
            onPress={() => handleStartLesson(lesson)}
            disabled={lesson.completed}
          >
            <Card style={[styles.lessonCard, lesson.completed && styles.completedCard]}>
              <View style={styles.lessonHeader}>
                <View style={styles.lessonTitleSection}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDesc}>{lesson.description}</Text>
                </View>
                {lesson.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>

              <View style={styles.lessonFooter}>
                <View style={styles.lessonMeta}>
                  <Text style={styles.metaText}>⏱ {lesson.duration} min</Text>
                  <Text style={styles.metaText}>⭐ {lesson.xpReward} XP</Text>
                </View>
                {!lesson.completed && (
                  <Text style={styles.actionText}>Start →</Text>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const LessonContent: React.FC<{ lesson: Lesson; onComplete: () => void }> = ({
  lesson,
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    { title: 'Listen', content: 'Example phrase in ' + lesson.language },
    { title: 'Repeat', content: 'Try saying it aloud' },
    { title: 'Learn', content: 'Translation and grammar tips' },
  ];

  return (
    <View style={styles.lessonContainer}>
      <Text style={styles.lessonTitle}>{lesson.title}</Text>

      <View style={styles.contentBox}>
        <Text style={styles.contentTitle}>{steps[step].title}</Text>
        <Text style={styles.contentText}>{steps[step].content}</Text>

        <Button
          title={isPlaying ? 'Playing...' : '🔊 Speak'}
          onPress={() => setIsPlaying(!isPlaying)}
          variant="secondary"
          size="large"
          style={styles.playButton}
        />
      </View>

      <View style={styles.navigationButtons}>
        <Button
          title="Back"
          onPress={() => setStep(Math.max(0, step - 1))}
          variant="outline"
          disabled={step === 0}
        />
        <Button
          title={step === steps.length - 1 ? 'Complete' : 'Next'}
          onPress={() => {
            if (step === steps.length - 1) {
              onComplete();
            } else {
              setStep(step + 1);
            }
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  streakCard: {
    flex: 1,
    backgroundColor: colors.pastelOrange,
  },
  xpCard: {
    flex: 1,
    backgroundColor: colors.pastelPurple,
  },
  streakContent: {
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  streakSub: {
    fontSize: 12,
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: colors.textLight,
  },
  lessonsSection: {
    marginBottom: 20,
    gap: 12,
  },
  lessonCard: {
    backgroundColor: colors.pastelBlue,
    marginBottom: 0,
  },
  completedCard: {
    opacity: 0.6,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lessonTitleSection: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  lessonDesc: {
    fontSize: 13,
    color: colors.textLight,
  },
  checkmark: {
    fontSize: 24,
    color: colors.success,
    marginLeft: 8,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 12,
    color: colors.textLight,
  },
  actionText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },

  // Lesson content styles
  lessonContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'space-between',
  },
  contentBox: {
    backgroundColor: colors.pastelGreen,
    borderRadius: 16,
    padding: 24,
    marginVertical: 40,
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  playButton: {
    width: 120,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
});
