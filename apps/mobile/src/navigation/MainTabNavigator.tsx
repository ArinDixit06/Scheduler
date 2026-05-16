import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodayScreen } from '../screens/today/TodayScreen';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { NewTaskScreen } from '../screens/tasks/NewTaskScreen';
import { ProjectDetailScreen } from '../screens/tasks/ProjectDetailScreen';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { EventDetailScreen } from '../screens/calendar/EventDetailScreen';
import { HabitsScreen } from '../screens/habits/HabitsScreen';
import { HabitDetailScreen } from '../screens/habits/HabitDetailScreen';
import { FocusScreen } from '../screens/focus/FocusScreen';
import { SessionActiveScreen } from '../screens/focus/SessionActiveScreen';
import { AICopilotScreen } from '../screens/ai/AICopilotScreen';
import { InsightsScreen } from '../screens/ai/InsightsScreen';
import { WeeklyRecapScreen } from '../screens/ai/WeeklyRecapScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { IntegrationsScreen } from '../screens/settings/IntegrationsScreen';
import { NotificationSettingsScreen } from '../screens/settings/NotificationSettingsScreen';
import { AnalyticsDashboard } from '../screens/analytics/AnalyticsDashboard';
import { MoreScreen } from '../screens/settings/MoreScreen';
import { palette } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="HomeDashboard" component={TodayScreen} options={{ title: 'Home' }} />
    </Stack.Navigator>
  );
}

function CreateStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="CreateHome" component={NewTaskScreen} options={{ title: 'Quick Capture' }} />
    </Stack.Navigator>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="MoreHome" component={MoreScreen} options={{ title: 'More' }} />
      <Stack.Screen name="Tasks" component={TaskListScreen} options={{ title: 'Tasks' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Detail' }} />
      <Stack.Screen name="NewTask" component={NewTaskScreen} options={{ title: 'New Task' }} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project Detail' }} />
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event Detail' }} />
      <Stack.Screen name="Habits" component={HabitsScreen} options={{ title: 'Habits' }} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Habit Detail' }} />
      <Stack.Screen name="Focus" component={FocusScreen} options={{ title: 'Focus' }} />
      <Stack.Screen name="SessionActive" component={SessionActiveScreen} options={{ title: 'Session' }} />
      <Stack.Screen name="AI" component={AICopilotScreen} options={{ title: 'AI Copilot' }} />
      <Stack.Screen name="Insights" component={InsightsScreen} options={{ title: 'Insights' }} />
      <Stack.Screen name="WeeklyRecap" component={WeeklyRecapScreen} options={{ title: 'Weekly Recap' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="Integrations" component={IntegrationsScreen} options={{ title: 'Integrations' }} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboard} options={{ title: 'Analytics' }} />
    </Stack.Navigator>
  );
}

function CreateDockButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.createDockWrap}>
      <View style={styles.createDockButton}>
        <Text style={styles.createDockPlus}>+</Text>
      </View>
      <Text style={styles.createDockLabel}>Create</Text>
    </Pressable>
  );
}

const stackOptions = {
  headerShadowVisible: false,
  headerTitleStyle: {
    color: palette.navy,
    fontWeight: '700' as const
  },
  headerStyle: {
    backgroundColor: palette.ash
  },
  contentStyle: {
    backgroundColor: palette.ash
  }
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.blue,
        tabBarInactiveTintColor: palette.pewter,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.tabLabel, { color }]}>Home</Text>
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateStack}
        options={{
          tabBarButton: ({ onPress }) => <CreateDockButton onPress={onPress} />
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.tabLabel, { color }]}>More</Text>
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 82,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopColor: '#E8ECF4'
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600'
  },
  createDockWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    width: 110
  },
  createDockButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: palette.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.blue,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  createDockPlus: {
    color: palette.white,
    fontSize: 30,
    lineHeight: 30,
    marginTop: -1
  },
  createDockLabel: {
    marginTop: 6,
    color: palette.pewter,
    fontSize: 12,
    fontWeight: '600'
  }
});
