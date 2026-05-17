import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../providers/focus_provider.dart';
import '../../providers/task_provider.dart';

class SessionActiveScreen extends StatefulWidget {
  const SessionActiveScreen({Key? key}) : super(key: key);

  @override
  State<SessionActiveScreen> createState() => _SessionActiveScreenState();
}

class _SessionActiveScreenState extends State<SessionActiveScreen> with SingleTickerProviderStateMixin {
  late AnimationController _haloController;

  @override
  void initState() {
    super.initState();
    // Gentle breathing pulsing animation for the glow halo
    _haloController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _haloController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final focusProvider = Provider.of<FocusProvider>(context);
    final taskProvider = Provider.of<TaskProvider>(context);

    // If timer somehow completes and stops, let's gracefully navigate back!
    if (!focusProvider.isRunning) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (Navigator.canPop(context)) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Focus block completed successfully! 🎉'),
              backgroundColor: AppTheme.electricBlue,
            ),
          );
        }
      });
    }

    // Retrieve active task description if linked
    String linkedTaskTitle = 'AMBIENT FLOW TIME';
    if (focusProvider.activeTaskId != null) {
      final taskIdx = taskProvider.tasks.indexWhere((t) => t.id == focusProvider.activeTaskId);
      if (taskIdx != -1) {
        linkedTaskTitle = taskProvider.tasks[taskIdx].title.toUpperCase();
      }
    }

    return Scaffold(
      backgroundColor: AppTheme.carbonDark, // Dark immersive mode for Focus!
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0.0,
        leading: const SizedBox.shrink(),
        title: Text(
          focusProvider.activeMode.name.toUpperCase(),
          style: const TextStyle(
            color: AppTheme.pureWhite,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            fontSize: 12.0,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.close_rounded, color: AppTheme.pureWhite),
            onPressed: () {
              // Confirm cancellation
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  backgroundColor: AppTheme.carbonDark,
                  title: const Text('CANCEL FOCUS BLOCK?', style: TextStyle(color: AppTheme.pureWhite)),
                  content: const Text(
                    'Are you sure you want to stop this block? Your elapsed focus time will not be recorded.',
                    style: TextStyle(color: AppTheme.pewter),
                  ),
                  actions: [
                    TextButton(
                      child: const Text('CONTINUE WORK', style: TextStyle(color: AppTheme.pewter)),
                      onPressed: () => Navigator.pop(context),
                    ),
                    TextButton(
                      child: const Text('CANCEL SESSION', style: TextStyle(color: Colors.redAccent)),
                      onPressed: () {
                        focusProvider.stopSession();
                        Navigator.pop(context); // Pop dialog
                        Navigator.pop(context); // Pop active focus screen
                      },
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(width: AppTheme.space12),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              // Linked Task Header Banner
              Container(
                padding: const EdgeInsets.symmetric(horizontal: AppTheme.space20, vertical: AppTheme.space12),
                decoration: BoxDecoration(
                  color: AppTheme.pureWhite.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                  border: Border.all(color: AppTheme.pureWhite.withOpacity(0.1)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.bookmark_added_outlined, color: AppTheme.electricBlue, size: 16),
                    const SizedBox(width: 10),
                    Flexible(
                      child: Text(
                        linkedTaskTitle,
                        style: const TextStyle(
                          color: AppTheme.pureWhite,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

              // Immersive Breathing Pulsing Focus Halo Ring
              AnimatedBuilder(
                animation: _haloController,
                builder: (context, child) {
                  final glowScale = 1.0 + (_haloController.value * 0.12);
                  final glowOpacity = 0.05 + ((1.0 - _haloController.value) * 0.1);

                  return Center(
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Glow Outer Halo
                        if (focusProvider.isRunning && !focusProvider.isPaused)
                          Container(
                            width: 240 * glowScale,
                            height: 240 * glowScale,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppTheme.electricBlue.withOpacity(glowOpacity),
                            ),
                          ),

                        // Outline Circular Border
                        Container(
                          width: 220,
                          height: 220,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: focusProvider.isPaused
                                  ? AppTheme.pewter.withOpacity(0.2)
                                  : AppTheme.electricBlue,
                              width: 1.5,
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                focusProvider.timerString,
                                style: const TextStyle(
                                  fontSize: 48,
                                  fontWeight: FontWeight.w200,
                                  color: AppTheme.pureWhite,
                                  letterSpacing: 1.5,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                focusProvider.isPaused ? 'SESSION PAUSED' : 'DEEP WORK FOCUS',
                                style: TextStyle(
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.bold,
                                  color: focusProvider.isPaused ? AppTheme.pewter : AppTheme.electricBlue,
                                  letterSpacing: 1.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),

              // Tactile Action buttons row
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (focusProvider.isPaused)
                    ElevatedButton.icon(
                      onPressed: () {
                        focusProvider.resumeSession();
                      },
                      icon: const Icon(Icons.play_arrow_rounded, size: 20),
                      label: const Text('RESUME WORK'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.electricBlue,
                        foregroundColor: AppTheme.pureWhite,
                        shadowColor: Colors.transparent,
                        elevation: 0.0,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusButton)),
                      ),
                    )
                  else
                    OutlinedButton.icon(
                      onPressed: () {
                        focusProvider.pauseSession();
                      },
                      icon: const Icon(Icons.pause_rounded, size: 20, color: AppTheme.pureWhite),
                      label: const Text('PAUSE INTERVAL', style: TextStyle(color: AppTheme.pureWhite)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.paleSilver),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusButton)),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
