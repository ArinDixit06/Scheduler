import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/calendar_provider.dart';
import '../../widgets/screen_shell.dart';

class SettingsScreen extends StatefulWidget {
  final VoidCallback onLogout;

  const SettingsScreen({Key? key, required this.onLogout}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  double _notchOffset = 0.0;

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final calendar = Provider.of<CalendarProvider>(context);

    return ScreenShell(
      title: 'WORKSPACE CONFIGS',
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. User Profile Detail Panel
            _buildProfileCard(auth),
            const SizedBox(height: AppTheme.space24),

            // 2. Google Integration Segment
            _buildIntegrationsSegment(calendar),
            const SizedBox(height: AppTheme.space24),

            // 3. Notch Adjuster Slider Mock
            _buildNotchOffsetAdjuster(),
            const SizedBox(height: AppTheme.space24),

            // 4. Reset & System Controls
            _buildSystemActions(auth),
            const SizedBox(height: AppTheme.space40),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard(AuthProvider auth) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.lightAsh,
        borderRadius: BorderRadius.circular(AppTheme.radiusCard),
      ),
      padding: const EdgeInsets.all(AppTheme.space20),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: AppTheme.carbonDark,
            child: Text(
              auth.userName.isNotEmpty ? auth.userName[0].toUpperCase() : 'U',
              style: const TextStyle(fontSize: 20, color: AppTheme.pureWhite, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: AppTheme.space16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  auth.userName,
                  style: AppTheme.productName,
                ),
                Text(
                  'Apex Premium Subscribed',
                  style: AppTheme.captionText,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIntegrationsSegment(CalendarProvider calendar) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'CLOUD SERVICES & SYNCS',
          style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
        const SizedBox(height: AppTheme.space12),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: AppTheme.cloudGray),
            borderRadius: BorderRadius.circular(AppTheme.radiusCard),
          ),
          padding: const EdgeInsets.all(AppTheme.space16),
          child: Row(
            children: [
              const Icon(Icons.sync_alt_outlined, color: AppTheme.electricBlue, size: 24),
              const SizedBox(width: AppTheme.space16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Google Calendar Workspace',
                      style: AppTheme.bodyMedium,
                    ),
                    Text(
                      calendar.isGoogleSynced ? 'Active sync channel connected' : 'Sync professional meeting agendas',
                      style: AppTheme.captionText,
                    ),
                  ],
                ),
              ),

              // Connect controls
              if (calendar.isSyncing)
                const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(AppTheme.electricBlue),
                  ),
                )
              else
                Switch(
                  value: calendar.isGoogleSynced,
                  onChanged: (_) async {
                    await calendar.toggleGoogleSync();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          calendar.isGoogleSynced
                              ? 'Google Calendar Synchronized successfully!'
                              : 'Google Calendar Sync Disabled.',
                        ),
                        backgroundColor: AppTheme.electricBlue,
                      ),
                    );
                  },
                  activeColor: AppTheme.electricBlue,
                  activeTrackColor: AppTheme.electricBlue.withOpacity(0.1),
                  inactiveThumbColor: AppTheme.pewter,
                  inactiveTrackColor: AppTheme.cloudGray,
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNotchOffsetAdjuster() {
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
            'NOTCH & STATUS BAR ADJUSTER',
            style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
          ),
          const SizedBox(height: AppTheme.space8),
          Text(
            'Add custom padding offset to fine-tune spacing on special notches.',
            style: AppTheme.captionText,
          ),
          Row(
            children: [
              const Icon(Icons.vertical_align_top_outlined, color: AppTheme.pewter, size: 20),
              Expanded(
                child: Slider(
                  value: _notchOffset,
                  min: 0.0,
                  max: 24.0,
                  divisions: 6,
                  label: '${_notchOffset.round()} px',
                  onChanged: (val) {
                    setState(() => _notchOffset = val);
                  },
                  activeColor: AppTheme.electricBlue,
                  inactiveColor: AppTheme.paleSilver.withOpacity(0.5),
                ),
              ),
              Text(
                '${_notchOffset.round()} px',
                style: AppTheme.bodyMedium,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSystemActions(AuthProvider auth) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ElevatedButton(
          onPressed: () async {
            await auth.logout();
            widget.onLogout();
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.pureWhite,
            foregroundColor: AppTheme.priorityHigh,
            shadowColor: Colors.transparent,
            side: const BorderSide(color: AppTheme.priorityHigh, width: 1.5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppTheme.radiusButton),
            ),
            padding: const EdgeInsets.symmetric(vertical: AppTheme.space16),
          ),
          child: Text(
            'DISCONNECT CURRENT SESSION',
            style: AppTheme.buttonLabel.copyWith(color: AppTheme.priorityHigh),
          ),
        ),
      ],
    );
  }
}
