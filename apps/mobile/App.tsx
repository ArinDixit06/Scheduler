import 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppStore } from './src/store/appStore';
import { useFocusStore } from './src/store/focusStore';
import { usePlannerStore } from './src/store/plannerStore';
import { FloatingTimerPill } from './src/components/common/FloatingTimerPill';
import { LiveActivityNotification } from './src/components/common/LiveActivityNotification';

const queryClient = new QueryClient();

export default function App() {
  const theme = useAppStore((s) => s.theme);
  const navigationRef = useNavigationContainerRef();
  const [currentScreen, setCurrentScreen] = useState<string | null>(null);

  const isRunning = useFocusStore((s) => s.isRunning);
  const tickSecond = useFocusStore((s) => s.tickSecond);
  const addFocusSession = usePlannerStore((s) => s.addFocusSession);

  // Global persistent interval countdown
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        tickSecond(addFocusSession);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tickSecond, addFocusSession]);

  // Force-recalculate timer countdown immediately upon return from background background sleep
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isRunning) {
        tickSecond(addFocusSession);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isRunning, tickSecond, addFocusSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer
            ref={navigationRef}
            theme={theme === 'dark' ? DarkTheme : DefaultTheme}
            onStateChange={() => {
              const currentRouteName = navigationRef.getCurrentRoute()?.name;
              setCurrentScreen(currentRouteName || null);
            }}
          >
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <RootNavigator />
            <LiveActivityNotification currentScreen={currentScreen} />
            <FloatingTimerPill currentScreen={currentScreen} />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
