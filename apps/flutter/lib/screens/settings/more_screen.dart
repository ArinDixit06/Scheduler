import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/screen_shell.dart';
import '../focus/focus_screen.dart';
import '../ai/copilot_screen.dart';
import '../ai/insights_screen.dart';
import '../ai/weekly_recap_screen.dart';
import '../analytics/analytics_dashboard.dart';
import '../settings/settings_screen.dart';
import '../settings/integrations_screen.dart';
import '../settings/notification_settings_screen.dart';
import '../habits/habits_screen.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    // List of launchpad tiles matching a 3x3 grid layout (exactly 3 columns per row)
    final List<Map<String, dynamic>> launchItems = [
      {
        'title': 'FOCUS TIMER',
        'icon': Icons.timer_outlined,
        'screen': const FocusScreen(),
        'subtitle': 'Pomodoro halo'
      },
      {
        'title': 'HABITS',
        'icon': Icons.local_fire_department_outlined,
        'screen': const HabitsScreen(),
        'subtitle': 'Streak tracker'
      },
      {
        'title': 'AI COPILOT',
        'icon': Icons.psychology_outlined,
        'screen': const CopilotScreen(),
        'subtitle': 'Groq chat'
      },
      {
        'title': 'AI INSIGHTS',
        'icon': Icons.analytics_outlined,
        'screen': const InsightsScreen(),
        'subtitle': 'Weekly analysis'
      },
      {
        'title': 'WEEKLY RECAP',
        'icon': Icons.assignment_outlined,
        'screen': const WeeklyRecapScreen(),
        'subtitle': 'Task summaries'
      },
      {
        'title': 'ANALYTICS',
        'icon': Icons.bar_chart_outlined,
        'screen': const AnalyticsDashboard(),
        'subtitle': 'Performance stats'
      },
      {
        'title': 'SETTINGS',
        'icon': Icons.settings_outlined,
        'screen': SettingsScreen(onLogout: () {
          // Trigger logout reload
          auth.logout();
        }),
        'subtitle': 'Account configs'
      },
      {
        'title': 'SYNC CHANNELS',
        'icon': Icons.sync_outlined,
        'screen': const IntegrationsScreen(),
        'subtitle': 'Google Calendar'
      },
      {
        'title': 'ALERTS',
        'icon': Icons.notifications_active_outlined,
        'screen': const NotificationSettingsScreen(),
        'subtitle': 'Telemetry toggles'
      },
    ];

    return ScreenShell(
      title: 'CHRONOS LAUNCHPAD',
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // User Brief Header
            Container(
              padding: const EdgeInsets.all(AppTheme.space16),
              decoration: BoxDecoration(
                color: AppTheme.lightAsh,
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 20,
                    backgroundColor: AppTheme.carbonDark,
                    child: Text('AD', style: TextStyle(color: AppTheme.pureWhite, fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                  const SizedBox(width: AppTheme.space16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'ARIN DIXIT',
                          style: AppTheme.bodyMedium.copyWith(fontWeight: FontWeight.bold, fontSize: 15.0),
                        ),
                        Text(
                          'PRO SUITE MEMBER',
                          style: AppTheme.captionText.copyWith(color: AppTheme.electricBlue, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppTheme.space24),

            // Sleek 3-Column Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 0.85,
              ),
              itemCount: launchItems.length,
              itemBuilder: (context, index) {
                final item = launchItems[index];

                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => item['screen'] as Widget),
                    );
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppTheme.pureWhite,
                      border: Border.all(color: AppTheme.cloudGray, width: 1.5),
                      borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                    ),
                    padding: const EdgeInsets.all(AppTheme.space8),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: AppTheme.lightAsh,
                            borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                          ),
                          alignment: Alignment.center,
                          child: Icon(
                            item['icon'] as IconData,
                            color: AppTheme.electricBlue,
                            size: 20,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          item['title'] as String,
                          style: AppTheme.captionText.copyWith(
                            fontSize: 9.0,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.carbonDark,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          item['subtitle'] as String,
                          style: AppTheme.captionText.copyWith(
                            fontSize: 7.5,
                            color: AppTheme.pewter,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
