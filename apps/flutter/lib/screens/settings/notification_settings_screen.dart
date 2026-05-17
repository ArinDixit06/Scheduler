import 'package:flutter/material.dart';
import '../../constants/theme.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({Key? key}) : super(key: key);

  @override
  State<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends State<NotificationSettingsScreen> {
  bool _staminaReminders = true;
  bool _mindfulnessTriggers = true;
  bool _recapAlerts = false;

  @override
  Widget build(BuildContext context) {
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
          'TELEMETRY ALERTS',
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
              'ALERT TRIGGERS',
              style: AppTheme.captionText.copyWith(color: AppTheme.electricBlue, fontWeight: FontWeight.bold, letterSpacing: 1.0),
            ),
            const SizedBox(height: AppTheme.space4),
            Text(
              'Coordinate smart notifications triggered by your bio-rhythm and sprint milestones.',
              style: AppTheme.bodyRegular.copyWith(color: AppTheme.pewter),
            ),
            const SizedBox(height: AppTheme.space24),

            // Telemetry alerts list
            _buildToggleItem(
              'Daily Peak Stamina Brief',
              'Receive a morning nudge when your daily energy check-in reaches peak scores to schedule complex refactors.',
              _staminaReminders,
              (val) => setState(() => _staminaReminders = val),
            ),
            const SizedBox(height: AppTheme.space12),
            _buildToggleItem(
              'Mindfulness Rest Triggers',
              'Receive breathing nudges when your focus intervals exceed 90 uninterrupted minutes.',
              _mindfulnessTriggers,
              (val) => setState(() => _mindfulnessTriggers = val),
            ),
            const SizedBox(height: AppTheme.space12),
            _buildToggleItem(
              'Weekly Recap Summaries',
              'Deliver the historical achievements ledger straight to your inbox at the end of each sprint cycle.',
              _recapAlerts,
              (val) => setState(() => _recapAlerts = val),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToggleItem(String title, String desc, bool value, ValueChanged<bool> onChanged) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space16),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.cloudGray),
        borderRadius: BorderRadius.circular(AppTheme.radiusCard),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTheme.bodyMedium.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(desc, style: AppTheme.captionText.copyWith(height: 1.4)),
              ],
            ),
          ),
          const SizedBox(width: AppTheme.space16),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: AppTheme.electricBlue,
          ),
        ],
      ),
    );
  }
}
