import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/theme.dart';
import '../providers/focus_provider.dart';
import 'live_activity_banner.dart';

class ScreenShell extends StatelessWidget {
  final String title;
  final Widget child;
  final Widget? trailingHeader;
  final bool showBottomNavSpacer;

  const ScreenShell({
    Key? key,
    required this.title,
    required this.child,
    this.trailingHeader,
    this.showBottomNavSpacer = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final focusProvider = Provider.of<FocusProvider>(context);
    final topPadding = MediaQuery.of(context).padding.top;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: AppTheme.pureWhite,
      body: Stack(
        children: [
          // Content Layout
          SafeArea(
            bottom: false,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Global Header
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppTheme.space24,
                    vertical: AppTheme.space16,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        title.toUpperCase(),
                        style: AppTheme.navItem.copyWith(
                          letterSpacing: 2.0,
                          fontSize: 16.0,
                          color: AppTheme.carbonDark,
                        ),
                      ),
                      if (trailingHeader != null) trailingHeader!,
                    ],
                  ),
                ),
                // Screen Content
                Expanded(child: child),
                if (showBottomNavSpacer)
                  SizedBox(height: bottomPadding + AppTheme.space48 + AppTheme.space8),
              ],
            ),
          ),

          // Global Dynamic Island Focus Notification Overlay
          if (focusProvider.isRunning)
            Positioned(
              top: topPadding + AppTheme.space8,
              left: AppTheme.space16,
              right: AppTheme.space16,
              child: const LiveActivityBanner(),
            ),
        ],
      ),
    );
  }
}
