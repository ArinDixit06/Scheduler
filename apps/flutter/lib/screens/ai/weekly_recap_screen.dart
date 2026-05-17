import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../providers/task_provider.dart';
import '../../providers/habit_provider.dart';

class WeeklyRecapScreen extends StatelessWidget {
  const WeeklyRecapScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final taskProvider = Provider.of<TaskProvider>(context);
    final habitProvider = Provider.of<HabitProvider>(context);

    final completedCount = taskProvider.completedTasks.length;
    final totalCount = taskProvider.tasks.length;
    final activeStreakCount = habitProvider.habits.fold<int>(0, (max, h) => h.streak > max ? h.streak : max);

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
          'WEEKLY RECAP',
          style: AppTheme.productName.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header subtitle
            Text(
              'ACHIEVEMENTS LEDGER',
              style: AppTheme.captionText.copyWith(color: AppTheme.electricBlue, fontWeight: FontWeight.bold, letterSpacing: 1.0),
            ),
            const SizedBox(height: AppTheme.space4),
            Text(
              'A geometric audit of your completed milestones, active streaks, and cognitive achievements.',
              style: AppTheme.bodyRegular.copyWith(color: AppTheme.pewter),
            ),
            const SizedBox(height: AppTheme.space24),

            // Task completion ratio progress
            Container(
              padding: const EdgeInsets.all(AppTheme.space20),
              decoration: BoxDecoration(
                color: AppTheme.lightAsh,
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'TASK ARCHIVE COMPLETIONS',
                    style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: AppTheme.space12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '$completedCount OF $totalCount COMPLETED',
                        style: AppTheme.displayTitle.copyWith(fontWeight: FontWeight.bold, color: AppTheme.carbonDark, fontSize: 18.0),
                      ),
                      Text(
                        totalCount > 0 ? '${((completedCount / totalCount) * 100).toInt()}%' : '0%',
                        style: AppTheme.displayTitle.copyWith(color: AppTheme.electricBlue, fontWeight: FontWeight.bold, fontSize: 18.0),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.space12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppTheme.radiusIndicator),
                    child: LinearProgressIndicator(
                      value: totalCount > 0 ? (completedCount / totalCount) : 0.0,
                      backgroundColor: AppTheme.cloudGray,
                      color: AppTheme.electricBlue,
                      minHeight: 6,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppTheme.space20),

            // Streak Flame Record Card
            Container(
              padding: const EdgeInsets.all(AppTheme.space16),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.cloudGray),
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(
                      color: AppTheme.lightAsh,
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.local_fire_department, color: Colors.orangeAccent, size: 24),
                  ),
                  const SizedBox(width: AppTheme.space16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('MAX CURRENT STREAK', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text(
                          '$activeStreakCount Days Continuous Action',
                          style: AppTheme.bodyMedium.copyWith(fontWeight: FontWeight.bold, fontSize: 14.0),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppTheme.space24),

            // Ledger breakdown list
            Text('COMPLETED THIS WEEK', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.space12),
            if (taskProvider.completedTasks.isEmpty)
              Container(
                padding: const EdgeInsets.all(AppTheme.space16),
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.cloudGray),
                  borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                ),
                alignment: Alignment.center,
                child: Text('No completed backlog items recorded.', style: AppTheme.bodyRegular.copyWith(color: AppTheme.pewter)),
              )
            else
              ...taskProvider.completedTasks.map((t) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 6.0),
                  padding: const EdgeInsets.symmetric(horizontal: AppTheme.space16, vertical: AppTheme.space12),
                  decoration: BoxDecoration(
                    color: AppTheme.pureWhite,
                    border: Border.all(color: AppTheme.cloudGray),
                    borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: Colors.greenAccent, size: 18),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          t.title,
                          style: AppTheme.bodyMedium.copyWith(
                            decoration: TextDecoration.lineThrough,
                            color: AppTheme.pewter,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
          ],
        ),
      ),
    );
  }
}
