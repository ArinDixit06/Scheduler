import { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Vibration,
  LayoutAnimation,
  Platform,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { usePlannerStore } from '../../store/plannerStore';
import { useFocusStore } from '../../store/focusStore';
import { colors } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function TodayScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const userName = useAuthStore((s) => s.userName) ?? 'Apex User';
  const allTasks = usePlannerStore((s) => s.tasks);
  const habits = usePlannerStore((s) => s.habits);
  const events = usePlannerStore((s) => s.events);
  
  const completeTask = usePlannerStore((s) => s.completeTask);
  const toggleHabit = usePlannerStore((s) => s.toggleHabit);

  // Global persistent Focus Timer
  const { secondsLeft, isRunning, currentPhase, startTimer, pauseTimer } = useFocusStore();

  const [energy, setEnergy] = useState(4);
  const tasks = useMemo(() => allTasks.filter((t) => t.status !== 'DONE').slice(0, 3), [allTasks]);

  // Current Date display (e.g., "Monday, Oct 24")
  const getCurrentDateString = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const toggleTaskComplete = (taskId: string) => {
    Vibration.vibrate(12);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    completeTask(taskId);
  };

  const getProjectColor = (project?: string) => {
    if (!project) return '#6B7280';
    const name = project.toLowerCase();
    if (name.includes('mobile')) return '#3B82F6';
    if (name.includes('operations')) return '#10B981';
    if (name.includes('strategy')) return '#8B5CF6';
    return '#EC4899';
  };

  const handleToggleTimer = () => {
    Vibration.vibrate(10);
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* 1. Top App Bar */}
      <View style={styles.topAppBar}>
        <View style={styles.profileBadge}>
          <Text style={styles.profileText}>{userName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.dateLabel}>{getCurrentDateString()}</Text>
          <Text style={styles.welcomeLabel}>Hello, {userName}</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('More', { screen: 'AI' })}
          style={styles.intelligenceIcon}
          android_ripple={{ color: colors.border }}
        >
          <Text style={styles.intelligenceEmoji}>🤖</Text>
        </Pressable>
      </View>

      {/* 2. Hero Pomodoro Timer Section */}
      <View style={styles.heroCard}>
        <View style={styles.heroTimerDetails}>
          <Text style={styles.heroStatusLabel}>POMODORO STATUS</Text>
          <Text style={styles.heroPhaseLabel}>{currentPhase.toUpperCase()}</Text>
          <Text style={styles.heroTimeLabel}>{formatTime(secondsLeft)}</Text>
        </View>
        <Pressable
          onPress={handleToggleTimer}
          style={[styles.focusButton, isRunning && styles.focusButtonActive]}
          android_ripple={{ color: '#FFFFFF' }}
        >
          <Text style={styles.focusButtonEmoji}>{isRunning ? '⏸️' : '⚡'}</Text>
          <Text style={styles.focusButtonText}>{isRunning ? 'Pause' : 'Focus'}</Text>
        </Pressable>
      </View>

      {/* 3. High Priority Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderTitle}>High Priority Work</Text>
        <Pressable onPress={() => navigation.navigate('TasksTab', { screen: 'TaskList' })}>
          <Text style={styles.sectionHeaderAction}>All Tasks</Text>
        </Pressable>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyCardText}>All primary work items completed! 🎉</Text>
        </View>
      ) : (
        tasks.map((task) => {
          const accentColor = getProjectColor(task.projectName);
          return (
            <View key={task.id} style={[styles.taskCard, { borderLeftColor: accentColor }]}>
              <Pressable
                onPress={() => toggleTaskComplete(task.id)}
                style={styles.circularCheckbox}
              >
                <View style={styles.checkboxCircleInner} />
              </Pressable>
              
              <Pressable
                onPress={() => navigation.navigate('TasksTab', { screen: 'TaskDetail', params: { taskId: task.id } })}
                style={styles.taskCardContent}
              >
                <Text style={styles.taskCardTitle}>{task.title}</Text>
                <View style={styles.taskMetaRow}>
                  <Text style={styles.taskMetaBadge}>{task.projectName || 'Inbox'}</Text>
                  <Text style={styles.taskMetaDot}>•</Text>
                  <Text style={styles.taskMetaText}>{task.estimatedMinutes} mins</Text>
                </View>
              </Pressable>
            </View>
          );
        })
      )}

      {/* 4. Daily Habits Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderTitle}>Daily Habits</Text>
        <Pressable onPress={() => navigation.navigate('More', { screen: 'Habits' })}>
          <Text style={styles.sectionHeaderAction}>View All</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.habitsScroll}
        style={styles.habitsContainer}
      >
        {habits.map((habit) => {
          const isCompleted = habit.completedToday;
          return (
            <Pressable
              key={habit.id}
              style={[styles.habitSquareCard, isCompleted && styles.habitSquareCardCompleted]}
              onPress={() => {
                Vibration.vibrate(8);
                toggleHabit(habit.id);
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              }}
            >
              <View style={[styles.habitIconBg, { backgroundColor: isCompleted ? '#3B82F6' : colors.surfaceSecondary }]}>
                <Text style={styles.habitEmoji}>
                  {habit.title.toLowerCase().includes('water') || habit.title.toLowerCase().includes('hydration') ? '💧' :
                   habit.title.toLowerCase().includes('walk') ? '🚶' :
                   habit.title.toLowerCase().includes('morning') || habit.title.toLowerCase().includes('review') ? '⚡' : '🎯'}
                </Text>
              </View>
              <Text style={styles.habitCardTitle} numberOfLines={1}>{habit.title}</Text>
              <Text style={styles.habitCardStreak}>{habit.streak}d streak</Text>
              
              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBarFilled, { width: isCompleted ? '100%' : '30%', backgroundColor: isCompleted ? '#10B981' : '#3B82F6' }]} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 5. Upcoming Events Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderTitle}>Upcoming Events</Text>
        <Pressable onPress={() => navigation.navigate('CalendarTab', { screen: 'CalendarHome' })}>
          <Text style={styles.sectionHeaderAction}>Schedule</Text>
        </Pressable>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyCardText}>No meetings scheduled today.</Text>
        </View>
      ) : (
        events.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventLeftContent}>
              <Text style={styles.eventTimeLabel}>{event.startAt} – {event.endAt}</Text>
              <Text style={styles.eventTitleLabel}>{event.title}</Text>
              
              {/* Attendee avatars stack */}
              <View style={styles.avatarRow}>
                <View style={[styles.avatarCircle, { backgroundColor: '#3B82F6' }]}><Text style={styles.avatarTextShort}>AD</Text></View>
                <View style={[styles.avatarCircle, { backgroundColor: '#10B981', marginLeft: -6 }]}><Text style={styles.avatarTextShort}>MK</Text></View>
                <View style={[styles.avatarCircle, { backgroundColor: '#8B5CF6', marginLeft: -6 }]}><Text style={styles.avatarTextShort}>+2</Text></View>
              </View>
            </View>

            <Pressable
              onPress={() => {
                Vibration.vibrate(15);
                // Simulated Virtual meeting launching chime
              }}
              style={styles.joinButton}
              android_ripple={{ color: '#FFFFFF' }}
            >
              <Text style={styles.joinButtonText}>Join</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 0
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E24',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  titleContainer: {
    flex: 1
  },
  dateLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  welcomeLabel: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '800'
  },
  intelligenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  intelligenceEmoji: {
    fontSize: 18
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1E1E24',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  heroTimerDetails: {
    flex: 1
  },
  heroStatusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 1
  },
  heroPhaseLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2
  },
  heroTimeLabel: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 1
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3
  },
  focusButtonActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444'
  },
  focusButtonEmoji: {
    fontSize: 14,
    marginRight: 6,
    color: '#FFFFFF'
  },
  focusButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 10
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  sectionHeaderAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6'
  },
  emptyCard: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20
  },
  emptyCardText: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600'
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 5.5,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  circularCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  checkboxCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent'
  },
  taskCardContent: {
    flex: 1
  },
  taskCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  taskMetaBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B82F6',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  taskMetaDot: {
    fontSize: 10,
    color: colors.textLight,
    marginHorizontal: 6
  },
  taskMetaText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600'
  },
  habitsContainer: {
    marginBottom: 20
  },
  habitsScroll: {
    gap: 12,
    paddingRight: 20
  },
  habitSquareCard: {
    width: 112,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'flex-start',
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1
  },
  habitSquareCardCompleted: {
    borderColor: '#3B82F6'
  },
  habitIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  habitEmoji: {
    fontSize: 15
  },
  habitCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2
  },
  habitCardStreak: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 10
  },
  progressContainer: {
    height: 4,
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBarFilled: {
    height: '100%',
    borderRadius: 2
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1
  },
  eventLeftContent: {
    flex: 1
  },
  eventTimeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3B82F6',
    textTransform: 'uppercase'
  },
  eventTitleLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
    marginBottom: 8
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarTextShort: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800'
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 2
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});
