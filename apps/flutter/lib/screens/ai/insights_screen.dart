import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../providers/focus_provider.dart';
import '../../providers/auth_provider.dart';

class InsightsScreen extends StatelessWidget {
  const InsightsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final focusProvider = Provider.of<FocusProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final energy = authProvider.todayEnergyScore;

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
          'COGNITIVE INSIGHTS',
          style: AppTheme.productName.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Subtitle header
            Text(
              'BIOMETRIC ANALYSIS',
              style: AppTheme.captionText.copyWith(color: AppTheme.electricBlue, fontWeight: FontWeight.bold, letterSpacing: 1.0),
            ),
            const SizedBox(height: AppTheme.space4),
            Text(
              'Dynamic correlation between your logged stamina, peak energy checks, and sprint milestones.',
              style: AppTheme.bodyRegular.copyWith(color: AppTheme.pewter),
            ),
            const SizedBox(height: AppTheme.space24),

            // Peak Energy Check Card
            Container(
              padding: const EdgeInsets.all(AppTheme.space16),
              decoration: BoxDecoration(
                color: AppTheme.lightAsh,
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.bolt, color: Colors.orangeAccent, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'TODAY\'S PEAK SCORE',
                        style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.space12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Stamina Profile: $energy/5',
                        style: AppTheme.displayTitle.copyWith(fontWeight: FontWeight.bold, color: AppTheme.carbonDark),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.electricBlue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(AppTheme.radiusIndicator),
                        ),
                        child: const Text(
                          'OPTIMAL WORKLOAD',
                          style: TextStyle(color: AppTheme.electricBlue, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppTheme.space20),

            // Focus Minutes Card
            Container(
              padding: const EdgeInsets.all(AppTheme.space16),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.cloudGray),
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.timer_outlined, color: AppTheme.electricBlue, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'TOTAL FOCUS RECORD',
                        style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.space12),
                  Text(
                    '${focusProvider.totalMinutesCompleted} Minutes Scheduled',
                    style: AppTheme.displayTitle.copyWith(fontWeight: FontWeight.bold, color: AppTheme.carbonDark),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Across ${focusProvider.sessionsCompletedCount} successfully completed intervals.',
                    style: AppTheme.captionText,
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppTheme.space24),

            // Chronos Recommendations
            Text('CHRONOS RECOMMENDATIONS', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.space12),
            _buildRecommendationCard(
              'Schedule Complex Refactors from 9:00 AM - 12:00 PM',
              'Your historical focus blocks show the shortest distraction time and maximum subtask check-offs during early morning windows.',
            ),
            const SizedBox(height: AppTheme.space12),
            _buildRecommendationCard(
              'Enforce a 10-Minute Recharge interval soon',
              'You have exceeded 90 continuous deep work minutes without logging a mindfulness resting event. Add a breathing slot to prevent burnout.',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecommendationCard(String title, String desc) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space16),
      decoration: BoxDecoration(
        color: AppTheme.pureWhite,
        border: Border.all(color: AppTheme.cloudGray, width: 1.0),
        borderRadius: BorderRadius.circular(AppTheme.radiusCard),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.psychology_alt_outlined, color: AppTheme.electricBlue, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTheme.bodyMedium.copyWith(fontWeight: FontWeight.bold, fontSize: 13.0),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      desc,
                      style: AppTheme.captionText.copyWith(height: 1.4),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
