import { useState, useRef, useMemo, ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Vibration,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { usePlannerStore } from '../../store/plannerStore';
import { colors } from '../../constants/colors';
import type { Habit } from '../../types';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Available Icons for Habit Selector
const HABIT_ICONS = [
  { id: 'book', char: '📖', label: 'Reading' },
  { id: 'droplet', char: '💧', label: 'Hydration' },
  { id: 'dumbbell', char: '💪', label: 'Workout' },
  { id: 'moon', char: '🌙', label: 'Sleep' },
  { id: 'apple', char: '🍎', label: 'Nutrition' },
  { id: 'lotus', char: '🧘', label: 'Meditation' },
  { id: 'check', char: '✅', label: 'Checkoff' },
  { id: 'run', char: '🏃', label: 'Cardio' }
];

export function HabitsScreen() {
  const habits = usePlannerStore((s) => s.habits);
  const toggleHabit = usePlannerStore((s) => s.toggleHabit);
  const addHabitStore = usePlannerStore((s) => s.addHabit);

  // Local habits management for enhanced features (swiping, custom targets, details)
  const [localHabits, setLocalHabits] = useState<Habit[]>(() => {
    // Map initial store habits to richer structure if needed
    return habits.map(h => ({
      ...h,
      // Adding extra default fields for premium mockup matching prompt
      targetValue: h.id === 'h1' ? 1 : 8, // Morning review: 1 time, Walk outside: 8 glasses/steps
      currentValue: h.completedToday ? (h.id === 'h1' ? 1 : 6) : 0,
      unit: h.id === 'h1' ? 'session' : 'glasses',
      iconId: h.id === 'h1' ? 'book' : 'run'
    } as any));
  });

  // Active Selected Day in the 7-day strip
  const [selectedDayIdx, setSelectedDayIdx] = useState(6); // default to today (Sunday/Saturday/etc.)

  // FAB bottom sheets state
  const [isNewHabitSheetVisible, setIsNewHabitSheetVisible] = useState(false);
  const [isDetailSheetVisible, setIsDetailSheetVisible] = useState(false);
  const [activeDetailHabit, setActiveDetailHabit] = useState<any | null>(null);

  // New Habit form state
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('book');
  const [newFrequency, setNewFrequency] = useState<'DAILY' | 'WEEKDAYS' | 'CUSTOM'>('DAILY');
  const [newTargetQty, setNewTargetQty] = useState('8');
  const [newTargetUnit, setNewTargetUnit] = useState('glasses');
  const [newReminderTime, setNewReminderTime] = useState('08:00 AM');
  const [isReminderOn, setIsReminderOn] = useState(true);

  // Top summary bar calculations
  const stats = useMemo(() => {
    if (localHabits.length === 0) return { completion: 0, streak: 0, avg: 0 };
    const completedTodayCount = localHabits.filter(h => h.completedToday).length;
    const completionPct = Math.round((completedTodayCount / localHabits.length) * 100);

    // Calculate max streak
    const maxStreak = Math.max(...localHabits.map(h => h.streak), 0);

    // Weekly average
    const avgPct = Math.round(
      (localHabits.reduce((acc, h) => acc + h.weeklyCompletions.filter(x => x).length, 0) / (localHabits.length * 7)) * 100
    );

    return {
      completion: completionPct,
      streak: maxStreak,
      avg: avgPct
    };
  }, [localHabits]);

  // Last 7 days calculations
  const last7Days = useMemo(() => {
    const days = [];
    const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        name: WEEKDAY_NAMES[d.getDay()],
        num: d.getDate(),
        // mock completions based on dynamic calendar indices for visual diversity
        completed: d.getDate() % 2 === 0,
        isToday: i === 0
      });
    }
    return days;
  }, []);

  // Quick-Complete Spring Action
  const handleQuickComplete = (habitId: string) => {
    Vibration.vibrate(12); // Haptic
    
    // Animate Layout smoothly
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

    setLocalHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h;
        
        const hRich = h as any;
        const nextValue = Math.min(hRich.targetValue, hRich.currentValue + 1);
        const reachedTarget = nextValue === hRich.targetValue;
        
        if (reachedTarget) {
          // Play complete haptic sequence
          Vibration.vibrate([0, 15, 30, 20]);
        }

        return {
          ...h,
          currentValue: nextValue,
          completedToday: reachedTarget,
          streak: reachedTarget && !h.completedToday ? h.streak + 1 : h.streak
        } as any;
      })
    );

    // Also trigger toggle in global store if completed
    toggleHabit(habitId);
  };

  // Add Habit Save
  const handleCreateHabit = () => {
    if (!newHabitName.trim()) return;

    const newId = `h_${Date.now()}`;
    const targetValNum = parseInt(newTargetQty) || 1;

    const newH = {
      id: newId,
      title: newHabitName.trim(),
      streak: 0,
      completedToday: false,
      color: colors.primary,
      frequency: 'DAILY',
      reminderTime: isReminderOn ? newReminderTime : 'Off',
      weeklyCompletions: [0, 0, 0, 0, 0, 0, 0],
      notes: [],
      // Rich extra features
      targetValue: targetValNum,
      currentValue: 0,
      unit: newTargetUnit,
      iconId: selectedIconId
    };

    // Add to store and local state
    addHabitStore(newHabitName.trim(), newReminderTime);
    setLocalHabits(prev => [...prev, newH as any]);

    // Reset Form
    setNewHabitName('');
    setSelectedIconId('book');
    setNewFrequency('DAILY');
    setNewTargetQty('8');
    setNewTargetUnit('glasses');
    setIsNewHabitSheetVisible(false);
    Vibration.vibrate(10);
  };

  // Delete action from swiping
  const handleDeleteHabit = (habitId: string) => {
    Vibration.vibrate(15);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLocalHabits(prev => prev.filter(h => h.id !== habitId));
  };

  // Skip action from swiping
  const handleSkipHabit = (habitId: string) => {
    Vibration.vibrate(10);
    setLocalHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          completedToday: false,
          notes: [...h.notes, 'Skipped for today.']
        };
      })
    );
  };

  // Click habit card to open details
  const handleOpenDetail = (habit: any) => {
    Vibration.vibrate(8);
    setActiveDetailHabit(habit);
    setIsDetailSheetVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Today's Done</Text>
          <Text style={styles.statValue}>{stats.completion}%</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Streak</Text>
          <View style={styles.streakWrapper}>
            <Text style={styles.flameIcon}>🔥</Text>
            <Text style={styles.statValue}>{stats.streak}</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Weekly Avg</Text>
          <Text style={styles.statValue}>{stats.avg}%</Text>
        </View>
      </View>

      {/* 2. Horizontal 7-day Strip */}
      <View style={styles.sevenDayStrip}>
        {last7Days.map((day, idx) => {
          const isSelected = selectedDayIdx === idx;
          return (
            <Pressable
              key={idx}
              onPress={() => {
                setSelectedDayIdx(idx);
                Vibration.vibrate(5);
              }}
              style={[styles.stripDayCell, isSelected && styles.stripDayCellActive]}
            >
              <Text style={[styles.stripDayLabel, isSelected && styles.stripDayLabelActive]}>
                {day.name}
              </Text>
              <Text style={[styles.stripDateNum, isSelected && styles.stripDateNumActive]}>
                {day.num}
              </Text>
              
              {/* Badge Completion Indicator */}
              <View style={styles.badgeWrapper}>
                {day.completed ? (
                  <View style={styles.completedBadge}>
                    <Text style={styles.checkBadgeText}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.incompleteBadge} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* 3. Habits Scroll List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {localHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits scheduled for today.</Text>
            <Text style={styles.emptySubtext}>Tap the + button to cultivate a new routine.</Text>
          </View>
        ) : (
          localHabits.map((habit) => {
            const hRich = habit as any;
            const progress = hRich.currentValue / hRich.targetValue;
            const isCompleted = progress >= 1;
            const iconObj = HABIT_ICONS.find(i => i.id === hRich.iconId) || HABIT_ICONS[0];

            return (
              <SwipeableRow
                key={habit.id}
                onDelete={() => handleDeleteHabit(habit.id)}
                onSkip={() => handleSkipHabit(habit.id)}
              >
                <Pressable
                  onPress={() => handleOpenDetail(hRich)}
                  style={[
                    styles.habitCard,
                    isCompleted && styles.habitCardCompleted
                  ]}
                >
                  {/* Left Icon Rounded Square */}
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconChar}>{iconObj.char}</Text>
                  </View>

                  {/* Habit Info Content */}
                  <View style={styles.cardContent}>
                    <Text style={styles.habitName}>{habit.title}</Text>
                    <Text style={styles.habitTarget}>
                      {hRich.targetValue} {hRich.unit}s · {habit.frequency}
                    </Text>

                    {/* Progress Bar */}
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${Math.min(100, progress * 100)}%` }
                        ]}
                      />
                    </View>
                  </View>

                  {/* Fraction Progress & Tap-to-complete button */}
                  <View style={styles.rightActions}>
                    <Text style={styles.fractionLabel}>
                      {hRich.currentValue} / {hRich.targetValue}
                    </Text>
                    
                    {/* Quick check target button */}
                    <Pressable
                      onPress={() => handleQuickComplete(habit.id)}
                      style={[
                        styles.quickCheckButton,
                        isCompleted && styles.quickCheckButtonCompleted
                      ]}
                    >
                      <Text style={styles.checkText}>
                        {isCompleted ? '✓' : '+'}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Streak Flame in bottom right corner */}
                  <View style={styles.cardStreakCorner}>
                    <Text style={styles.streakFlameText}>🔥 {habit.streak}d</Text>
                  </View>
                </Pressable>
              </SwipeableRow>
            );
          })
        )}
      </ScrollView>

      {/* FAB button */}
      <Pressable
        onPress={() => setIsNewHabitSheetVisible(true)}
        style={styles.fab}
        android_ripple={{ color: colors.primaryDark }}
      >
        <Text style={styles.fabPlus}>+</Text>
      </Pressable>

      {/* Detail Heatmap & Sparkline Modal Bottom Sheet */}
      <Modal
        visible={isDetailSheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDetailSheetVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetDismissArea} onPress={() => setIsDetailSheetVisible(false)} />
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />

            {activeDetailHabit && (
              <>
                <View style={styles.detailHeaderRow}>
                  <Text style={styles.detailHeaderIcon}>
                    {HABIT_ICONS.find(i => i.id === activeDetailHabit.iconId)?.char}
                  </Text>
                  <View>
                    <Text style={styles.detailHeaderTitle}>{activeDetailHabit.title}</Text>
                    <Text style={styles.detailHeaderSub}>
                      {activeDetailHabit.targetValue} {activeDetailHabit.unit}s daily routine
                    </Text>
                  </View>
                </View>

                {/* 30-Day Heatmap Grid (7 cols) */}
                <Text style={styles.detailSectionTitle}>30-Day Completion Grid</Text>
                <View style={styles.heatmapContainer}>
                  {Array.from({ length: 30 }).map((_, idx) => {
                    // Simulate completion intensities
                    const intensity = (idx % 3 === 0) ? 1 : (idx % 5 === 0) ? 0.5 : 0;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.heatmapCell,
                          {
                            backgroundColor: intensity === 1 
                              ? colors.primary 
                              : intensity === 0.5 
                                ? colors.primaryLight 
                                : colors.border
                          }
                        ]}
                      />
                    );
                  })}
                </View>

                {/* Weekly Streak sparkline charts */}
                <Text style={styles.detailSectionTitle}>Streak Sparkline (Last 6 Weeks)</Text>
                <View style={styles.sparklineContainer}>
                  {[5, 7, 4, 7, 6, 7].map((val, idx) => {
                    const pct = (val / 7) * 100;
                    return (
                      <View key={idx} style={styles.sparklineBarWrapper}>
                        <View style={[styles.sparklineBarFill, { height: `${pct}%` }]} />
                        <Text style={styles.sparklineBarLabel}>W{idx + 1}</Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.notesBox}>
                  <Text style={styles.notesTitle}>Continuity Notes</Text>
                  <Text style={styles.notesBody}>
                    Doing great! Morning routines help lock in the circadian clock and prep deep attention.
                  </Text>
                </View>

                {/* Edit Button */}
                <Pressable
                  onPress={() => {
                    setIsDetailSheetVisible(false);
                    setIsNewHabitSheetVisible(true);
                  }}
                  style={styles.editHabitButton}
                >
                  <Text style={styles.editHabitText}>✏️ Edit Habit Settings</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* New Habit Bottom Sheet Configuration */}
      <Modal
        visible={isNewHabitSheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsNewHabitSheetVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetDismissArea} onPress={() => setIsNewHabitSheetVisible(false)} />
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitleTitle}>Create Habit</Text>

            {/* Input - Name */}
            <Text style={styles.fieldLabel}>Habit Name</Text>
            <TextInput
              value={newHabitName}
              onChangeText={setNewHabitName}
              placeholder="e.g. Meditate daily"
              placeholderTextColor={colors.textLight}
              style={styles.inputField}
            />

            {/* Icon Picker Grid */}
            <Text style={styles.fieldLabel}>Choose Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScrollRow}>
              {HABIT_ICONS.map((icon) => {
                const isSelected = selectedIconId === icon.id;
                return (
                  <Pressable
                    key={icon.id}
                    onPress={() => setSelectedIconId(icon.id)}
                    style={[
                      styles.iconSelectorCell,
                      isSelected && styles.iconSelectorCellActive
                    ]}
                  >
                    <Text style={styles.iconSelectorChar}>{icon.char}</Text>
                    <Text style={styles.iconSelectorText}>{icon.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Frequency Selector Row */}
            <Text style={styles.fieldLabel}>Frequency</Text>
            <View style={styles.frequencyTabs}>
              {(['DAILY', 'WEEKDAYS', 'CUSTOM'] as const).map((freq) => {
                const isActive = newFrequency === freq;
                return (
                  <Pressable
                    key={freq}
                    onPress={() => setNewFrequency(freq)}
                    style={[styles.freqTab, isActive && styles.freqTabActive]}
                  >
                    <Text style={[styles.freqTabText, isActive && styles.freqTabTextActive]}>
                      {freq}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Target Value inputs row */}
            <View style={styles.targetsInputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Target Goal</Text>
                <TextInput
                  value={newTargetQty}
                  onChangeText={setNewTargetQty}
                  keyboardType="numeric"
                  placeholder="8"
                  placeholderTextColor={colors.textLight}
                  style={styles.inputField}
                />
              </View>

              <View style={{ flex: 1.5 }}>
                <Text style={styles.fieldLabel}>Unit label</Text>
                <TextInput
                  value={newTargetUnit}
                  onChangeText={setNewTargetUnit}
                  placeholder="glasses"
                  placeholderTextColor={colors.textLight}
                  style={styles.inputField}
                />
              </View>
            </View>

            {/* Reminder toggles */}
            <View style={styles.reminderTogglesRow}>
              <Text style={styles.reminderLabel}>Reminder Time</Text>
              <Pressable
                onPress={() => setIsReminderOn(!isReminderOn)}
                style={[styles.toggleSwitch, isReminderOn && styles.toggleSwitchActive]}
              >
                <View style={[styles.toggleThumb, isReminderOn && styles.toggleThumbActive]} />
              </Pressable>
            </View>
            
            {isReminderOn && (
              <TextInput
                value={newReminderTime}
                onChangeText={setNewReminderTime}
                placeholder="08:00 AM"
                placeholderTextColor={colors.textLight}
                style={styles.inputField}
              />
            )}

            {/* Create Button */}
            <Pressable
              onPress={handleCreateHabit}
              style={styles.createButton}
              android_ripple={{ color: colors.primaryDark }}
            >
              <Text style={styles.createButtonText}>Create Habit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/**
 * Custom Swipeable Row implementation using PanResponder.
 * Slides left/right to reveal skip/delete actions behind.
 */
function SwipeableRow({ children, onDelete, onSkip }: { children: ReactNode; onDelete: () => void; onSkip: () => void }) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Intercept strictly horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -80) {
          // Snap left to delete
          Animated.spring(translateX, {
            toValue: -80,
            friction: 5,
            useNativeDriver: true
          }).start();
        } else if (gestureState.dx > 80) {
          // Snap right to skip
          Animated.spring(translateX, {
            toValue: 80,
            friction: 5,
            useNativeDriver: true
          }).start();
        } else {
          // Snap back shut
          Animated.spring(translateX, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  return (
    <View style={styles.swipeRowWrapper}>
      {/* Background skip/delete action plates */}
      <View style={styles.swipeBackground}>
        {/* Swipe Right action -> Skip Today */}
        <Pressable
          onPress={() => {
            onSkip();
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          }}
          style={[styles.actionPlate, styles.skipPlate]}
        >
          <Text style={styles.actionPlateText}>Skip Today</Text>
        </Pressable>

        {/* Swipe Left action -> Delete */}
        <Pressable
          onPress={() => {
            onDelete();
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          }}
          style={[styles.actionPlate, styles.deletePlate]}
        >
          <Text style={styles.actionPlateText}>Delete</Text>
        </Pressable>
      </View>

      {/* Main card row sliding above plates */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    height: '60%',
    alignSelf: 'center'
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary
  },
  streakWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  flameIcon: {
    fontSize: 18
  },
  sevenDayStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  stripDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8
  },
  stripDayCellActive: {
    backgroundColor: colors.primaryLight
  },
  stripDayLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '500'
  },
  stripDayLabelActive: {
    color: colors.primary,
    fontWeight: '700'
  },
  stripDateNum: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2
  },
  stripDateNumActive: {
    color: colors.primary
  },
  badgeWrapper: {
    marginTop: 6
  },
  completedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.white
  },
  incompleteBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.transparent
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80,
    gap: 12
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.textLight
  },

  // Habit Card styles
  swipeRowWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden'
  },
  swipeBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 16,
    overflow: 'hidden'
  },
  actionPlate: {
    width: 80,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  skipPlate: {
    backgroundColor: colors.warning,
    alignItems: 'flex-start',
    paddingLeft: 12
  },
  deletePlate: {
    backgroundColor: colors.danger,
    alignItems: 'flex-end',
    paddingRight: 16
  },
  actionPlateText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  habitCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: colors.shadow,
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  habitCardCompleted: {
    borderColor: '#D4AF37', // Gold highlight on 100% completion
    borderWidth: 1.5,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  iconChar: {
    fontSize: 22
  },
  cardContent: {
    flex: 1,
    gap: 4
  },
  habitName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  habitTarget: {
    fontSize: 12,
    color: colors.textSubdued
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2
  },
  rightActions: {
    alignItems: 'center',
    gap: 6
  },
  fractionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight
  },
  quickCheckButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface
  },
  quickCheckButtonCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  checkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
    lineHeight: 16
  },
  cardStreakCorner: {
    position: 'absolute',
    bottom: 8,
    right: 8
  },
  streakFlameText: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '500'
  },

  // FAB button styles
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5
  },
  fabPlus: {
    fontSize: 30,
    color: colors.white,
    lineHeight: 32,
    fontWeight: '300'
  },

  // Modal sheet styles
  sheetOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end'
  },
  sheetDismissArea: {
    flex: 1
  },
  sheetContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 40,
    maxHeight: '90%'
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20
  },
  sheetTitleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSubdued,
    marginBottom: 8
  },
  inputField: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  iconScrollRow: {
    flexDirection: 'row',
    marginBottom: 16
  },
  iconSelectorCell: {
    width: 68,
    height: 68,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    gap: 4
  },
  iconSelectorCellActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight
  },
  iconSelectorChar: {
    fontSize: 22
  },
  iconSelectorText: {
    fontSize: 9,
    color: colors.textSubdued,
    fontWeight: '500'
  },
  frequencyTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  freqTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  freqTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  freqTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSubdued
  },
  freqTabTextActive: {
    color: colors.white
  },
  targetsInputRow: {
    flexDirection: 'row',
    gap: 16
  },
  reminderTogglesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  reminderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSubdued
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center'
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  toggleThumbActive: {
    alignSelf: 'flex-end'
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  createButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600'
  },

  // Detail Sheet specifics
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20
  },
  detailHeaderIcon: {
    fontSize: 40
  },
  detailHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary
  },
  detailHeaderSub: {
    fontSize: 13,
    color: colors.textSubdued,
    marginTop: 2
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSubdued,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 12
  },
  heatmapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 14,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    marginBottom: 16
  },
  heatmapCell: {
    width: (SCREEN_WIDTH - 96) / 7.2,
    height: (SCREEN_WIDTH - 96) / 7.2,
    borderRadius: 6
  },
  sparklineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
    height: 100,
    marginBottom: 16
  },
  sparklineBarWrapper: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    gap: 6
  },
  sparklineBarFill: {
    width: 14,
    borderRadius: 4,
    backgroundColor: colors.primary
  },
  sparklineBarLabel: {
    fontSize: 9,
    color: colors.textLight,
    fontWeight: '600'
  },
  notesBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4
  },
  notesBody: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSubdued
  },
  editHabitButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center'
  },
  editHabitText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSubdued
  }
});
