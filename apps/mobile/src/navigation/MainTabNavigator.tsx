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
import { palette } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TasksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Tasks' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Detail' }} />
      <Stack.Screen name="NewTask" component={NewTaskScreen} options={{ title: 'New Task' }} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project Detail' }} />
    </Stack.Navigator>
  );
}

function CalendarStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CalendarHome" component={CalendarScreen} options={{ title: 'Calendar' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event Detail' }} />
    </Stack.Navigator>
  );
}

function HabitsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HabitsHome" component={HabitsScreen} options={{ title: 'Habits' }} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Habit Detail' }} />
    </Stack.Navigator>
  );
}

function FocusStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FocusHome" component={FocusScreen} options={{ title: 'Focus' }} />
      <Stack.Screen name="SessionActive" component={SessionActiveScreen} options={{ title: 'Session' }} />
    </Stack.Navigator>
  );
}

function AIStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Copilot" component={AICopilotScreen} options={{ title: 'AI Copilot' }} />
      <Stack.Screen name="Insights" component={InsightsScreen} options={{ title: 'Insights' }} />
      <Stack.Screen name="WeeklyRecap" component={WeeklyRecapScreen} options={{ title: 'Weekly Recap' }} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="Integrations" component={IntegrationsScreen} options={{ title: 'Integrations' }} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboard} options={{ title: 'Analytics' }} />
    </Stack.Navigator>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.blue,
        tabBarInactiveTintColor: palette.pewter,
        tabBarStyle: { height: 62, paddingTop: 6 }
      }}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Tasks" component={TasksStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Habits" component={HabitsStack} />
      <Tab.Screen name="Focus" component={FocusStack} />
      <Tab.Screen name="AI" component={AIStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
}
