import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
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
import 'screens/tasks/new_task_screen.dart';
import 'screens/calendar/calendar_screen.dart';
import 'screens/settings/more_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    debugPrint("Failed to load .env file: $e");
  }
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
    if (index == 2) {
      // Create Stack - Slide Up NewTaskScreen Modally!
      Navigator.push(
        context,
        MaterialPageRoute(
          fullscreenDialog: true,
          builder: (context) => const NewTaskScreen(),
        ),
      );
      return;
    }
    setState(() => _currentIndex = index > 2 ? index - 1 : index);
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    final List<Widget> screens = [
      TodayScreen(onTabChange: (targetIndex) {
        // Redirection mapping:
        // TodayScreen's Copilot (Index 4) redirects to Launchpad (Tab Index 3) -> AI Screen
        setState(() => _currentIndex = 3);
      }),
      const TaskListScreen(),
      const CalendarScreen(),
      const MoreScreen(),
    ];

    // Compute active tab bar selection
    int currentTabSelection = _currentIndex >= 2 ? _currentIndex + 1 : _currentIndex;

    return Scaffold(
      backgroundColor: AppTheme.pureWhite,
      body: Stack(
        children: [
          // Render the selected tab screen content
          Padding(
            padding: EdgeInsets.only(bottom: AppTheme.space8 + 64 + (bottomPadding > 0 ? bottomPadding : AppTheme.space8)),
            child: IndexedStack(
              index: _currentIndex,
              children: screens,
            ),
          ),

          // Custom Premium Minimalist Bottom Navigation Bar
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              decoration: const BoxDecoration(
                color: AppTheme.pureWhite,
                border: Border(
                  top: BorderSide(color: AppTheme.cloudGray, width: 1.0),
                ),
              ),
              padding: EdgeInsets.only(
                top: AppTheme.space8,
                bottom: bottomPadding > 0 ? bottomPadding : AppTheme.space8,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  _buildTabItem(0, 'TODAY', Icons.dashboard_outlined, currentTabSelection),
                  _buildTabItem(1, 'TASKS', Icons.check_box_outlined, currentTabSelection),
                  
                  // Central Prominent Create Button
                  _buildCentralCreateButton(),

                  _buildTabItem(3, 'AGENDA', Icons.calendar_month_outlined, currentTabSelection),
                  _buildTabItem(4, 'MORE', Icons.menu_outlined, currentTabSelection),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabItem(int index, String label, IconData icon, int currentTabSelection) {
    final isSelected = currentTabSelection == index;

    return GestureDetector(
      onTap: () => _onTabSelect(index),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        height: 52,
        width: 60,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? AppTheme.electricBlue : AppTheme.pewter,
              size: 22,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: AppTheme.captionText.copyWith(
                fontSize: 9.0,
                color: isSelected ? AppTheme.electricBlue : AppTheme.pewter,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCentralCreateButton() {
    return GestureDetector(
      onTap: () => _onTabSelect(2),
      behavior: HitTestBehavior.opaque,
      child: Container(
        width: 100,
        margin: const EdgeInsets.only(bottom: 2),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: const BoxDecoration(
                color: AppTheme.electricBlue,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: const Icon(
                Icons.add_rounded,
                color: AppTheme.pureWhite,
                size: 28,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              'CREATE',
              style: AppTheme.captionText.copyWith(
                fontSize: 9.0,
                color: AppTheme.pewter,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
