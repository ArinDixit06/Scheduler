import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../constants/theme.dart';
import '../../models/event.dart';
import '../../providers/calendar_provider.dart';
import '../../widgets/screen_shell.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({Key? key}) : super(key: key);

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _selectedDate = DateTime.now();

  @override
  Widget build(BuildContext context) {
    final calendarProvider = Provider.of<CalendarProvider>(context);
    final dayEvents = calendarProvider.events.where((e) {
      return e.startAt.year == _selectedDate.year &&
          e.startAt.month == _selectedDate.month &&
          e.startAt.day == _selectedDate.day;
    }).toList();

    return ScreenShell(
      title: 'CHRONO SCHEDULE',
      child: Column(
        children: [
          // 1. Simple Week Slider
          _buildWeekSlider(),
          const SizedBox(height: AppTheme.space16),

          // 2. Hourly Grid List
          Expanded(
            child: ListView.builder(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24),
              itemCount: 10, // 9:00 AM to 6:00 PM
              itemBuilder: (context, index) {
                final hour = index + 9;
                final timeLabel = DateFormat('h:00 a').format(DateTime(2026, 1, 1, hour));

                // Find events starting in this hour block
                final blockEvents = dayEvents.where((e) => e.startAt.hour == hour).toList();

                return _buildHourlySlot(timeLabel, blockEvents);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeekSlider() {
    final today = DateTime.now();
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(7, (index) {
          final date = today.add(Duration(days: index - today.weekday + 1));
          final isSelected = date.year == _selectedDate.year &&
              date.month == _selectedDate.month &&
              date.day == _selectedDate.day;

          return GestureDetector(
            onTap: () {
              setState(() => _selectedDate = date);
            },
            child: Container(
              padding: const EdgeInsets.all(AppTheme.space8),
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.electricBlue : Colors.transparent,
                borderRadius: BorderRadius.circular(AppTheme.radiusButton),
              ),
              child: Column(
                children: [
                  Text(
                    DateFormat('E').format(date).toUpperCase().substring(0, 2),
                    style: AppTheme.captionText.copyWith(
                      color: isSelected ? AppTheme.pureWhite : AppTheme.pewter,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                  const SizedBox(height: AppTheme.space4),
                  Text(
                    DateFormat('d').format(date),
                    style: AppTheme.productName.copyWith(
                      color: isSelected ? AppTheme.pureWhite : AppTheme.carbonDark,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildHourlySlot(String timeLabel, List<CalendarEvent> events) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Hourly Timestamp column
          SizedBox(
            width: 70,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: AppTheme.space16),
              child: Text(
                timeLabel,
                style: AppTheme.captionText.copyWith(
                  fontFamily: 'monospace',
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),

          // Timeline vertical divider
          Container(
            width: 1.0,
            color: AppTheme.cloudGray,
            margin: const EdgeInsets.symmetric(horizontal: AppTheme.space8),
          ),

          // Event Card Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: AppTheme.space8),
              child: events.isEmpty
                  ? Container(
                      height: 48,
                      alignment: Alignment.centerLeft,
                      padding: const EdgeInsets.only(left: AppTheme.space8),
                      child: Text(
                        'WHITE SPACE',
                        style: AppTheme.captionText.copyWith(
                          color: AppTheme.silverFog.withOpacity(0.5),
                          letterSpacing: 1.0,
                        ),
                      ),
                    )
                  : Column(
                      children: events.map((e) => _buildEventCard(e)).toList(),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEventCard(CalendarEvent event) {
    final startStr = DateFormat('h:mm a').format(event.startAt);
    final endStr = DateFormat('h:mm a').format(event.endAt);

    return GestureDetector(
      onTap: () => _showEventDetailsBottomSheet(event),
      child: Container(
        margin: const EdgeInsets.only(bottom: AppTheme.space4),
        decoration: BoxDecoration(
          color: event.source == EventSource.google
              ? AppTheme.electricBlue.withOpacity(0.05)
              : AppTheme.lightAsh,
          border: Border.all(
            color: event.source == EventSource.google ? AppTheme.electricBlue : AppTheme.cloudGray,
            width: 1.0,
          ),
          borderRadius: BorderRadius.circular(AppTheme.radiusButton),
        ),
        padding: const EdgeInsets.all(AppTheme.space12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  event.title,
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppTheme.carbonDark,
                  ),
                ),
                if (event.source == EventSource.google)
                  const Icon(Icons.sync, color: AppTheme.electricBlue, size: 14),
              ],
            ),
            const SizedBox(height: AppTheme.space2),
            Text(
              '$startStr - $endStr',
              style: AppTheme.captionText,
            ),
          ],
        ),
      ),
    );
  }

  void _showEventDetailsBottomSheet(CalendarEvent event) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.pureWhite,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(AppTheme.radiusCard),
          topRight: Radius.circular(AppTheme.radiusCard),
        ),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppTheme.space24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      event.source == EventSource.google ? 'GOOGLE SYNCED MEETING' : 'INTERNAL APPOINTMENT',
                      style: AppTheme.captionText.copyWith(
                        color: event.source == EventSource.google ? AppTheme.electricBlue : AppTheme.pewter,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppTheme.pewter),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: AppTheme.space8),
                Text(
                  event.title,
                  style: AppTheme.displayTitle.copyWith(fontSize: 24.0),
                ),
                const SizedBox(height: AppTheme.space16),

                // Description
                if (event.description.isNotEmpty) ...[
                  Text(
                    event.description,
                    style: AppTheme.bodyRegular,
                  ),
                  const SizedBox(height: AppTheme.space16),
                ],

                // Meeting URL
                if (event.meetingUrl != null) ...[
                  Row(
                    children: [
                      const Icon(Icons.video_call, color: AppTheme.electricBlue),
                      const SizedBox(width: AppTheme.space8),
                      Expanded(
                        child: Text(
                          event.meetingUrl!,
                          style: AppTheme.bodyMedium.copyWith(color: AppTheme.electricBlue),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.space16),
                ],

                // Attendees
                if (event.attendees.isNotEmpty) ...[
                  Text(
                    'ATTENDEES',
                    style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: AppTheme.space8),
                  Wrap(
                    spacing: AppTheme.space8,
                    children: event.attendees.map((attendee) {
                      return Chip(
                        label: Text(attendee, style: AppTheme.captionText),
                        backgroundColor: AppTheme.lightAsh,
                        side: BorderSide.none,
                      );
                    }).toList(),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}
