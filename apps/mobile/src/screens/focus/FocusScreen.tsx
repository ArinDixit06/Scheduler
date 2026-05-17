import { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Vibration,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  LayoutAnimation,
  Platform
} from 'react-native';
import { usePlannerStore } from '../../store/plannerStore';
import { colors } from '../../constants/colors';
import { useFocusStore } from '../../store/focusStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Phase = 'Focus' | 'Short Break' | 'Long Break';

export function FocusScreen() {
  const allEvents = usePlannerStore((s) => s.events);
  const allHabits = usePlannerStore((s) => s.habits);
  const focusHistory = usePlannerStore((s) => s.focusHistory);
  const addFocusSession = usePlannerStore((s) => s.addFocusSession);

  const {
    focusSetting,
    shortBreakSetting,
    longBreakSetting,
    currentPhase,
    secondsLeft,
    isRunning,
    completedSessions,
    linkedTaskName,
    setFocusSetting,
    setShortBreakSetting,
    setLongBreakSetting,
    setLinkedTaskName,
    startTimer,
    pauseTimer,
    resetTimer,
    skipPhase
  } = useFocusStore();

  const [isTaskPickerVisible, setIsTaskPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Daily statistics summary
  const stats = useMemo(() => {
    const totalMinutes = focusHistory.reduce((acc, f) => acc + f.plannedMinutes, 0);
    return {
      minutes: totalMinutes,
      sessions: focusHistory.length
    };
  }, [focusHistory]);

  // Ambient Halo Animations (Slow breathing rings)
  const haloScale1 = useRef(new Animated.Value(1)).current;
  const haloOpacity1 = useRef(new Animated.Value(0.3)).current;
  const haloScale2 = useRef(new Animated.Value(1)).current;
  const haloOpacity2 = useRef(new Animated.Value(0.15)).current;

  // Active Session Dot pulsing
  const dotPulse = useRef(new Animated.Value(0.5)).current;

  // Run Ambient Looping Animation when active
  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | null = null;
    let dotLoop: Animated.CompositeAnimation | null = null;

    if (isRunning) {
      animationLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(haloScale1, { toValue: 1.25, duration: 3000, useNativeDriver: true }),
            Animated.timing(haloScale1, { toValue: 1.0, duration: 3000, useNativeDriver: true })
          ]),
          Animated.sequence([
            Animated.timing(haloOpacity1, { toValue: 0.05, duration: 3000, useNativeDriver: true }),
            Animated.timing(haloOpacity1, { toValue: 0.3, duration: 3000, useNativeDriver: true })
          ]),
          Animated.sequence([
            Animated.timing(haloScale2, { toValue: 1.4, duration: 4000, useNativeDriver: true }),
            Animated.timing(haloScale2, { toValue: 1.0, duration: 4000, useNativeDriver: true })
          ]),
          Animated.sequence([
            Animated.timing(haloOpacity2, { toValue: 0.02, duration: 4000, useNativeDriver: true }),
            Animated.timing(haloOpacity2, { toValue: 0.15, duration: 4000, useNativeDriver: true })
          ])
        ])
      );
      animationLoop.start();

      dotLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(dotPulse, { toValue: 1.0, duration: 1000, useNativeDriver: true }),
          Animated.timing(dotPulse, { toValue: 0.4, duration: 1000, useNativeDriver: true })
        ])
      );
      dotLoop.start();
    } else {
      haloScale1.setValue(1);
      haloOpacity1.setValue(0.1);
      haloScale2.setValue(1);
      haloOpacity2.setValue(0.05);
      dotPulse.setValue(0.8);
      if (animationLoop) (animationLoop as any).stop();
      if (dotLoop) (dotLoop as any).stop();
    }

    return () => {
      if (animationLoop) (animationLoop as any).stop();
      if (dotLoop) (dotLoop as any).stop();
    };
  }, [isRunning]);

  const handleSkipPhase = () => {
    skipPhase();
  };

  const handleResetTimer = () => {
    Vibration.vibrate(8);
    resetTimer();
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  // Calculate depleting border ratio
  const maxDuration =
    currentPhase === 'Focus'
      ? focusSetting * 60
      : currentPhase === 'Short Break'
        ? shortBreakSetting * 60
        : longBreakSetting * 60;
  const progressRatio = secondsLeft / maxDuration;

  // Search/Filter items for Task Picker Modal
  const filteredTasksAndEvents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const calendarOptions = allEvents
      .filter(e => e.title.toLowerCase().includes(query))
      .map(e => ({ id: e.id, title: e.title, type: '📅 Calendar Event' }));
    
    const habitOptions = allHabits
      .filter(h => h.title.toLowerCase().includes(query))
      .map(h => ({ id: h.id, title: h.title, type: '⚡ Habit Target' }));

    return [...calendarOptions, ...habitOptions];
  }, [allEvents, allHabits, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Active breathing halo wrappers */}
      <View style={styles.centerFocusZone}>
        {/* Looping ambient rings behind the main circle */}
        <Animated.View
          style={[
            styles.ambientRing,
            styles.ambientRing1,
            {
              transform: [{ scale: haloScale1 }],
              opacity: haloOpacity1
            }
          ]}
        />
        <Animated.View
          style={[
            styles.ambientRing,
            styles.ambientRing2,
            {
              transform: [{ scale: haloScale2 }],
              opacity: haloOpacity2
            }
          ]}
        />

        {/* 1. Large Circular Timer Display */}
        <View
          style={[
            styles.timerCircle,
            {
              borderColor: isRunning ? colors.primary : colors.border
            }
          ]}
        >
          {/* Circular border progress overlay */}
          <View style={styles.timerInnerContainer}>
            <Text style={styles.timeLabel}>{formatTime(secondsLeft)}</Text>
          </View>
        </View>

        {/* 2. Session Phase Label */}
        <Text style={styles.sessionPhaseText}>{currentPhase.toUpperCase()}</Text>

        {/* 3. Session dots row (Pomodoro cycle tracker) */}
        <View style={styles.dotsRow}>
          {Array.from({ length: 4 }).map((_, idx) => {
            const isCompleted = idx < completedSessions % 4;
            const isActive = idx === completedSessions % 4 && currentPhase === 'Focus';

            return (
              <Animated.View
                key={idx}
                style={[
                  styles.sessionDot,
                  isCompleted && styles.sessionDotCompleted,
                  isActive && styles.sessionDotActive,
                  isActive && { opacity: dotPulse }
                ]}
              />
            );
          })}
        </View>

        {/* 4. Center Pill Control Buttons */}
        <View style={styles.controlsRow}>
          <Pressable onPress={handleSkipPhase} style={styles.controlPill}>
            <Text style={styles.controlPillText}>Skip</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Vibration.vibrate(10);
              if (isRunning) {
                pauseTimer();
              } else {
                startTimer();
              }
            }}
            style={[styles.controlPill, styles.controlPillPrimary]}
          >
            <Text style={[styles.controlPillText, styles.controlPillTextPrimary]}>
              {isRunning ? 'Pause' : 'Start'}
            </Text>
          </Pressable>

          <Pressable onPress={handleResetTimer} style={styles.controlPill}>
            <Text style={styles.controlPillText}>Reset</Text>
          </Pressable>
        </View>
      </View>

      {/* 5. Bottom Panel Details & Stepper Settings */}
      <View style={styles.bottomPanel}>
        <View style={styles.panelHandle} />

        {/* Current Task Selector Section */}
        <View style={styles.sectionRow}>
          <View>
            <Text style={styles.sectionRowLabel}>Linked Task</Text>
            <Text style={styles.sectionRowValue}>
              {linkedTaskName || 'No task linked'}
            </Text>
          </View>
          <Pressable
            onPress={() => setIsTaskPickerVisible(true)}
            style={styles.editTaskButton}
            android_ripple={{ color: colors.border }}
          >
            <Text style={styles.editTaskButtonIcon}>✏️</Text>
          </Pressable>
        </View>

        {/* Today's Focus Summary statistics */}
        <View style={styles.statsCardGrid}>
          <View style={styles.statsCardCell}>
            <Text style={styles.statsCardValue}>{stats.minutes}m</Text>
            <Text style={styles.statsCardLabel}>Focused Time</Text>
          </View>
          <View style={styles.statsCardCell}>
            <Text style={styles.statsCardValue}>{stats.sessions}</Text>
            <Text style={styles.statsCardLabel}>Sessions Done</Text>
          </View>
        </View>

        {/* Stepper controls list (Focus / Short Break / Long Break durations) */}
        <Text style={styles.stepperSectionTitle}>Session Settings</Text>
        <View style={styles.steppersList}>
          {/* Stepper 1 - Focus */}
          <View style={styles.stepperRow}>
            <Text style={styles.stepperLabel}>Focus block</Text>
            <View style={styles.stepperContainer}>
              <Pressable
                disabled={isRunning}
                onPress={() => setFocusSetting(Math.max(5, focusSetting - 5))}
                style={[styles.stepperButton, isRunning && styles.stepperButtonDisabled]}
              >
                <Text style={styles.stepperButtonText}>-</Text>
              </Pressable>
              <Text style={styles.stepperValueText}>{focusSetting}m</Text>
              <Pressable
                disabled={isRunning}
                onPress={() => setFocusSetting(Math.min(60, focusSetting + 5))}
                style={[styles.stepperButton, isRunning && styles.stepperButtonDisabled]}
              >
                <Text style={styles.stepperButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          {/* Stepper 2 - Short Break */}
          <View style={styles.stepperRow}>
            <Text style={styles.stepperLabel}>Short break</Text>
            <View style={styles.stepperContainer}>
              <Pressable
                disabled={isRunning}
                onPress={() => setShortBreakSetting(Math.max(1, shortBreakSetting - 1))}
                style={[styles.stepperButton, isRunning && styles.stepperButtonDisabled]}
              >
                <Text style={styles.stepperButtonText}>-</Text>
              </Pressable>
              <Text style={styles.stepperValueText}>{shortBreakSetting}m</Text>
              <Pressable
                disabled={isRunning}
                onPress={() => setShortBreakSetting(Math.min(15, shortBreakSetting + 1))}
                style={[styles.stepperButton, isRunning && styles.stepperButtonDisabled]}
              >
                <Text style={styles.stepperButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          {/* Stepper 3 - Long Break */}
          <View style={styles.stepperRow}>
            <Text style={styles.stepperLabel}>Long break</Text>
            <View style={styles.stepperContainer}>
              <Pressable
                disabled={isRunning}
                onPress={() => setLongBreakSetting(Math.max(5, longBreakSetting - 5))}
                style={[styles.stepperButton, isRunning && styles.stepperButtonDisabled]}
              >
                <Text style={styles.stepperButtonText}>-</Text>
              </Pressable>
              <Text style={styles.stepperValueText}>{longBreakSetting}m</Text>
              <Pressable
                disabled={isRunning}
                onPress={() => setLongBreakSetting(Math.min(30, longBreakSetting + 5))}
                style={[styles.stepperButton, isRunning && styles.stepperButtonDisabled]}
              >
                <Text style={styles.stepperButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Task Linker Searchable Modal Picker */}
      <Modal
        visible={isTaskPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTaskPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismissArea} onPress={() => setIsTaskPickerVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.modalTitle}>Link a task</Text>
            
            {/* Search Input */}
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search active events & habits..."
              placeholderTextColor={colors.textLight}
              style={styles.modalSearchInput}
            />

            <ScrollView contentContainerStyle={styles.modalList}>
              {filteredTasksAndEvents.length === 0 ? (
                <Text style={styles.modalEmptyText}>No matching activities found.</Text>
              ) : (
                filteredTasksAndEvents.map((item) => (
                  <Pressable
                    key={`${item.id}-${item.type}`}
                    onPress={() => {
                      setLinkedTaskName(item.title);
                      setIsTaskPickerVisible(false);
                      setSearchQuery('');
                      Vibration.vibrate(8);
                    }}
                    style={styles.modalItemRow}
                  >
                    <Text style={styles.modalItemTitle}>{item.title}</Text>
                    <Text style={styles.modalItemBadge}>{item.type}</Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  centerFocusZone: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  ambientRing: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.primary,
    pointerEvents: 'none'
  },
  ambientRing1: {
    width: 250,
    height: 250
  },
  ambientRing2: {
    width: 270,
    height: 270
  },
  timerCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 6,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 3
  },
  timerInnerContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  timeLabel: {
    fontSize: 44,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 2
  },
  sessionPhaseText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSubdued,
    letterSpacing: 3,
    marginTop: 24,
    textTransform: 'uppercase'
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    marginBottom: 24
  },
  sessionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border
  },
  sessionDotCompleted: {
    backgroundColor: colors.primary
  },
  sessionDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
    borderWidth: 2
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  controlPill: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  controlPillPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12
  },
  controlPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSubdued
  },
  controlPillTextPrimary: {
    color: colors.white
  },

  // Bottom panel styles
  bottomPanel: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3
  },
  panelHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  sectionRowLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  sectionRowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  editTaskButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  editTaskButtonIcon: {
    fontSize: 14
  },
  statsCardGrid: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16
  },
  statsCardCell: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  statsCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  statsCardLabel: {
    fontSize: 10,
    color: colors.textSubdued,
    fontWeight: '600'
  },
  stepperSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  steppersList: {
    gap: 10
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stepperLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSubdued
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  stepperButtonDisabled: {
    opacity: 0.4
  },
  stepperButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18
  },
  stepperValueText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 32,
    textAlign: 'center'
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20
  },

  // Task Linker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end'
  },
  modalDismissArea: {
    flex: 1
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    height: '60%'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16
  },
  modalSearchInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  modalList: {
    gap: 8
  },
  modalEmptyText: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: 20
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12
  },
  modalItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  modalItemBadge: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '700'
  }
});
