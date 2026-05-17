import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../providers/calendar_provider.dart';

class IntegrationsScreen extends StatefulWidget {
  const IntegrationsScreen({Key? key}) : super(key: key);

  @override
  State<IntegrationsScreen> createState() => _IntegrationsScreenState();
}

class _IntegrationsScreenState extends State<IntegrationsScreen> {
  bool _isGoogleCalendarConnected = true;
  bool _isAutoSyncActive = false;

  @override
  Widget build(BuildContext context) {
    final calendarProvider = Provider.of<CalendarProvider>(context);

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
          'INTEGRATIONS',
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
              'CONNECTED SYSTEMS',
              style: AppTheme.captionText.copyWith(color: AppTheme.electricBlue, fontWeight: FontWeight.bold, letterSpacing: 1.0),
            ),
            const SizedBox(height: AppTheme.space4),
            Text(
              'Link external calendar sources and telemetry aggregates to drive RAG queries.',
              style: AppTheme.bodyRegular.copyWith(color: AppTheme.pewter),
            ),
            const SizedBox(height: AppTheme.space24),

            // Google Workspace Link
            Container(
              padding: const EdgeInsets.all(AppTheme.space16),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.cloudGray),
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: const BoxDecoration(
                          color: AppTheme.lightAsh,
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: const Icon(Icons.calendar_today_rounded, color: Colors.blueAccent, size: 20),
                      ),
                      const SizedBox(width: AppTheme.space16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Google Workspace Calendar', style: AppTheme.bodyMedium.copyWith(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 2),
                            Text(
                              _isGoogleCalendarConnected ? 'arin.dixit@gmail.com' : 'Disconnected',
                              style: const TextStyle(color: AppTheme.pewter, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      Switch(
                        value: _isGoogleCalendarConnected,
                        onChanged: (val) {
                          setState(() {
                            _isGoogleCalendarConnected = val;
                          });
                        },
                        activeColor: AppTheme.electricBlue,
                      ),
                    ],
                  ),
                  if (_isGoogleCalendarConnected) ...[
                    const SizedBox(height: AppTheme.space16),
                    const Divider(color: AppTheme.cloudGray, height: 1.0),
                    const SizedBox(height: AppTheme.space12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Automated RAG Syncing', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
                        Switch(
                          value: _isAutoSyncActive,
                          onChanged: (val) {
                            setState(() {
                              _isAutoSyncActive = val;
                            });
                          },
                          activeColor: AppTheme.electricBlue,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppTheme.space8),
                    ElevatedButton.icon(
                      onPressed: () {
                        // Simulate loading
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Re-hydrating synced Google Workspace entries... 🔄'),
                            backgroundColor: AppTheme.electricBlue,
                          ),
                        );
                      },
                      icon: const Icon(Icons.sync_rounded, size: 16),
                      label: const Text('FORCE RESYNC TELEMETRY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.lightAsh,
                        foregroundColor: AppTheme.carbonDark,
                        elevation: 0.0,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusButton)),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
