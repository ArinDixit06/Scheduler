import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'constants/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/task_provider.dart';
import 'providers/calendar_provider.dart';
import 'providers/habit_provider.dart';
import 'providers/focus_provider.dart';
import 'providers/copilot_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/today/today_screen.dart';
import 'screens/tasks/task_list_screen.dart';
import 'screens/calendar/calendar_screen.dart';
import 'screens/focus/focus_screen.dart';
import 'screens/ai/copilot_screen.dart';
import 'screens/settings/settings_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ApexApp());
}

class ApexApp extends StatelessWidget {
  const ApexApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => TaskProvider()),
        ChangeNotifierProvider(create: (_) => CalendarProvider()),
        ChangeNotifierProvider(create: (_) => HabitProvider()),
        ChangeNotifierProvider(create: (_) => FocusProvider()),
        ChangeNotifierProvider(create: (_) => CopilotProvider()),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return MaterialApp(
            title: 'APEX',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            home: auth.isLoggedIn
                ? const MainTabNavigator()
                : LoginScreen(onLoginSuccess: () {}),
          );
        },
      ),
    );
  }
}

class MainTabNavigator extends StatefulWidget {
  const MainTabNavigator({Key? key}) : super(key: key);

  @override
  State<MainTabNavigator> createState() => _MainTabNavigatorState();
}

class _MainTabNavigatorState extends State<MainTabNavigator> {
  int _currentIndex = 0;

  void _onTabSelect(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    final List<Widget> screens = [
      TodayScreen(onTabChange: _onTabSelect),
      const TaskListScreen(),
      const FocusScreen(),
      const CalendarScreen(),
      SettingsScreen(onLogout: () {
        _onTabSelect(0);
      }),
    ];

    return Scaffold(
      backgroundColor: AppTheme.pureWhite,
      body: Stack(
        children: [
          // Render selected screen contents
          IndexedStack(
            index: _currentIndex,
            children: screens,
          ),

          // Custom Subtractive Bottom Navigation Bar
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              decoration: BoxDecoration(
                color: AppTheme.pureWhite,
                border: const Border(
                  top: BorderSide(color: AppTheme.cloudGray, width: 1.0),
                ),
              ),
              padding: EdgeInsets.only(
                top: AppTheme.space8,
                bottom: bottomPadding > 0 ? bottomPadding : AppTheme.space8,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildTabItem(0, 'TODAY', Icons.dashboard_outlined),
                  _buildTabItem(1, 'TASKS', Icons.checklist_outlined),
                  _buildTabItem(2, 'FOCUS', Icons.timer_outlined),
                  _buildTabItem(3, 'AGENDA', Icons.calendar_month_outlined),
                  _buildTabItem(4, 'CONFIG', Icons.settings_outlined),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabItem(int index, String label, IconData icon) {
    final isSelected = _currentIndex == index;

    return GestureDetector(
      onTap: () => _onTabSelect(index),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        height: AppTheme.space48,
        width: 60,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? AppTheme.electricBlue : AppTheme.pewter,
              size: 20,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: AppTheme.captionText.copyWith(
                fontSize: 9.0,
                color: isSelected ? AppTheme.electricBlue : AppTheme.pewter,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
