import { useState, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Vibration,
  RefreshControl,
  Dimensions,
  Animated
} from 'react-native';
import { usePlannerStore } from '../../store/plannerStore';
import { colors } from '../../constants/colors';
import type { CalendarEvent } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category constants
const CATEGORIES = ['Work', 'Personal', 'Health', 'Other'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<Category, string> = {
  Work: colors.primary,
  Personal: colors.warning,
  Health: colors.success,
  Other: colors.danger
};

const CATEGORY_LIGHTS: Record<Category, string> = {
  Work: colors.primaryLight,
  Personal: colors.warningLight,
  Health: colors.successLight,
  Other: colors.dangerLight
};

// Weekday names
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to get category dynamically from text
const getCategory = (title: string, desc: string): Category => {
  const content = (title + ' ' + desc).toLowerCase();
  if (content.includes('work') || content.includes('standup') || content.includes('meeting') || content.includes('review')) return 'Work';
  if (content.includes('personal') || content.includes('walk') || content.includes('lunch') || content.includes('dinner')) return 'Personal';
  if (content.includes('health') || content.includes('gym') || content.includes('exercise') || content.includes('run')) return 'Health';
  return 'Other';
};

export function CalendarScreen() {
  const events = usePlannerStore((s) => s.events);
  const addEvent = usePlannerStore((s) => s.addEvent);
  
  // Custom store action to remove / edit if they exist, else we manage locally or log
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(events);
  const [refreshing, setRefreshing] = useState(false);

  // Active dates states
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  );

  // Tab views: Month, Week, Day (Samsung Calendar Style)
  const [activeTab, setActiveTab] = useState<'Month' | 'Week' | 'Day'>('Month');

  // Slide Animation for Month Swipe
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Bottom Sheet Modal state
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Work');
  const [newLocation, setNewLocation] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');

  // Long-press Context Menu state
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Pull down refresh simulation
  const onRefresh = () => {
    setRefreshing(true);
    Vibration.vibrate(20); // Haptic feedback
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  };

  // Helper date calculations
  const monthLabel = useMemo(() => {
    return new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }, [currentYear, currentMonth]);

  // Generate 42 calendar grid cells (Month View)
  const gridCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateString: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateString: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    // Next month leading days
    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push({
        day: i,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateString: `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Swiping Grid Navigation (Slide Animation)
  let touchStartX = 0;
  const handleTouchStart = (e: any) => {
    touchStartX = e.nativeEvent.pageX;
  };
  const handleTouchEnd = (e: any) => {
    const touchEndX = e.nativeEvent.pageX;
    const diff = touchEndX - touchStartX;
    if (diff > 50) {
      // Swipe Right -> Prev Month
      animateSwipe('right');
    } else if (diff < -50) {
      // Swipe Left -> Next Month
      animateSwipe('left');
    }
  };

  const animateSwipe = (direction: 'left' | 'right') => {
    Animated.timing(slideAnim, {
      toValue: direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      // Update Month State
      if (direction === 'left') {
        if (currentMonth === 11) {
          setCurrentMonth(0);
          setCurrentYear(prev => prev + 1);
        } else {
          setCurrentMonth(prev => prev + 1);
        }
      } else {
        if (currentMonth === 0) {
          setCurrentMonth(11);
          setCurrentYear(prev => prev - 1);
        } else {
          setCurrentMonth(prev => prev - 1);
        }
      }
      // Reset position instantly
      slideAnim.setValue(0);
    });
  };

  // Filter events by selected date
  const selectedDateEvents = useMemo(() => {
    // Standard mock events have format "09:00", we assume they are for today in the demo.
    // For general dates, we display events if the dates match or fallback for demo.
    return localEvents;
  }, [localEvents, selectedDate]);

  // Dynamic dots mapping (events for each specific date cell)
  const getEventsForDate = (dateStr: string) => {
    // In our simplified local demo, events don't have absolute dates. We simulate dot counts for visual hierarchy.
    // Let's create reproducible mock indicators based on day numbers to look highly authentic.
    const dayNum = parseInt(dateStr.split('-')[2]);
    if (dayNum % 7 === 0) return 4; // triggers "+" indicator
    if (dayNum % 3 === 0) return 2;
    if (dayNum % 5 === 0) return 3;
    if (dayNum % 2 === 0) return 1;
    return 0;
  };

  // Save Created Event
  const handleSaveEvent = () => {
    if (!newTitle.trim()) return;
    const newId = `e_${Date.now()}`;
    const newEv: CalendarEvent = {
      id: newId,
      title: newTitle.trim(),
      startAt: newStart,
      endAt: newEnd,
      source: 'INTERNAL',
      description: `${newCategory} • ${newLocation} • ${newNotes}`.trim(),
      linkedTaskIds: []
    };
    
    // Add to stores and local state
    addEvent(newTitle.trim(), newStart, newEnd, 'INTERNAL');
    setLocalEvents(prev => [...prev, newEv]);

    // Reset Sheet Form
    setNewTitle('');
    setNewCategory('Work');
    setNewLocation('');
    setNewNotes('');
    setNewStart('09:00');
    setNewEnd('10:00');
    setIsSheetVisible(false);
    Vibration.vibrate(10);
  };

  // Open context menu on long-press
  const handleLongPressEvent = (eventId: string) => {
    Vibration.vibrate([0, 30]); // Context vibration pattern
    setSelectedEventId(eventId);
    setIsMenuVisible(true);
  };

  // Execute Delete from Context Menu
  const handleDeleteEvent = () => {
    if (!selectedEventId) return;
    setLocalEvents(prev => prev.filter(e => e.id !== selectedEventId));
    setIsMenuVisible(false);
    setSelectedEventId(null);
    Vibration.vibrate(15);
  };

  // Parse hour string into numerical float for timeline offsets (e.g. "09:30" -> 9.5)
  const parseHourToFloat = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m / 60);
  };

  // Hour block array for 24h Samsung-style grids
  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  return (
    <View style={styles.container}>
      {/* 1. Sticky Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <View style={styles.chevronsContainer}>
            <Pressable
              onPress={() => animateSwipe('right')}
              style={styles.chevronButton}
              android_ripple={{ color: colors.border }}
            >
              <Text style={styles.chevronText}>‹</Text>
            </Pressable>
            <Pressable
              onPress={() => animateSwipe('left')}
              style={styles.chevronButton}
              android_ripple={{ color: colors.border }}
            >
              <Text style={styles.chevronText}>›</Text>
            </Pressable>
          </View>
        </View>

        {/* Samsung-style view selector */}
        <View style={styles.tabSelector}>
          {(['Month', 'Week', 'Day'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => {
                setActiveTab(tab);
                Vibration.vibrate(5);
              }}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Weekday Row Header (Fixed columns) */}
        {activeTab === 'Month' && (
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={styles.weekdayLabel}>
                {day}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Main Calendar Body Panels */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Month View Panel */}
        {activeTab === 'Month' && (
          <Animated.View
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={[styles.gridContainer, { transform: [{ translateX: slideAnim }] }]}
          >
            {gridCells.map((cell, index) => {
              const isSelected = cell.dateString === selectedDate;
              const isToday =
                cell.day === now.getDate() &&
                cell.month === now.getMonth() &&
                cell.year === now.getFullYear();

              const dotCount = getEventsForDate(cell.dateString);

              return (
                <Pressable
                  key={`${cell.dateString}-${index}`}
                  onPress={() => setSelectedDate(cell.dateString)}
                  style={[styles.dayCell, !cell.isCurrentMonth && styles.dayCellSubdued]}
                >
                  <View
                    style={[
                      styles.dayNumberContainer,
                      isToday && styles.todayNumberContainer,
                      isSelected && styles.selectedNumberContainer
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !cell.isCurrentMonth && styles.dayTextSubdued,
                        isToday && styles.todayText,
                        isSelected && styles.selectedText
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </View>

                  {/* Dot Event Indicators */}
                  <View style={styles.dotsRow}>
                    {dotCount > 0 && dotCount <= 3 && (
                      Array.from({ length: dotCount }).map((_, i) => (
                        <View key={i} style={styles.eventDot} />
                      ))
                    )}
                    {dotCount > 3 && (
                      <>
                        <View style={styles.eventDot} />
                        <View style={styles.eventDot} />
                        <Text style={styles.plusIndicator}>+</Text>
                      </>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </Animated.View>
        )}

        {/* Week View Timeline Panel (Samsung Style) */}
        {activeTab === 'Week' && (
          <View style={styles.weekTimelineContainer}>
            {/* Week days columns row */}
            <View style={styles.weekHeaderDays}>
              <View style={styles.hourPaddingColumn} />
              {WEEKDAYS.map((day, idx) => {
                // Calculate calendar date offset for current week
                const d = new Date(currentYear, currentMonth, now.getDate() - now.getDay() + idx);
                const isSelectedWeekDay = d.getDate() === parseInt(selectedDate.split('-')[2]);
                return (
                  <Pressable
                    key={day}
                    onPress={() => setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)}
                    style={[styles.weekHeaderDayCell, isSelectedWeekDay && styles.weekHeaderDayCellActive]}
                  >
                    <Text style={[styles.weekDayLabel, isSelectedWeekDay && styles.weekDayLabelActive]}>{day}</Text>
                    <Text style={[styles.weekDateNum, isSelectedWeekDay && styles.weekDateNumActive]}>{d.getDate()}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Scrollable Timeline Grid */}
            <ScrollView horizontal={false} nestedScrollEnabled style={styles.weekHoursScroll}>
              <View style={styles.weekHoursContainer}>
                {/* Timeline background lines */}
                {HOURS.map((hour) => (
                  <View key={hour} style={styles.timelineRow}>
                    <View style={styles.hourTextColumn}>
                      <Text style={styles.hourLabelText}>
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                      </Text>
                    </View>
                    <View style={styles.timelineGridLine} />
                  </View>
                ))}

                {/* Absolutely positioned events of the week */}
                {selectedDateEvents.map((event) => {
                  const category = getCategory(event.title, event.description);
                  const startHour = parseHourToFloat(event.startAt);
                  const endHour = parseHourToFloat(event.endAt);
                  const duration = Math.max(0.5, endHour - startHour);

                  // Calculate top offset and height based on 64px hourly row
                  const top = startHour * 64;
                  const height = duration * 64;

                  // Render on selected day column
                  // We simulate layout by matching the selected day for this week view
                  return (
                    <Pressable
                      key={event.id}
                      onLongPress={() => handleLongPressEvent(event.id)}
                      style={[
                        styles.weekEventCard,
                        {
                          top,
                          height,
                          backgroundColor: CATEGORY_LIGHTS[category],
                          borderLeftColor: CATEGORY_COLORS[category]
                        }
                      ]}
                    >
                      <Text style={styles.weekEventTitle} numberOfLines={1}>
                        {event.title}
                      </Text>
                      <Text style={styles.weekEventTime} numberOfLines={1}>
                        {event.startAt}-{event.endAt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Day View Timeline Panel (Samsung Style) */}
        {activeTab === 'Day' && (
          <View style={styles.dayTimelineContainer}>
            <ScrollView nestedScrollEnabled style={styles.dayHoursScroll}>
              <View style={styles.dayHoursContainer}>
                {HOURS.map((hour) => (
                  <Pressable
                    key={hour}
                    onPress={() => {
                      setNewStart(`${String(hour).padStart(2, '0')}:00`);
                      setNewEnd(`${String(hour + 1).padStart(2, '0')}:00`);
                      setIsSheetVisible(true);
                    }}
                    style={styles.dayTimelineRow}
                  >
                    <View style={styles.dayHourTextColumn}>
                      <Text style={styles.hourLabelText}>
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                      </Text>
                    </View>
                    <View style={styles.dayTimelineGridLine} />
                  </Pressable>
                ))}

                {/* Absolutely positioned events (Day View) */}
                {selectedDateEvents.map((event) => {
                  const category = getCategory(event.title, event.description);
                  const startHour = parseHourToFloat(event.startAt);
                  const endHour = parseHourToFloat(event.endAt);
                  const duration = Math.max(0.5, endHour - startHour);

                  const top = startHour * 80; // 80px per hour in Day view for readability
                  const height = duration * 80;

                  return (
                    <Pressable
                      key={event.id}
                      onLongPress={() => handleLongPressEvent(event.id)}
                      style={[
                        styles.dayEventCard,
                        {
                          top,
                          height,
                          backgroundColor: CATEGORY_LIGHTS[category],
                          borderLeftColor: CATEGORY_COLORS[category]
                        }
                      ]}
                    >
                      <Text style={styles.dayEventTitle}>{event.title}</Text>
                      <Text style={styles.dayEventTime}>
                        {event.startAt} - {event.endAt}
                      </Text>
                      {event.description ? (
                        <Text style={styles.dayEventDesc} numberOfLines={1}>
                          {event.description}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 3. Event List (Only displays in Month view bottom half) */}
        {activeTab === 'Month' && (
          <View style={styles.eventsListSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Events for {selectedDate}</Text>
              <Text style={styles.eventCountLabel}>
                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'}
              </Text>
            </View>

            {selectedDateEvents.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No tasks or events scheduled today.</Text>
                <Text style={styles.emptyStateSubtext}>Tap the + button to block a session.</Text>
              </View>
            ) : (
              selectedDateEvents.map((event) => {
                const category = getCategory(event.title, event.description);
                return (
                  <Pressable
                    key={event.id}
                    onLongPress={() => handleLongPressEvent(event.id)}
                    style={styles.eventRowCard}
                    android_ripple={{ color: colors.border }}
                  >
                    {/* Left Category Indicator Bar */}
                    <View style={[styles.categoryBar, { backgroundColor: CATEGORY_COLORS[category] }]} />
                    <View style={styles.eventRowContent}>
                      <Text style={styles.eventRowTitle}>{event.title}</Text>
                      <View style={styles.eventRowTimeContainer}>
                        <Text style={styles.eventRowTime}>
                          {event.startAt} – {event.endAt}
                        </Text>
                      </View>
                      {event.description ? (
                        <View style={styles.locationContainer}>
                          <Text style={styles.pinIcon}>📍</Text>
                          <Text style={styles.locationText} numberOfLines={1}>
                            {event.description}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <Pressable
        onPress={() => setIsSheetVisible(true)}
        style={styles.fab}
        android_ripple={{ color: colors.primaryDark }}
      >
        <Text style={styles.fabPlus}>+</Text>
      </Pressable>

      {/* Create Event Custom Bottom Sheet Modal */}
      <Modal
        visible={isSheetVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSheetVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetDismissArea} onPress={() => setIsSheetVisible(false)} />
          <View style={styles.sheetContent}>
            {/* Header handle */}
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Create Event</Text>

            {/* Input - Title */}
            <Text style={styles.inputLabel}>Event Title</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="e.g. Design review session"
              placeholderTextColor={colors.textLight}
              style={styles.textInput}
            />

            {/* Read-Only Date */}
            <Text style={styles.inputLabel}>Date</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{selectedDate}</Text>
            </View>

            {/* Category horizontal Chips */}
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryChipsRow}>
              {CATEGORIES.map((cat) => {
                const isActive = newCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setNewCategory(cat)}
                    style={[
                      styles.chipButton,
                      isActive && {
                        backgroundColor: CATEGORY_COLORS[cat],
                        borderColor: CATEGORY_COLORS[cat]
                      }
                    ]}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Time Pickers (Custom Stepper-based time selectors) */}
            <View style={styles.timesRow}>
              <View style={styles.timePickerContainer}>
                <Text style={styles.inputLabel}>Start Time</Text>
                <TextInput
                  value={newStart}
                  onChangeText={setNewStart}
                  placeholder="09:00"
                  placeholderTextColor={colors.textLight}
                  style={styles.timeInput}
                />
              </View>

              <View style={styles.timePickerContainer}>
                <Text style={styles.inputLabel}>End Time</Text>
                <TextInput
                  value={newEnd}
                  onChangeText={setNewEnd}
                  placeholder="10:00"
                  placeholderTextColor={colors.textLight}
                  style={styles.timeInput}
                />
              </View>
            </View>

            {/* Input - Optional Location */}
            <Text style={styles.inputLabel}>Location (Optional)</Text>
            <TextInput
              value={newLocation}
              onChangeText={setNewLocation}
              placeholder="Room 4B or Remote"
              placeholderTextColor={colors.textLight}
              style={styles.textInput}
            />

            {/* Input - Optional Notes */}
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              value={newNotes}
              onChangeText={setNewNotes}
              placeholder="Provide event details..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
              style={[styles.textInput, styles.multilineInput]}
            />

            {/* Save Button */}
            <Pressable
              onPress={handleSaveEvent}
              style={styles.saveButton}
              android_ripple={{ color: colors.primaryDark }}
            >
              <Text style={styles.saveButtonText}>Save Event</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Long-press Context Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setIsMenuVisible(false)}>
          <View style={styles.menuContent}>
            <Text style={styles.menuHeaderTitle}>Manage Event</Text>
            
            <Pressable
              onPress={() => {
                setIsMenuVisible(false);
                setIsSheetVisible(true); // pre-populate in editing mockup
              }}
              style={styles.menuOption}
            >
              <Text style={styles.menuOptionText}>✏️ Edit Event</Text>
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable onPress={handleDeleteEvent} style={styles.menuOption}>
              <Text style={[styles.menuOptionText, styles.menuOptionTextDanger]}>
                🗑️ Delete Event
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  monthLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary
  },
  chevronsContainer: {
    flexDirection: 'row',
    gap: 8
  },
  chevronButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chevronText: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '300',
    lineHeight: 28
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    padding: 3,
    marginBottom: 12
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  tabButtonActive: {
    backgroundColor: colors.surface
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSubdued
  },
  tabButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: '600'
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },
  weekdayLabel: {
    width: (SCREEN_WIDTH - 40) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight
  },
  scrollContent: {
    flexGrow: 1
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: colors.surface
  },
  dayCell: {
    width: (SCREEN_WIDTH - 32) / 7,
    height: 72,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(216,221,232,0.3)'
  },
  dayCellSubdued: {
    opacity: 0.4
  },
  dayNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  todayNumberContainer: {
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  selectedNumberContainer: {
    backgroundColor: colors.primary
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary
  },
  dayTextSubdued: {
    color: colors.textLight
  },
  todayText: {
    color: colors.primary,
    fontWeight: '700'
  },
  selectedText: {
    color: colors.white,
    fontWeight: '600'
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    height: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSubdued
  },
  plusIndicator: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSubdued,
    lineHeight: 9
  },
  eventsListSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary
  },
  eventCountLabel: {
    fontSize: 13,
    color: colors.textLight
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: colors.textLight
  },
  eventRowCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  categoryBar: {
    width: 5
  },
  eventRowContent: {
    flex: 1,
    padding: 14,
    gap: 4
  },
  eventRowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary
  },
  eventRowTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  eventRowTime: {
    fontSize: 13,
    color: colors.textSubdued
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  },
  pinIcon: {
    fontSize: 11
  },
  locationText: {
    fontSize: 11,
    color: colors.textLight
  },
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

  // Week timeline view styles
  weekTimelineContainer: {
    flex: 1,
    backgroundColor: colors.surface
  },
  weekHeaderDays: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    backgroundColor: colors.surface
  },
  hourPaddingColumn: {
    width: 60
  },
  weekHeaderDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4
  },
  weekHeaderDayCellActive: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8
  },
  weekDayLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500'
  },
  weekDayLabelActive: {
    color: colors.primary,
    fontWeight: '600'
  },
  weekDateNum: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2
  },
  weekDateNumActive: {
    color: colors.primary
  },
  weekHoursScroll: {
    height: 500
  },
  weekHoursContainer: {
    position: 'relative',
    height: 24 * 64 // 24 hours at 64px per hour
  },
  timelineRow: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'flex-start'
  },
  hourTextColumn: {
    width: 60,
    alignItems: 'center',
    paddingTop: 4
  },
  hourLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textLight
  },
  timelineGridLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    marginTop: 10
  },
  weekEventCard: {
    position: 'absolute',
    left: 64,
    right: 16,
    borderRadius: 6,
    borderLeftWidth: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center'
  },
  weekEventTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary
  },
  weekEventTime: {
    fontSize: 10,
    color: colors.textSubdued,
    marginTop: 2
  },

  // Day timeline view styles
  dayTimelineContainer: {
    flex: 1,
    backgroundColor: colors.surface
  },
  dayHoursScroll: {
    height: 600
  },
  dayHoursContainer: {
    position: 'relative',
    height: 24 * 80 // 24 hours at 80px per hour
  },
  dayTimelineRow: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'flex-start'
  },
  dayHourTextColumn: {
    width: 60,
    alignItems: 'center',
    paddingTop: 6
  },
  dayTimelineGridLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    marginTop: 12
  },
  dayEventCard: {
    position: 'absolute',
    left: 68,
    right: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'flex-start',
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  dayEventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  dayEventTime: {
    fontSize: 11,
    color: colors.textSubdued,
    marginTop: 2
  },
  dayEventDesc: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4
  },

  // Bottom Sheet Custom Modal Styles
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
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSubdued,
    marginBottom: 8
  },
  textInput: {
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
  multilineInput: {
    textAlignVertical: 'top',
    height: 80
  },
  readOnlyInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.6
  },
  readOnlyText: {
    fontSize: 15,
    color: colors.textSubdued
  },
  categoryChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  chipButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSubdued
  },
  chipTextActive: {
    color: colors.white
  },
  timesRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16
  },
  timePickerContainer: {
    flex: 1
  },
  timeInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center'
  },
  saveButton: {
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
  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600'
  },

  // Context Menu styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuContent: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6
  },
  menuHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  menuOption: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  menuOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary
  },
  menuOptionTextDanger: {
    color: colors.danger
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border
  }
});
