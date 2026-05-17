import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../models/habit.dart';
import '../../providers/habit_provider.dart';
import 'habit_detail_screen.dart';

class HabitsScreen extends StatelessWidget {
  const HabitsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final habitProvider = Provider.of<HabitProvider>(context);

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
          'HABIT TRACKER',
          style: AppTheme.productName.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Brief
            Text(
              'RECHARGE & RE-WIRE',
              style: AppTheme.captionText.copyWith(color: AppTheme.electricBlue, fontWeight: FontWeight.bold, letterSpacing: 1.0),
            ),
            const SizedBox(height: AppTheme.space4),
            Text(
              'Build long-term neural pathways through systematic daily action.',
              style: AppTheme.bodyRegular.copyWith(color: AppTheme.pewter),
            ),
            const SizedBox(height: AppTheme.space24),

            // Habits streak meters list
            if (habitProvider.habits.isEmpty)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 48.0),
                alignment: Alignment.center,
                child: Text('No active habits configured.', style: AppTheme.bodyRegular.copyWith(color: AppTheme.pewter)),
              )
            else
              ...habitProvider.habits.map((habit) {
                final isDoneToday = habitProvider.isCompletedToday(habit.id);

                return Container(
                  margin: const EdgeInsets.only(bottom: AppTheme.space12),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTheme.cloudGray, width: 1.5),
                    borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                  ),
                  child: ListTile(
                    leading: GestureDetector(
                      onTap: () {
                        habitProvider.toggleHabitCompletion(habit.id);
                      },
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: isDoneToday ? AppTheme.electricBlue : AppTheme.lightAsh,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isDoneToday ? AppTheme.electricBlue : AppTheme.paleSilver.withOpacity(0.3),
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Icon(
                          Icons.check,
                          color: isDoneToday ? AppTheme.pureWhite : AppTheme.pewter,
                          size: 16,
                        ),
                      ),
                    ),
                    title: Text(
                      habit.title,
                      style: AppTheme.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        decoration: isDoneToday ? TextDecoration.lineThrough : null,
                        color: isDoneToday ? AppTheme.pewter : AppTheme.carbonDark,
                      ),
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4.0),
                      child: Row(
                        children: [
                          const Icon(Icons.local_fire_department, color: Colors.orangeAccent, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            '${habit.streak} DAY STREAK (BEST: ${habit.longestStreak})',
                            style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppTheme.pewter),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => HabitDetailScreen(habitId: habit.id)),
                      );
                    },
                  ),
                );
              }).toList(),
          ],
        ),
      ),
    );
  }
}
