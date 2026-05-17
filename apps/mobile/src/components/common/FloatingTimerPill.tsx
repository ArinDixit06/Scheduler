import React, { useRef } from 'react';
import { StyleSheet, Text, View, Animated, PanResponder, Dimensions, Platform } from 'react-native';
import { useFocusStore } from '../../store/focusStore';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

type FloatingTimerPillProps = {
  currentScreen: string | null;
};

export function FloatingTimerPill({ currentScreen }: FloatingTimerPillProps) {
  const { secondsLeft, isRunning, currentPhase } = useFocusStore();

  // Draggable animation values (Starts bottom-right above tab bar)
  const pan = useRef(new Animated.ValueXY({ x: WINDOW_WIDTH - 95, y: WINDOW_HEIGHT - 170 })).current;

  // Custom PanResponder to handle smooth dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        
        let nextX = (pan.x as any)._value;
        let nextY = (pan.y as any)._value;

        // Snaps inside screen boundaries
        if (nextX < 12) nextX = 12;
        if (nextX > WINDOW_WIDTH - 92) nextX = WINDOW_WIDTH - 92;
        if (nextY < 40) nextY = 40;
        if (nextY > WINDOW_HEIGHT - 130) nextY = WINDOW_HEIGHT - 130;

        Animated.spring(pan, {
          toValue: { x: nextX, y: nextY },
          useNativeDriver: false,
          friction: 6,
          tension: 40
        }).start();
      }
    })
  ).current;

  // If timer is not running, or we are on the active Focus screen, don't show the pill
  // This is placed below the hook declarations to conform to the Rules of Hooks.
  if (!isRunning || currentScreen === 'Focus') {
    return null;
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.pillContainer,
        {
          transform: pan.getTranslateTransform()
        }
      ]}
    >
      <View style={styles.pillContent}>
        <Text style={styles.pillEmoji}>{currentPhase === 'Focus' ? '🎯' : '☕'}</Text>
        <Text style={styles.pillTime}>{timeStr}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 82,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E1E24',
    borderWidth: 1.5,
    borderColor: '#3D3D4E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
    zIndex: 99999
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  pillEmoji: {
    fontSize: 14
  },
  pillTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 0.5
  }
});
