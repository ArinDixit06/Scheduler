import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/theme.dart';
import '../providers/focus_provider.dart';

class LiveActivityBanner extends StatefulWidget {
  const LiveActivityBanner({Key? key}) : super(key: key);

  @override
  State<LiveActivityBanner> createState() => _LiveActivityBannerState();
}

class _LiveActivityBannerState extends State<LiveActivityBanner> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      duration: const Duration(milliseconds: 350),
      vsync: this,
    );
    _slideAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutBack,
    );
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final focusProvider = Provider.of<FocusProvider>(context);

    return ScaleTransition(
      scale: _slideAnimation,
      child: FadeTransition(
        opacity: _slideAnimation,
        child: Container(
          decoration: BoxDecoration(
            color: AppTheme.carbonDark,
            borderRadius: BorderRadius.circular(AppTheme.radiusCard),
            border: Border.all(
              color: AppTheme.paleSilver.withOpacity(0.15),
              width: 1.0,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppTheme.space16,
                  vertical: AppTheme.space12,
                ),
                child: Row(
                  children: [
                    // Active Status Indicator Icon
                    _buildPulsingDot(),
                    const SizedBox(width: AppTheme.space12),

                    // Info text
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            focusProvider.activeMode.name.toUpperCase(),
                            style: AppTheme.captionText.copyWith(
                              color: AppTheme.pureWhite.withOpacity(0.6),
                              letterSpacing: 1.0,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'Focus Sprint Ticking',
                            style: AppTheme.bodyRegular.copyWith(
                              color: AppTheme.pureWhite,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Timer text
                    Text(
                      focusProvider.timerString,
                      style: AppTheme.productName.copyWith(
                        color: AppTheme.pureWhite,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(width: AppTheme.space16),

                    // Play/Pause Action
                    IconButton(
                      icon: Icon(
                        focusProvider.isPaused ? Icons.play_arrow : Icons.pause,
                        color: AppTheme.electricBlue,
                        size: 20,
                      ),
                      onPressed: () {
                        if (focusProvider.isPaused) {
                          focusProvider.resumeSession();
                        } else {
                          focusProvider.pauseSession();
                        }
                      },
                      constraints: const BoxConstraints(),
                      padding: EdgeInsets.zero,
                    ),
                    const SizedBox(width: AppTheme.space12),

                    // Terminate Action
                    IconButton(
                      icon: const Icon(
                        Icons.stop,
                        color: AppTheme.priorityHigh,
                        size: 20,
                      ),
                      onPressed: () {
                        focusProvider.stopSession();
                      },
                      constraints: const BoxConstraints(),
                      padding: EdgeInsets.zero,
                    ),
                  ],
                ),
              ),

              // Bottom Progress Bar
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(AppTheme.radiusCard),
                  bottomRight: Radius.circular(AppTheme.radiusCard),
                ),
                child: LinearProgressIndicator(
                  value: focusProvider.progressPercent,
                  backgroundColor: AppTheme.carbonDark,
                  color: AppTheme.electricBlue,
                  minHeight: 3.0,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPulsingDot() {
    return Container(
      width: 10,
      height: 10,
      decoration: const BoxDecoration(
        color: AppTheme.electricBlue,
        shape: BoxShape.circle,
      ),
    );
  }
}
