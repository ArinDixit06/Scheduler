import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../constants/theme.dart';
import '../../models/event.dart';

class EventDetailScreen extends StatelessWidget {
  final CalendarEvent event;
  const EventDetailScreen({Key? key, required this.event}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final startHour = DateFormat('h:mm a').format(event.startAt);
    final endHour = DateFormat('h:mm a').format(event.endAt);
    final dateStr = DateFormat('EEEE, MMMM d, yyyy').format(event.startAt).toUpperCase();

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
          'EVENT DETAIL',
          style: AppTheme.productName.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Date and time slot header
            Text(
              dateStr,
              style: AppTheme.captionText.copyWith(color: AppTheme.electricBlue, fontWeight: FontWeight.bold, letterSpacing: 1.0),
            ),
            const SizedBox(height: AppTheme.space8),
            Text(
              event.title,
              style: AppTheme.displayTitle.copyWith(fontSize: 22.0, color: AppTheme.carbonDark, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: AppTheme.space12),
            Row(
              children: [
                const Icon(Icons.access_time_filled, color: AppTheme.pewter, size: 18),
                const SizedBox(width: AppTheme.space8),
                Text(
                  '$startHour - $endHour',
                  style: AppTheme.bodyMedium.copyWith(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: AppTheme.space24),
            const Divider(color: AppTheme.cloudGray, height: 1.0),
            const SizedBox(height: AppTheme.space24),

            // Description Briefing notes
            Text('MEETING AGENDA & NOTES', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.space8),
            Container(
              padding: const EdgeInsets.all(AppTheme.space16),
              decoration: BoxDecoration(
                color: AppTheme.lightAsh,
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              child: Text(
                event.description.isNotEmpty ? event.description : 'No attached briefing notes provided.',
                style: AppTheme.bodyRegular.copyWith(
                  color: event.description.isNotEmpty ? AppTheme.carbonDark : AppTheme.pewter,
                  height: 1.4,
                ),
              ),
            ),
            const SizedBox(height: AppTheme.space24),

            // Video Meet Link
            Text('VIDEO INTEGRATION', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.space8),
            Container(
              padding: const EdgeInsets.all(AppTheme.space16),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.cloudGray),
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              child: Row(
                children: [
                  const Icon(Icons.video_camera_back_rounded, color: AppTheme.electricBlue, size: 24),
                  const SizedBox(width: AppTheme.space16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Google Meet Sync', style: AppTheme.bodyMedium.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        const Text(
                          'meet.google.com/apx-spt-chr',
                          style: TextStyle(color: AppTheme.pewter, fontSize: 12),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Icon(Icons.open_in_new_rounded, color: AppTheme.pewter, size: 18),
                ],
              ),
            ),
            const SizedBox(height: AppTheme.space24),

            // Attendees guest list
            if (event.attendees.isNotEmpty) ...[
              Text('ATTENDEES CHIPS (${event.attendees.length})', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: AppTheme.space12),
              Column(
                children: event.attendees.map((attendee) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 6.0),
                    decoration: BoxDecoration(
                      color: AppTheme.lightAsh,
                      borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                    ),
                    child: ListTile(
                      leading: CircleAvatar(
                        radius: 14,
                        backgroundColor: AppTheme.electricBlue,
                        child: Text(
                          attendee[0].toUpperCase(),
                          style: const TextStyle(color: AppTheme.pureWhite, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                      title: Text(attendee, style: AppTheme.bodyMedium),
                      trailing: const Icon(Icons.check_circle_outline, color: Colors.greenAccent, size: 16),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12.0),
                      dense: true,
                    ),
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
