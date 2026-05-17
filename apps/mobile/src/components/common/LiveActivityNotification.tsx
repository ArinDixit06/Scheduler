import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
  Dimensions,
  Platform,
  Vibration
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusStore } from '../../store/focusStore';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

type LiveActivityNotificationProps = {
  currentScreen: string | null;
};

export function LiveActivityNotification({ currentScreen }: LiveActivityNotificationProps) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const {
    secondsLeft,
    isRunning,
    currentPhase,
    focusSetting,
    shortBreakSetting,
    longBreakSetting,
    startTimer,
    pauseTimer,
    skipPhase
  } = useFocusStore();

  // Slide translation value (starts off-screen top)
  const slideAnim = useRef(new Animated.Value(-120)).current;

  // Determine if Live Activity should be visible
  // Visible if: Timer is running AND user is NOT on the dedicated Focus screen
  const shouldBeVisible = isRunning && currentScreen !== 'Focus' && currentScreen !== 'SessionActive';

  useEffect(() => {
    if (shouldBeVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -140,
        useNativeDriver: true,
        friction: 8,
        tension: 40
      }).start();
    }
  }, [shouldBeVisible]);

  // Calculations for dynamic progress bar
  const totalSecondsForPhase = () => {
    if (currentPhase === 'Short Break') return shortBreakSetting * 60;
    if (currentPhase === 'Long Break') return longBreakSetting * 60;
    return focusSetting * 60;
  };

  const limit = totalSecondsForPhase();
  const elapsed = Math.max(0, limit - secondsLeft);
  const ratio = limit > 0 ? elapsed / limit : 0;
  const progressPercent = Math.min(100, Math.round(ratio * 100));

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const getPhaseColor = () => {
    if (currentPhase === 'Short Break') return '#F59E0B'; // Orange
    if (currentPhase === 'Long Break') return '#10B981'; // Green
    return '#3B82F6'; // Blue
  };

  const getPhaseEmoji = () => {
    if (currentPhase === 'Short Break') return '☕';
    if (currentPhase === 'Long Break') return '🌴';
    return '⚡';
  };

  const handleHeaderTap = () => {
    Vibration.vibrate(8);
    // Deep link directly to More -> Focus stack
    navigation.navigate('More', { screen: 'Focus' });
  };

  return (
    <Animated.View
      style={[
        styles.outerContainer,
        {
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Pressable onPress={handleHeaderTap} style={styles.bubbleCard}>
        {/* Left Timer section */}
        <View style={styles.leftMeta}>
          <Text style={styles.phaseBadgeText}>{getPhaseEmoji()}</Text>
          <Text style={styles.timeLabel}>{timeStr}</Text>
        </View>

        {/* Center Task & Progress section */}
        <View style={styles.centerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.phaseLabel} numberOfLines={1}>
              {currentPhase === 'Focus' ? 'Focus Block' : 'Break Time'}
            </Text>
            <Text style={styles.percentText}>{progressPercent}%</Text>
          </View>
          
          {/* Progress Bar Container */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: getPhaseColor()
                }
              ]}
            />
          </View>
        </View>

        {/* Right Playback controls */}
        <View style={styles.rightActions}>
          <Pressable
            onPress={() => {
              Vibration.vibrate(10);
              if (isRunning) {
                pauseTimer();
              } else {
                startTimer();
              }
            }}
            style={({ pressed }) => [
              styles.controlCircle,
              pressed && styles.pressedCircle
            ]}
          >
            <Ionicons
              name={isRunning ? 'pause' : 'play'}
              size={15}
              color="#FFFFFF"
            />
          </Pressable>

          <Pressable
            onPress={() => {
              Vibration.vibrate(12);
              skipPhase();
            }}
            style={({ pressed }) => [
              styles.controlCircle,
              pressed && styles.pressedCircle
            ]}
          >
            <Ionicons name="play-skip-forward" size={13} color="#9CA3AF" />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 28,
    left: 0,
    right: 0,
    zIndex: 99999,
    alignItems: 'center',
    paddingHorizontal: 16
  },
  bubbleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: WINDOW_WIDTH - 32,
    height: 66,
    borderRadius: 22,
    backgroundColor: '#1E1E24',
    borderWidth: 1.5,
    borderColor: '#353545',
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 12
  },
  phaseBadgeText: {
    fontSize: 16
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 0.5
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 12
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  phaseLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#E5E7EB',
    letterSpacing: 0.2
  },
  percentText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9CA3AF'
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#353545',
    width: '100%',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  controlCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2D2D3B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3D3D4E'
  },
  pressedCircle: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }]
  }
});
