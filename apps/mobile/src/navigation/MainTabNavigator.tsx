import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayScreen } from '../screens/today/TodayScreen';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { HabitsScreen } from '../screens/habits/HabitsScreen';
import { FocusScreen } from '../screens/focus/FocusScreen';
import { AICopilotScreen } from '../screens/ai/AICopilotScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

export function MainTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Tasks" component={TaskListScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Focus" component={FocusScreen} />
      <Tab.Screen name="AI" component={AICopilotScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
