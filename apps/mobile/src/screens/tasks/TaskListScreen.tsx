import { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Vibration,
  LayoutAnimation,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePlannerStore } from '../../store/plannerStore';
import { colors } from '../../constants/colors';

type SegmentType = 'Inbox' | 'To-Do' | 'In Progress' | 'Done';

const SEGMENTS: SegmentType[] = ['Inbox', 'To-Do', 'In Progress', 'Done'];

export function TaskListScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [activeSegment, setActiveSegment] = useState<SegmentType>('To-Do');
  
  const tasks = usePlannerStore((s) => s.tasks);
  const completeTask = usePlannerStore((s) => s.completeTask);

  // Filter tasks based on segment selection
  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (activeSegment === 'Inbox') return task.status === 'INBOX';
      if (activeSegment === 'To-Do') return task.status === 'TODO';
      if (activeSegment === 'In Progress') return task.status === 'IN_PROGRESS';
      return task.status === 'DONE';
    });
  }, [activeSegment, tasks]);

  const handleToggleTask = (taskId: string) => {
    Vibration.vibrate(12);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    completeTask(taskId);
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return '#3B82F6'; // Blue
    const p = priority.toLowerCase();
    if (p.includes('critical') || p.includes('high')) return '#EF4444'; // Red
    if (p.includes('medium')) return '#F59E0B'; // Orange
    return '#10B981'; // Green
  };

  const getSegmentHeaderLabel = () => {
    if (activeSegment === 'Inbox') return 'UNSORTED INBOX';
    if (activeSegment === 'To-Do') return 'ACTIVE TO-DO';
    if (activeSegment === 'In Progress') return 'IN PROGRESS PIPELINE';
    return 'COMPLETED WORKFLOW';
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Section */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>{tasks.filter(t => t.status !== 'DONE').length} active items</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.actionIconButton} android_ripple={{ color: colors.border }}>
            <Ionicons name="funnel-outline" size={18} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('NewTask')}
            style={styles.createIconButton}
            android_ripple={{ color: '#FFFFFF' }}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* 2. Full-Width Segmented Control */}
      <View style={styles.segmentWrapper}>
        <View style={styles.segmentBar}>
          {SEGMENTS.map((segment) => {
            const isSelected = activeSegment === segment;
            return (
              <Pressable
                key={segment}
                onPress={() => {
                  Vibration.vibrate(8);
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setActiveSegment(segment);
                }}
                style={[
                  styles.segmentItem,
                  isSelected && styles.segmentItemActive
                ]}
              >
                <Text style={[styles.segmentLabel, isSelected && styles.segmentLabelActive]}>
                  {segment}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 3. Task List Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Divider */}
        <Text style={styles.sectionDividerLabel}>{getSegmentHeaderLabel()}</Text>

        {visibleTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="clipboard-outline" size={32} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No tasks here</Text>
            <Text style={styles.emptyDesc}>Create a task using the Quick Capture '+' button or import from calendar suggestions.</Text>
            <Pressable
              onPress={() => navigation.navigate('NewTask')}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Add Task</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cardsStack}>
            {visibleTasks.map((task) => {
              const priorityColor = getPriorityColor(task.manualPriority);
              const isCompleted = task.status === 'DONE';

              return (
                <Pressable
                  key={task.id}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                  style={({ pressed }) => [
                    styles.taskCard,
                    pressed && styles.taskCardPressed
                  ]}
                >
                  {/* Left priority accent strip */}
                  <View style={[styles.leftAccentStrip, { backgroundColor: priorityColor }]} />

                  {/* Leading circular status toggle checkbox */}
                  <Pressable
                    onPress={() => handleToggleTask(task.id)}
                    style={styles.checkboxWrapper}
                  >
                    <Ionicons
                      name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={isCompleted ? '#10B981' : colors.textLight}
                    />
                  </Pressable>

                  {/* Main content stack */}
                  <View style={styles.cardContent}>
                    <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
                      {task.title}
                    </Text>

                    {/* Metadata Row */}
                    <View style={styles.metadataRow}>
                      <View style={[styles.priorityPill, { backgroundColor: `${priorityColor}12` }]}>
                        <Text style={[styles.priorityText, { color: priorityColor }]}>
                          {task.manualPriority || 'Medium'}
                        </Text>
                      </View>

                      <View style={styles.dateBadge}>
                        <Ionicons name="calendar-outline" size={11} color={colors.textLight} style={styles.badgeIcon} />
                        <Text style={styles.dateText}>{task.dueDate || 'No Date'}</Text>
                      </View>

                      <View style={styles.spacer} />

                      <View style={styles.projectPill}>
                        <Text style={styles.projectText}>{task.projectName || 'Inbox'}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 14
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  actionIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  createIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2
  },
  segmentWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16
  },
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(229,231,235,0.4)',
    borderRadius: 12,
    padding: 3.5,
    borderWidth: 1,
    borderColor: colors.border
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8
  },
  segmentItemActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textLight
  },
  segmentLabelActive: {
    color: '#3B82F6'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  sectionDividerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSubdued,
    letterSpacing: 1.5,
    marginTop: 10,
    marginBottom: 14
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 24,
    marginTop: 4
  },
  emptyIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6
  },
  emptyDesc: {
    fontSize: 11.5,
    color: colors.textLight,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#3B82F6'
  },
  emptyButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '800'
  },
  cardsStack: {
    gap: 12
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  taskCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9
  },
  leftAccentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4
  },
  checkboxWrapper: {
    paddingRight: 12,
    justifyContent: 'center'
  },
  cardContent: {
    flex: 1
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 18
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  priorityText: {
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  badgeIcon: {
    marginRight: 4
  },
  dateText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.textSubdued
  },
  spacer: {
    flex: 1
  },
  projectPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  projectText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#3B82F6'
  }
});
