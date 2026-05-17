import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../models/focus.dart';
import '../../models/task.dart';
import '../../providers/focus_provider.dart';
import '../../providers/task_provider.dart';
import '../../widgets/screen_shell.dart';

class FocusScreen extends StatefulWidget {
  const FocusScreen({Key? key}) : super(key: key);

  @override
  State<FocusScreen> createState() => _FocusScreenState();
}

class _FocusScreenState extends State<FocusScreen> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );
    _pulseAnimation = Tween<double>(begin: 0.96, end: 1.04).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _showTaskSelectorBottomSheet(FocusProvider focusProvider, TaskProvider taskProvider) {
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
        final activeTasks = taskProvider.todoTasks;

        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppTheme.space24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'LINK TASK TO FOCUS SESSION',
                  style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
                ),
                const SizedBox(height: AppTheme.space16),
                if (activeTasks.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: AppTheme.space24),
                    child: Text(
                      'No active tasks found in todo.',
                      style: AppTheme.bodyRegular.copyWith(color: AppTheme.pewter),
                      textAlign: TextAlign.center,
                    ),
                  )
                else
                  Expanded(
                    child: ListView.builder(
                      itemCount: activeTasks.length,
                      itemBuilder: (context, index) {
                        final task = activeTasks[index];
                        return ListTile(
                          title: Text(task.title, style: AppTheme.bodyMedium),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                          onTap: () {
                            focusProvider.startSession(taskId: task.id);
                            Navigator.pop(context);
                          },
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final focus = Provider.of<FocusProvider>(context);
    final taskProvider = Provider.of<TaskProvider>(context);

    // Start/Stop pulsing animation based on timer state
    if (focus.isRunning && !focus.isPaused) {
      _pulseController.repeat(reverse: true);
    } else {
      _pulseController.stop();
    }

    // Resolve linked task name
    String linkedTaskName = 'STANDALONE FOCUS';
    if (focus.activeTaskId != null) {
      final linked = taskProvider.tasks.firstWhere(
        (t) => t.id == focus.activeTaskId,
        orElse: () => Task(id: '', title: 'Focus Sprint', tags: [], subtasks: [], createdAt: DateTime.now()),
      );
      linkedTaskName = linked.title;
    }

    return ScreenShell(
      title: 'AMBIENT FOCUS',
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24),
        child: Column(
          children: [
            // 1. Segmented Modes Picker
            _buildModePicker(focus),
            const Spacer(),

            // 2. Central Pulsing Halo Ring
            AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                return Transform.scale(
                  scale: focus.isRunning && !focus.isPaused ? _pulseAnimation.value : 1.0,
                  child: child,
                );
              },
              child: Container(
                width: 240,
                height: 240,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.pureWhite,
                  border: Border.all(
                    color: focus.isRunning
                        ? AppTheme.electricBlue
                        : AppTheme.paleSilver.withOpacity(0.3),
                    width: 2.0,
                  ),
                ),
                alignment: Alignment.center,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      focus.timerString,
                      style: AppTheme.displayTitle.copyWith(
                        fontSize: 48.0,
                        fontWeight: FontWeight.w600,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(height: AppTheme.space8),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24),
                      child: Text(
                        linkedTaskName.toUpperCase(),
                        style: AppTheme.captionText.copyWith(
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const Spacer(),

            // 3. Control Actions
            _buildControls(focus, taskProvider),
            const SizedBox(height: AppTheme.space40),
          ],
        ),
      ),
    );
  }

  Widget _buildModePicker(FocusProvider focus) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.lightAsh,
        borderRadius: BorderRadius.circular(AppTheme.radiusButton),
      ),
      padding: const EdgeInsets.all(AppTheme.space4),
      child: Row(
        children: [
          _buildModeButton(focus, FocusMode.pomodoro, 'POMODORO'),
          _buildModeButton(focus, FocusMode.deepWork, 'DEEP WORK'),
          _buildModeButton(focus, FocusMode.flow, 'FLOW'),
        ],
      ),
    );
  }

  Widget _buildModeButton(FocusProvider focus, FocusMode mode, String label) {
    final isSelected = focus.activeMode == mode;
    return Expanded(
      child: GestureDetector(
        onTap: () => focus.selectMode(mode),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: AppTheme.space12),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.pureWhite : Colors.transparent,
            borderRadius: BorderRadius.circular(AppTheme.radiusButton),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: AppTheme.navItem.copyWith(
              color: isSelected ? AppTheme.carbonDark : AppTheme.pewter,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildControls(FocusProvider focus, TaskProvider taskProvider) {
    if (!focus.isRunning) {
      return Row(
        children: [
          // Standalone focus start
          Expanded(
            child: ElevatedButton(
              onPressed: () => focus.startSession(),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.carbonDark,
                foregroundColor: AppTheme.pureWhite,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                ),
                padding: const EdgeInsets.symmetric(vertical: AppTheme.space16),
              ),
              child: Text('START FOCUS', style: AppTheme.buttonLabel),
            ),
          ),
          const SizedBox(width: AppTheme.space12),

          // Linked task start
          GestureDetector(
            onTap: () => _showTaskSelectorBottomSheet(focus, taskProvider),
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.carbonDark),
                borderRadius: BorderRadius.circular(AppTheme.radiusButton),
              ),
              padding: const EdgeInsets.all(14),
              child: const Icon(Icons.link, color: AppTheme.carbonDark),
            ),
          ),
        ],
      );
    }

    return Row(
      children: [
        // Play/Pause Action
        Expanded(
          child: ElevatedButton(
            onPressed: () {
              if (focus.isPaused) {
                focus.resumeSession();
              } else {
                focus.pauseSession();
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.electricBlue,
              foregroundColor: AppTheme.pureWhite,
              shadowColor: Colors.transparent,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusButton),
              ),
              padding: const EdgeInsets.symmetric(vertical: AppTheme.space16),
            ),
            child: Text(
              focus.isPaused ? 'RESUME BLOCK' : 'PAUSE BLOCK',
              style: AppTheme.buttonLabel,
            ),
          ),
        ),
        const SizedBox(width: AppTheme.space12),

        // Cancel / Terminate Action
        Expanded(
          child: OutlinedButton(
            onPressed: () => focus.stopSession(),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppTheme.priorityHigh),
              foregroundColor: AppTheme.priorityHigh,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusButton),
              ),
              padding: const EdgeInsets.symmetric(vertical: AppTheme.space16),
            ),
            child: Text(
              'CANCEL BLOCK',
              style: AppTheme.buttonLabel.copyWith(color: AppTheme.priorityHigh),
            ),
          ),
        ),
      ],
    );
  }
}
