import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../models/task.dart';
import '../../providers/task_provider.dart';

class TaskDetailScreen extends StatefulWidget {
  final String taskId;
  const TaskDetailScreen({Key? key, required this.taskId}) : super(key: key);

  @override
  State<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends State<TaskDetailScreen> {
  final _subtaskController = TextEditingController();

  @override
  void dispose() {
    _subtaskController.dispose();
    super.dispose();
  }

  void _addSubtask(TaskProvider taskProvider) {
    final title = _subtaskController.text.trim();
    if (title.isNotEmpty) {
      taskProvider.addSubtask(
        widget.taskId,
        title,
      );
      _subtaskController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    final taskProvider = Provider.of<TaskProvider>(context);
    final taskIndex = taskProvider.tasks.indexWhere((t) => t.id == widget.taskId);

    if (taskIndex == -1) {
      return Scaffold(
        appBar: AppBar(title: const Text('Task Not Found')),
        body: const Center(child: Text('This task may have been deleted.')),
      );
    }

    final task = taskProvider.tasks[taskIndex];

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
          'TASK DETAIL',
          style: AppTheme.productName.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent),
            onPressed: () {
              taskProvider.deleteTask(task.id);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Deleted "${task.title}"'),
                  backgroundColor: AppTheme.carbonDark,
                ),
              );
            },
          ),
          const SizedBox(width: AppTheme.space12),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Title
            Text(
              task.title,
              style: AppTheme.displayTitle.copyWith(fontSize: 22.0, color: AppTheme.carbonDark, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: AppTheme.space8),

            // Metadata Badges (Priority & Status)
            Row(
              children: [
                _buildPriorityBadge(task.priority),
                const SizedBox(width: AppTheme.space8),
                _buildStatusBadge(task.status, taskProvider, task.id),
              ],
            ),
            const SizedBox(height: AppTheme.space20),
            const Divider(color: AppTheme.cloudGray, height: 1.0),
            const SizedBox(height: AppTheme.space20),

            // Description Section
            Text('DESCRIPTION & NOTES', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.space8),
            Container(
              padding: const EdgeInsets.all(AppTheme.space16),
              decoration: BoxDecoration(
                color: AppTheme.lightAsh,
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              child: Text(
                task.description.isNotEmpty ? task.description : 'No description details provided.',
                style: AppTheme.bodyRegular.copyWith(color: task.description.isNotEmpty ? AppTheme.carbonDark : AppTheme.pewter),
              ),
            ),
            const SizedBox(height: AppTheme.space24),

            // Project/Tags Scoped
            if (task.tags.isNotEmpty) ...[
              Text('CATEGORY TAGS', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: AppTheme.space8),
              Wrap(
                spacing: 6.0,
                children: task.tags.map((t) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.cloudGray,
                      borderRadius: BorderRadius.circular(AppTheme.radiusIndicator),
                    ),
                    child: Text(
                      t.toUpperCase(),
                      style: AppTheme.captionText.copyWith(color: AppTheme.graphite, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: AppTheme.space24),
            ],

            // Subtask Checklist Checklist
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('NESTED CHECKLIST', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
                if (task.subtasks.isNotEmpty)
                  Text(
                    '${task.subtasks.where((s) => s.isDone).length}/${task.subtasks.length} DONE',
                    style: AppTheme.captionText.copyWith(color: AppTheme.electricBlue, fontWeight: FontWeight.bold),
                  ),
              ],
            ),
            const SizedBox(height: AppTheme.space8),
            
            // Add subtask inline input
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _subtaskController,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                        borderSide: const BorderSide(color: AppTheme.cloudGray),
                      ),
                      hintText: 'Add checklist subtask...',
                      hintStyle: const TextStyle(fontSize: 13),
                    ),
                    onSubmitted: (_) => _addSubtask(taskProvider),
                  ),
                ),
                const SizedBox(width: AppTheme.space8),
                IconButton(
                  icon: const Icon(Icons.playlist_add_check, color: AppTheme.electricBlue),
                  onPressed: () => _addSubtask(taskProvider),
                ),
              ],
            ),
            const SizedBox(height: AppTheme.space12),

            if (task.subtasks.isEmpty)
              Container(
                padding: const EdgeInsets.all(AppTheme.space16),
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.cloudGray),
                  borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                ),
                alignment: Alignment.center,
                child: Text('No subtask checklists scheduled.', style: AppTheme.bodyRegular.copyWith(color: AppTheme.pewter)),
              )
            else
              Column(
                children: task.subtasks.map((sub) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 6.0),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.cloudGray),
                      borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                    ),
                    child: ListTile(
                      leading: Checkbox(
                        value: sub.isDone,
                        onChanged: (_) {
                          taskProvider.toggleSubtask(task.id, sub.id);
                        },
                        activeColor: AppTheme.electricBlue,
                        side: const BorderSide(color: AppTheme.paleSilver),
                      ),
                      title: Text(
                        sub.title,
                        style: AppTheme.bodyMedium.copyWith(
                          decoration: sub.isDone ? TextDecoration.lineThrough : null,
                          color: sub.isDone ? AppTheme.pewter : AppTheme.carbonDark,
                        ),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline, color: AppTheme.pewter, size: 18),
                        onPressed: () {
                          taskProvider.deleteSubtask(task.id, sub.id);
                        },
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 4.0),
                    ),
                  );
                }).toList(),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriorityBadge(TaskPriority priority) {
    Color pColor = AppTheme.electricBlue;
    if (priority == TaskPriority.low) pColor = AppTheme.pewter;
    if (priority == TaskPriority.high) pColor = Colors.orangeAccent;
    if (priority == TaskPriority.urgent) pColor = Colors.redAccent;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: pColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppTheme.radiusIndicator),
      ),
      child: Text(
        priority.name.toUpperCase(),
        style: TextStyle(color: pColor, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
      ),
    );
  }

  Widget _buildStatusBadge(TaskStatus status, TaskProvider provider, String taskId) {
    return PopupMenuButton<TaskStatus>(
      initialValue: status,
      onSelected: (newStatus) {
        provider.updateTaskStatus(taskId, newStatus);
      },
      itemBuilder: (context) {
        return TaskStatus.values.map((s) {
          return PopupMenuItem<TaskStatus>(
            value: s,
            child: Text(s.name.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          );
        }).toList();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AppTheme.carbonDark.withOpacity(0.08),
          borderRadius: BorderRadius.circular(AppTheme.radiusIndicator),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              status.name.toUpperCase(),
              style: const TextStyle(color: AppTheme.carbonDark, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.arrow_drop_down, color: AppTheme.carbonDark, size: 14),
          ],
        ),
      ),
    );
  }
}
