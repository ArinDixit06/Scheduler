import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../providers/task_provider.dart';
import '../../providers/focus_provider.dart';

class AnalyticsDashboard extends StatelessWidget {
  const AnalyticsDashboard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final taskProvider = Provider.of<TaskProvider>(context);
    final focusProvider = Provider.of<FocusProvider>(context);

    // Sprint analytics calculations
    final totalTasks = taskProvider.tasks.length;
    final doneTasks = taskProvider.completedTasks.length;
    final todoTasks = taskProvider.todoTasks.length;

    // Fake daily focus times for weekly outlines chart (minutes completed per day)
    final List<Map<String, dynamic>> dailyFocusMins = [
      {'day': 'MO', 'mins': 45},
      {'day': 'TU', 'mins': 90},
      {'day': 'WE', 'mins': 120},
      {'day': 'TH', 'mins': 60},
      {'day': 'FR', 'mins': 150},
      {'day': 'SA', 'mins': 30},
      {'day': 'SU', 'mins': 0},
    ];

    // Find max value to normalize column height scale
    final maxMins = dailyFocusMins.fold<int>(1, (max, item) => (item['mins'] as int) > max ? item['mins'] as int : max);

    return Scaffold(
      backgroundColor: AppTheme.pureWhite,
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0.0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.carbonDark, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'ANALYTICS LEDGER',
          style: AppTheme.productName.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Subtitle
            Text(
              'PRODUCTIVITY TELEMETRY',
              style: AppTheme.captionText.copyWith(color: AppTheme.electricBlue, fontWeight: FontWeight.bold, letterSpacing: 1.0),
            ),
            const SizedBox(height: AppTheme.space4),
            Text(
              'Minimalist outline graphs representing sprint loads and active focus logs.',
              style: AppTheme.bodyRegular.copyWith(color: AppTheme.pewter),
            ),
            const SizedBox(height: AppTheme.space24),

            // Weekly focus duration outline chart
            Text('WEEKLY FOCUS TIME (MINUTES)', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.space16),
            Container(
              height: 180,
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.space12, vertical: AppTheme.space16),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.cloudGray, width: 1.5),
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: dailyFocusMins.map((dayItem) {
                  final mins = dayItem['mins'] as int;
                  final heightRatio = mins / maxMins;
                  final columnHeight = heightRatio * 110.0 + 10.0;

                  return Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        '$mins',
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.pewter),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        width: 24,
                        height: columnHeight,
                        decoration: BoxDecoration(
                          color: mins > 0 ? AppTheme.electricBlue.withOpacity(0.08) : Colors.transparent,
                          border: Border.all(
                            color: mins > 0 ? AppTheme.electricBlue : AppTheme.cloudGray,
                            width: 1.5,
                          ),
                          borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        dayItem['day'] as String,
                        style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: AppTheme.space24),

            // Tasks stats breakdown grid
            Text('SPRINT BREAKDOWN', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.space12),
            Row(
              children: [
                _buildStatPill('TOTAL TICKETS', '$totalTasks', AppTheme.carbonDark),
                const SizedBox(width: AppTheme.space12),
                _buildStatPill('COMPLETED', '$doneTasks', Colors.greenAccent),
                const SizedBox(width: AppTheme.space12),
                _buildStatPill('BACKLOG TODO', '$todoTasks', AppTheme.electricBlue),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatPill(String label, String count, Color accentColor) {
    return Expanded(
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.lightAsh,
          borderRadius: BorderRadius.circular(AppTheme.radiusCard),
        ),
        padding: const EdgeInsets.all(AppTheme.space12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: AppTheme.captionText.copyWith(fontSize: 8.5, fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: AppTheme.space8),
            Text(
              count,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: accentColor == Colors.greenAccent ? Colors.green.shade700 : accentColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
