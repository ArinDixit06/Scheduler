import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../providers/habit_provider.dart';

class HabitDetailScreen extends StatelessWidget {
  final String habitId;
  const HabitDetailScreen({Key? key, required this.habitId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final habitProvider = Provider.of<HabitProvider>(context);
    final habitIndex = habitProvider.habits.indexWhere((h) => h.id == habitId);

    if (habitIndex == -1) {
      return Scaffold(
        appBar: AppBar(title: const Text('Habit Not Found')),
        body: const Center(child: Text('This habit does not exist.')),
      );
    }

    final habit = habitProvider.habits[habitIndex];
    final isCompletedToday = habitProvider.isCompletedToday(habit.id);

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
          'HABIT DATA',
          style: AppTheme.productName.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Title & Flame
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: const BoxDecoration(
                    color: AppTheme.lightAsh,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: const Icon(Icons.local_fire_department, color: Colors.orangeAccent, size: 28),
                ),
                const SizedBox(width: AppTheme.space16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        habit.title,
                        style: AppTheme.displayTitle.copyWith(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.carbonDark),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Created on ${habit.createdAt.toIso8601String().split('T')[0]}',
                        style: AppTheme.captionText,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppTheme.space24),
            const Divider(color: AppTheme.cloudGray, height: 1.0),
            const SizedBox(height: AppTheme.space24),

            // Streak Statistics Cards
            Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.cloudGray),
                      borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                    ),
                    padding: const EdgeInsets.all(AppTheme.space16),
                    child: Column(
                      children: [
                        Text('CURRENT STREAK', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: AppTheme.space8),
                        Text(
                          '${habit.streak} Days',
                          style: AppTheme.displayTitle.copyWith(fontSize: 18.0, color: AppTheme.electricBlue, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: AppTheme.space12),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.cloudGray),
                      borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                    ),
                    padding: const EdgeInsets.all(AppTheme.space16),
                    child: Column(
                      children: [
                        Text('HISTORIC BEST', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: AppTheme.space8),
                        Text(
                          '${habit.longestStreak} Days',
                          style: AppTheme.displayTitle.copyWith(fontSize: 18.0, color: AppTheme.carbonDark, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppTheme.space24),

            // Completion Action Button
            ElevatedButton(
              onPressed: () {
                habitProvider.toggleHabitCompletion(habit.id);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: isCompletedToday ? AppTheme.pewter : AppTheme.electricBlue,
                foregroundColor: AppTheme.pureWhite,
                shadowColor: Colors.transparent,
                elevation: 0.0,
                padding: const EdgeInsets.symmetric(vertical: AppTheme.space16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                ),
              ),
              child: Text(
                isCompletedToday ? 'MARK AS INCOMPLETE' : 'COMPLETE TODAY\'S BLOCK',
                style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
            ),
            const SizedBox(height: AppTheme.space24),

            // Calendar Visualizer Grid Brief
            Text('LOGGED DATES HISTORY', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.space12),
            Container(
              padding: const EdgeInsets.all(AppTheme.space16),
              decoration: BoxDecoration(
                color: AppTheme.lightAsh,
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('DATE STATUS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.pewter)),
                      Text('SUCCESS STATE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.pewter)),
                    ],
                  ),
                  const SizedBox(height: AppTheme.space12),
                  ...List.generate(7, (index) {
                    final targetDate = DateTime.now().subtract(Duration(days: index));
                    final dateKey = "${targetDate.year}-${targetDate.month.toString().padLeft(2, '0')}-${targetDate.day.toString().padLeft(2, '0')}";
                    final count = habit.entries[dateKey] ?? 0;
                    final wasCompleted = count >= habit.targetCount;

                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            index == 0 ? "Today" : index == 1 ? "Yesterday" : "${targetDate.month}/${targetDate.day}",
                            style: AppTheme.bodyMedium,
                          ),
                          Icon(
                            wasCompleted ? Icons.check_circle_rounded : Icons.radio_button_off_rounded,
                            color: wasCompleted ? AppTheme.electricBlue : AppTheme.pewter.withOpacity(0.5),
                            size: 18,
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
