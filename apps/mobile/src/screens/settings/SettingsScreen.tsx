import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Vibration,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const APP_ICONS = [
  { id: 'classic', label: 'Classic Blue', char: '📱', color: colors.primary },
  { id: 'dark', label: 'Slate Dark', char: '🌑', color: colors.textPrimary },
  { id: 'vibrant', label: 'Amber Glow', char: '🔥', color: colors.warning },
  { id: 'forest', label: 'Eco Mint', char: '🌿', color: colors.success }
];

export function SettingsScreen() {
  // Settings State object
  const [settings, setSettings] = useState({
    dailyReminder: true,
    dailyReminderTime: '08:00 AM',
    habitReminders: true,
    focusAlerts: true,
    weeklySummary: true,
    weeklySummaryDay: 'Sunday',
    
    defaultFocusDuration: 25,
    autoStartBreaks: false,
    autoStartFocus: false,
    soundHaptics: true,
    
    firstDayOfWeek: 'Sun' as 'Sun' | 'Mon',
    defaultEventDuration: 60, // minutes
    showDeclinedEvents: false,
    
    allowCalendarAccess: true,
    allowHabitsAccess: true,
    allowFocusAccess: true,
    responseStyle: 'Concise' as 'Concise' | 'Detailed' | 'Creative',
    
    theme: 'System' as 'Light' | 'Dark' | 'System',
    appIcon: 'classic'
  });

  // Section Expansion controllers
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Clear data double confirmation states
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Load persisted settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const val = await AsyncStorage.getItem('@app_user_settings');
        if (val) {
          setSettings(JSON.parse(val));
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    }
    loadSettings();
  }, []);

  // Persist settings changes
  const updateSetting = async (key: keyof typeof settings, value: any) => {
    const updated = { ...settings, [key]: value };
    
    // Smooth layout animation on state alterations
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSettings(updated);

    try {
      await AsyncStorage.setItem('@app_user_settings', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving setting:', err);
    }
  };

  // Toggle expanding rows
  const handleToggleRow = (rowId: string) => {
    Vibration.vibrate(5);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedRow === rowId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(rowId);
    }
  };

  // Double confirmation deletion
  const handlePurgeAllData = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    
    Vibration.vibrate([0, 100, 50, 150]); // Warning vibration sequence
    setIsDeleteModalVisible(false);
    setDeleteConfirmText('');

    try {
      // Purge all core stores local storage
      await AsyncStorage.clear();
      Alert.alert(
        'State Purged',
        'All calendar events, habits, focus logs, and settings have been completely deleted.',
        [{ text: 'OK' }]
      );
      
      // Reset local state to default
      setSettings({
        dailyReminder: true,
        dailyReminderTime: '08:00 AM',
        habitReminders: true,
        focusAlerts: true,
        weeklySummary: true,
        weeklySummaryDay: 'Sunday',
        defaultFocusDuration: 25,
        autoStartBreaks: false,
        autoStartFocus: false,
        soundHaptics: true,
        firstDayOfWeek: 'Sun',
        defaultEventDuration: 60,
        showDeclinedEvents: false,
        allowCalendarAccess: true,
        allowHabitsAccess: true,
        allowFocusAccess: true,
        responseStyle: 'Concise',
        theme: 'System',
        appIcon: 'classic'
      });
    } catch (err) {
      console.error('Error purging data:', err);
    }
  };

  // Stepper helper for Focus preferences
  const handleStepperChange = (val: number) => {
    updateSetting('defaultFocusDuration', Math.max(5, Math.min(60, val)));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Profile Section header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          <Text style={styles.avatarInitials}>AD</Text>
          <Pressable style={styles.cameraBadge}>
            <Text style={styles.cameraIcon}>📸</Text>
          </Pressable>
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>Arin Dixit</Text>
          <Text style={styles.profileEmail}>arin@example.com</Text>
        </View>
      </View>

      {/* SECTION - NOTIFICATIONS */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          
          {/* Daily reminder row + expanding picker */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Daily morning reminder</Text>
              <Text style={styles.settingSub}>{settings.dailyReminderTime}</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Pressable
                onPress={() => updateSetting('dailyReminder', !settings.dailyReminder)}
                style={[styles.toggle, settings.dailyReminder && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, settings.dailyReminder && styles.toggleThumbActive]} />
              </Pressable>
            </View>
          </View>
          
          {/* Expanded time picker inline */}
          {settings.dailyReminder && (
            <Pressable onPress={() => handleToggleRow('reminderTime')} style={styles.expandingTriggerRow}>
              <Text style={styles.expandingTriggerText}>✏️ Edit Reminder Time</Text>
              <Text style={styles.chevronText}>{expandedRow === 'reminderTime' ? '▲' : '▼'}</Text>
            </Pressable>
          )}

          {expandedRow === 'reminderTime' && settings.dailyReminder && (
            <View style={styles.expandedContent}>
              <Text style={styles.pickerTitle}>Set Reminder Hour</Text>
              <View style={styles.timePickerContainer}>
                {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM'].map((time) => (
                  <Pressable
                    key={time}
                    onPress={() => updateSetting('dailyReminderTime', time)}
                    style={[
                      styles.pickerOptionCell,
                      settings.dailyReminderTime === time && styles.pickerOptionCellActive
                    ]}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      settings.dailyReminderTime === time && styles.pickerOptionTextActive
                    ]}>
                      {time}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Habit Reminders toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Habit alerts</Text>
              <Text style={styles.settingSub}>Reminders for pending habit targets</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Pressable
                onPress={() => updateSetting('habitReminders', !settings.habitReminders)}
                style={[styles.toggle, settings.habitReminders && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, settings.habitReminders && styles.toggleThumbActive]} />
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Focus alerts toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Focus session alerts</Text>
              <Text style={styles.settingSub}>Vibrate & flash on Pomodoro completion</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Pressable
                onPress={() => updateSetting('focusAlerts', !settings.focusAlerts)}
                style={[styles.toggle, settings.focusAlerts && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, settings.focusAlerts && styles.toggleThumbActive]} />
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Weekly summary toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Weekly summary report</Text>
              <Text style={styles.settingSub}>Compiled stats on {settings.weeklySummaryDay}</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Pressable
                onPress={() => updateSetting('weeklySummary', !settings.weeklySummary)}
                style={[styles.toggle, settings.weeklySummary && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, settings.weeklySummary && styles.toggleThumbActive]} />
              </Pressable>
            </View>
          </View>

          {/* Expand weekday picker */}
          {settings.weeklySummary && (
            <Pressable onPress={() => handleToggleRow('weeklyDay')} style={styles.expandingTriggerRow}>
              <Text style={styles.expandingTriggerText}>📅 Change Summary Day</Text>
              <Text style={styles.chevronText}>{expandedRow === 'weeklyDay' ? '▲' : '▼'}</Text>
            </Pressable>
          )}

          {expandedRow === 'weeklyDay' && settings.weeklySummary && (
            <View style={styles.expandedContent}>
              <Text style={styles.pickerTitle}>Choose Weekday</Text>
              <View style={styles.timePickerContainer}>
                {['Friday', 'Saturday', 'Sunday'].map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => updateSetting('weeklySummaryDay', day)}
                    style={[
                      styles.pickerOptionCell,
                      settings.weeklySummaryDay === day && styles.pickerOptionCellActive
                    ]}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      settings.weeklySummaryDay === day && styles.pickerOptionTextActive
                    ]}>
                      {day}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* SECTION - FOCUS PREFERENCES */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Focus Preferences</Text>
        <View style={styles.card}>
          
          {/* Default Focus duration inline stepper */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Default Focus block</Text>
              <Text style={styles.settingSub}>Standard duration in focus screen</Text>
            </View>
            <View style={styles.settingRowRight}>
              <View style={styles.inlineStepperContainer}>
                <Pressable
                  onPress={() => handleStepperChange(settings.defaultFocusDuration - 5)}
                  style={styles.inlineStepperButton}
                >
                  <Text style={styles.inlineStepperText}>-</Text>
                </Pressable>
                <Text style={styles.inlineStepperValue}>{settings.defaultFocusDuration}m</Text>
                <Pressable
                  onPress={() => handleStepperChange(settings.defaultFocusDuration + 5)}
                  style={styles.inlineStepperButton}
                >
                  <Text style={styles.inlineStepperText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Auto-start breaks */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Auto-start breaks</Text>
              <Text style={styles.settingSub}>Start break timers automatically</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Pressable
                onPress={() => updateSetting('autoStartBreaks', !settings.autoStartBreaks)}
                style={[styles.toggle, settings.autoStartBreaks && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, settings.autoStartBreaks && styles.toggleThumbActive]} />
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Auto-start focus blocks */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Auto-start focus blocks</Text>
              <Text style={styles.settingSub}>Start focus timers automatically</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Pressable
                onPress={() => updateSetting('autoStartFocus', !settings.autoStartFocus)}
                style={[styles.toggle, settings.autoStartFocus && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, settings.autoStartFocus && styles.toggleThumbActive]} />
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Sound & Haptics alerts */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Sound & haptic chimes</Text>
              <Text style={styles.settingSub}>Auditory focus alarm triggers</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Pressable
                onPress={() => updateSetting('soundHaptics', !settings.soundHaptics)}
                style={[styles.toggle, settings.soundHaptics && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, settings.soundHaptics && styles.toggleThumbActive]} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* SECTION - CALENDAR */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Calendar</Text>
        <View style={styles.card}>
          
          {/* First day of week (Segmented control) */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>First day of week</Text>
              <Text style={styles.settingSub}>Active date grid indexing starting</Text>
            </View>
            <View style={styles.settingRowRight}>
              <View style={styles.segmentedSelector}>
                {(['Sun', 'Mon'] as const).map((day) => {
                  const isActive = settings.firstDayOfWeek === day;
                  return (
                    <Pressable
                      key={day}
                      onPress={() => updateSetting('firstDayOfWeek', day)}
                      style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                    >
                      <Text style={[styles.segmentButtonText, isActive && styles.segmentButtonTextActive]}>
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Show declined events */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Show declined events</Text>
              <Text style={styles.settingSub}>Keep declined invite blocks visible</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Pressable
                onPress={() => updateSetting('showDeclinedEvents', !settings.showDeclinedEvents)}
                style={[styles.toggle, settings.showDeclinedEvents && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, settings.showDeclinedEvents && styles.toggleThumbActive]} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* SECTION - AI COPILOT PREFERENCES */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>AI Copilot</Text>
        <View style={styles.card}>
          
          {/* Allow store access toggles */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Allow schedule access</Text>
              <Text style={styles.settingSub}>Enables Copilot calendar RAG</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Pressable
                onPress={() => updateSetting('allowCalendarAccess', !settings.allowCalendarAccess)}
                style={[styles.toggle, settings.allowCalendarAccess && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, settings.allowCalendarAccess && styles.toggleThumbActive]} />
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Allow habits access</Text>
              <Text style={styles.settingSub}>Enables Copilot habit stats access</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Pressable
                onPress={() => updateSetting('allowHabitsAccess', !settings.allowHabitsAccess)}
                style={[styles.toggle, settings.allowHabitsAccess && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, settings.allowHabitsAccess && styles.toggleThumbActive]} />
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          {/* AI Response style segmented control */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Response style</Text>
              <Text style={styles.settingSub}>Adjusts reasoning detail tone</Text>
            </View>
            <View style={styles.settingRowRight}>
              <View style={styles.segmentedSelector}>
                {(['Concise', 'Creative'] as const).map((style) => {
                  const isActive = settings.responseStyle === style;
                  return (
                    <Pressable
                      key={style}
                      onPress={() => updateSetting('responseStyle', style)}
                      style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                    >
                      <Text style={[styles.segmentButtonText, isActive && styles.segmentButtonTextActive]}>
                        {style}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* SECTION - APPEARANCE */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          
          {/* Theme setting segmented control */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>App Theme</Text>
              <Text style={styles.settingSub}>System default handles light/dark transitions</Text>
            </View>
            <View style={styles.settingRowRight}>
              <View style={styles.segmentedSelector}>
                {(['Light', 'Dark', 'System'] as const).map((t) => {
                  const isActive = settings.theme === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => updateSetting('theme', t)}
                      style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                    >
                      <Text style={[styles.segmentButtonText, isActive && styles.segmentButtonTextActive]}>
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* App Icon selector list */}
          <Text style={styles.subCardLabel}>App Icon Customizer</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.appIconRow}>
            {APP_ICONS.map((icon) => {
              const isSelected = settings.appIcon === icon.id;
              return (
                <Pressable
                  key={icon.id}
                  onPress={() => updateSetting('appIcon', icon.id)}
                  style={[
                    styles.appIconCell,
                    isSelected && { borderColor: icon.color, borderWidth: 2 }
                  ]}
                >
                  <Text style={styles.appIconChar}>{icon.char}</Text>
                  <Text style={styles.appIconLabel}>{icon.label}</Text>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: icon.color }]}>
                      <Text style={styles.checkBadgeText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* SECTION - PRIVACY & DATA */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        <View style={styles.card}>
          
          {/* Export data simulated trigger */}
          <Pressable
            onPress={() => {
              Vibration.vibrate(8);
              Alert.alert('Export data', 'Your complete profile, habits records, and events were zipped and sent to your email.');
            }}
            style={styles.listOptionRow}
            android_ripple={{ color: colors.border }}
          >
            <Text style={styles.listOptionText}>📤 Export Application Data</Text>
          </Pressable>

          <View style={styles.divider} />

          {/* Clear all data secure row */}
          <Pressable
            onPress={() => {
              Vibration.vibrate(12);
              setIsDeleteModalVisible(true);
            }}
            style={styles.listOptionRow}
            android_ripple={{ color: colors.border }}
          >
            <Text style={[styles.listOptionText, styles.destructiveText]}>
              🚨 Clear All Local Data
            </Text>
          </Pressable>
        </View>
      </View>

      {/* SECTION - ABOUT */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingSub}>Build v1.4.2 (Production release)</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Pressable
            onPress={() => Alert.alert('Rate App', 'Thank you! Redirecting to App Store.')}
            style={styles.listOptionRow}
          >
            <Text style={styles.listOptionText}>★ Rate App</Text>
          </Pressable>
        </View>
      </View>

      {/* Clear Data secure double-confirmation dialog */}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalAlertBox}>
            <Text style={styles.alertTitle}>Destructive Purge</Text>
            <Text style={styles.alertDesc}>
              This action will completely delete all schedule calendar events, custom habits logs, focus data, and settings preferences from this device.
            </Text>
            <Text style={styles.alertConfirmationPrompt}>
              To confirm security purge, type <Text style={{ fontWeight: 'bold', color: colors.danger }}>DELETE</Text> below:
            </Text>

            {/* Input field validation */}
            <TextInput
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="Type DELETE to purge"
              placeholderTextColor={colors.textLight}
              autoCapitalize="characters"
              style={styles.alertTextInput}
            />

            <View style={styles.alertButtonsRow}>
              <Pressable
                onPress={() => {
                  setIsDeleteModalVisible(false);
                  setDeleteConfirmText('');
                }}
                style={styles.alertButton}
              >
                <Text style={styles.alertButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                disabled={deleteConfirmText !== 'DELETE'}
                onPress={handlePurgeAllData}
                style={[
                  styles.alertButton,
                  styles.alertButtonDestructive,
                  deleteConfirmText !== 'DELETE' && styles.alertButtonDestructiveDisabled
                ]}
              >
                <Text style={[
                  styles.alertButtonText,
                  styles.alertButtonTextDestructive,
                  deleteConfirmText !== 'DELETE' && styles.alertButtonTextDestructiveDisabled
                ]}>
                  Purge Data
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 16
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraIcon: {
    fontSize: 11
  },
  profileDetails: {
    gap: 4
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textSubdued
  },
  sectionContainer: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 4
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16
  },
  settingRowLeft: {
    flex: 1,
    marginRight: 20,
    gap: 4
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  settingSub: {
    fontSize: 11,
    color: colors.textLight
  },
  settingRowRight: {
    justifyContent: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceSecondary,
    marginHorizontal: 16
  },

  // Spring Toggle Switch
  toggle: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center'
  },
  toggleActive: {
    backgroundColor: colors.primary
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  toggleThumbActive: {
    alignSelf: 'flex-end'
  },

  // Expanding rows
  expandingTriggerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surfaceSecondary
  },
  expandingTriggerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSubdued
  },
  chevronText: {
    fontSize: 10,
    color: colors.textLight
  },
  expandedContent: {
    padding: 16,
    backgroundColor: colors.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  pickerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  timePickerContainer: {
    flexDirection: 'row',
    gap: 8
  },
  pickerOptionCell: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  pickerOptionCellActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight
  },
  pickerOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSubdued
  },
  pickerOptionTextActive: {
    color: colors.primary
  },

  // Stepper styles
  inlineStepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  inlineStepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inlineStepperText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18
  },
  inlineStepperValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 32,
    textAlign: 'center'
  },

  // Segmented selector styles
  segmentedSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 2
  },
  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  segmentButtonActive: {
    backgroundColor: colors.surface
  },
  segmentButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight
  },
  segmentButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: '700'
  },

  // App Icon Customize styles
  subCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10
  },
  appIconRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10
  },
  appIconCell: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 6
  },
  appIconChar: {
    fontSize: 26
  },
  appIconLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textSubdued
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 'bold'
  },

  // List option row styles
  listOptionRow: {
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  listOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  destructiveText: {
    color: colors.danger
  },

  // Alert Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalAlertBox: {
    width: 300,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  alertDesc: {
    fontSize: 12,
    color: colors.textSubdued,
    textAlign: 'center',
    lineHeight: 18
  },
  alertConfirmationPrompt: {
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 4
  },
  alertTextInput: {
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center'
  },
  alertButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  alertButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  alertButtonDestructive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger
  },
  alertButtonDestructiveDisabled: {
    opacity: 0.4
  },
  alertButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSubdued
  },
  alertButtonTextDestructive: {
    color: colors.white
  },
  alertButtonTextDestructiveDisabled: {
    color: 'rgba(255,255,255,0.6)'
  }
});
