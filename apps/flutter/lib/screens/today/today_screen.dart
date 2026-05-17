import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../constants/theme.dart';
import '../../models/task.dart';
import '../../models/event.dart';
import '../../providers/auth_provider.dart';
import '../../providers/task_provider.dart';
import '../../providers/calendar_provider.dart';
import '../../providers/habit_provider.dart';
import '../../providers/focus_provider.dart';
import '../../widgets/screen_shell.dart';

class TodayScreen extends StatelessWidget {
  final Function(int) onTabChange;

  const TodayScreen({Key? key, required this.onTabChange}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final dateStr = DateFormat('EEEE, MMMM d').format(now).toUpperCase();

    return ScreenShell(
      title: dateStr,
      trailingHeader: GestureDetector(
        onTap: () => onTabChange(4), // Navigate to AI Copilot
        child: const CircleAvatar(
          radius: 16.0,
          backgroundColor: AppTheme.carbonDark,
          child: Text(
            'AI',
            style: TextStyle(color: AppTheme.pureWhite, fontSize: 12.0, fontWeight: FontWeight.bold),
          ),
        ),
      ),
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Energy Check-in Widget
            _buildEnergyCheckIn(context),
            const SizedBox(height: AppTheme.space24),

            // 2. Circular Focus Sprint Hero Brief
            _buildFocusHeroBrief(context),
            const SizedBox(height: AppTheme.space24),

            // 3. Quick Checklist Cards
            _buildQuickChecklist(context),
            const SizedBox(height: AppTheme.space24),

            // 4. Habits Streak Flame Indicators
            _buildHabitsStreaks(context),
            const SizedBox(height: AppTheme.space24),

            // 5. Calendar Agenda Blocks
            _buildCalendarAgenda(context),
            const SizedBox(height: AppTheme.space48),
          ],
        ),
      ),
    );
  }

  Widget _buildEnergyCheckIn(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.lightAsh,
        borderRadius: BorderRadius.circular(AppTheme.radiusCard),
      ),
      padding: const EdgeInsets.all(AppTheme.space16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'DAILY ENERGY LOG',
            style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
          ),
          const SizedBox(height: AppTheme.space8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(5, (index) {
              final score = index + 1;
              final isActive = auth.todayEnergyScore == score;

              return GestureDetector(
                onTap: () => auth.logEnergy(score),
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: isActive ? AppTheme.electricBlue : AppTheme.pureWhite,
                    borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                    border: Border.all(
                      color: isActive ? AppTheme.electricBlue : AppTheme.paleSilver.withOpacity(0.3),
                      width: 1.0,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '$score',
                    style: AppTheme.productName.copyWith(
                      color: isActive ? AppTheme.pureWhite : AppTheme.carbonDark,
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildFocusHeroBrief(BuildContext context) {
    final focusProvider = Provider.of<FocusProvider>(context);

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.cloudGray, width: 1.5),
        borderRadius: BorderRadius.circular(AppTheme.radiusCard),
      ),
      padding: const EdgeInsets.all(AppTheme.space20),
      child: Row(
        children: [
          // Circular Progress Mock Icon
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 64,
                height: 64,
                child: CircularProgressIndicator(
                  value: focusProvider.sessionsCompletedCount > 0 ? 0.75 : 0.0,
                  backgroundColor: AppTheme.lightAsh,
                  color: AppTheme.electricBlue,
                  strokeWidth: 4.0,
                ),
              ),
              const Icon(Icons.timer_outlined, color: AppTheme.electricBlue, size: 28),
            ],
          ),
          const SizedBox(width: AppTheme.space20),

          // Details text
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'FOCUS SUMMARY',
                  style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
                ),
                const SizedBox(height: AppTheme.space4),
                Text(
                  '${focusProvider.totalMinutesCompleted} mins • ${focusProvider.sessionsCompletedCount} blocks',
                  style: AppTheme.productName,
                ),
                const SizedBox(height: AppTheme.space12),
                GestureDetector(
                  onTap: () => onTabChange(2), // Navigate to Focus Tab
                  child: Text(
                    'ENTER FOCUS ZONE →',
                    style: AppTheme.navItem.copyWith(color: AppTheme.electricBlue, fontSize: 12.0),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickChecklist(BuildContext context) {
    final taskProvider = Provider.of<TaskProvider>(context);
    final active = taskProvider.todoTasks.take(3).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'CRITICAL SPRINT ITEMS',
          style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
        const SizedBox(height: AppTheme.space12),
        if (active.isEmpty)
          Container(
            padding: const EdgeInsets.symmetric(vertical: AppTheme.space24),
            decoration: BoxDecoration(
              color: AppTheme.lightAsh,
              borderRadius: BorderRadius.circular(AppTheme.radiusCard),
            ),
            child: Text(
              'No active items. Ask AI to plan your day!',
              style: AppTheme.bodyRegular.copyWith(color: AppTheme.pewter),
              textAlign: TextAlign.center,
            ),
          )
        else
          ...active.map((task) {
            return Container(
              margin: const EdgeInsets.only(bottom: AppTheme.space8),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.cloudGray),
                borderRadius: BorderRadius.circular(AppTheme.radiusButton),
              ),
              child: ListTile(
                leading: Checkbox(
                  value: task.status == TaskStatus.done,
                  onChanged: (_) => taskProvider.toggleTaskStatus(task.id),
                  activeColor: AppTheme.electricBlue,
                  side: const BorderSide(color: AppTheme.paleSilver),
                ),
                title: Text(
                  task.title,
                  style: AppTheme.bodyMedium,
                ),
                subtitle: task.tags.isNotEmpty
                    ? Padding(
                        padding: const EdgeInsets.only(top: 4.0),
                        child: Text(
                          task.tags.join(' • ').toUpperCase(),
                          style: AppTheme.captionText,
                        ),
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(horizontal: AppTheme.space8),
              ),
            );
          }).toList(),
      ],
    );
  }

  Widget _buildHabitsStreaks(BuildContext context) {
    final habitProvider = Provider.of<HabitProvider>(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'HABITS & STREAKS',
          style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
        const SizedBox(height: AppTheme.space12),
        Row(
          children: habitProvider.habits.map((habit) {
            return Expanded(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: AppTheme.space4),
                decoration: BoxDecoration(
                  color: AppTheme.lightAsh,
                  borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                ),
                padding: const EdgeInsets.all(AppTheme.space12),
                child: Column(
                  children: [
                    const Icon(Icons.local_fire_department, color: AppTheme.electricBlue, size: 24),
                    const SizedBox(height: AppTheme.space4),
                    Text(
                      habit.title.split(' ')[0],
                      style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold),
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      '${habit.streak} days',
                      style: AppTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildCalendarAgenda(BuildContext context) {
    final cal = Provider.of<CalendarProvider>(context);
    final todayEvents = cal.events.where((e) {
      final now = DateTime.now();
      return e.startAt.year == now.year && e.startAt.month == now.month && e.startAt.day == now.day;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'TODAY\'S AGENDA',
              style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
            ),
            if (cal.isGoogleSynced)
              Text(
                'GOOGLE SYNCED',
                style: AppTheme.captionText.copyWith(color: AppTheme.electricBlue, fontWeight: FontWeight.bold),
              ),
          ],
        ),
        const SizedBox(height: AppTheme.space12),
        if (todayEvents.isEmpty)
          Container(
            padding: const EdgeInsets.symmetric(vertical: AppTheme.space24),
            decoration: BoxDecoration(
              color: AppTheme.lightAsh,
              borderRadius: BorderRadius.circular(AppTheme.radiusCard),
            ),
            child: Text(
              'No scheduled meetings. Enjoy the white space!',
              style: AppTheme.bodyRegular.copyWith(color: AppTheme.pewter),
              textAlign: TextAlign.center,
            ),
          )
        else
          ...todayEvents.map((event) {
            final startHour = DateFormat('h:mm a').format(event.startAt);
            final endHour = DateFormat('h:mm a').format(event.endAt);

            return Container(
              margin: const EdgeInsets.only(bottom: AppTheme.space12),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.cloudGray),
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              padding: const EdgeInsets.all(AppTheme.space16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '$startHour - $endHour',
                        style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold),
                      ),
                      Icon(
                        event.source == EventSource.google ? Icons.sync : Icons.calendar_today_outlined,
                        color: event.source == EventSource.google ? AppTheme.electricBlue : AppTheme.pewter,
                        size: 14,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.space4),
                  Text(
                    event.title,
                    style: AppTheme.bodyMedium.copyWith(fontSize: 15.0),
                  ),
                  if (event.description.isNotEmpty) ...[
                    const SizedBox(height: AppTheme.space4),
                    Text(
                      event.description,
                      style: AppTheme.captionText,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  if (event.attendees.isNotEmpty) ...[
                    const SizedBox(height: AppTheme.space8),
                    Row(
                      children: event.attendees.take(3).map((a) {
                        return Container(
                          margin: const EdgeInsets.only(right: AppTheme.space4),
                          child: CircleAvatar(
                            radius: 10,
                            backgroundColor: AppTheme.lightAsh,
                            child: Text(
                              a[0].toUpperCase(),
                              style: const TextStyle(fontSize: 8, color: AppTheme.graphite),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ],
              ),
            );
          }).toList(),
      ],
    );
  }
}
