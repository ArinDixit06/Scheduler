import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../models/task.dart';
import '../../providers/task_provider.dart';
import '../../widgets/screen_shell.dart';

class TaskListScreen extends StatefulWidget {
  const TaskListScreen({Key? key}) : super(key: key);

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen> {
  TaskStatus _selectedFilter = TaskStatus.todo;
  final _taskTitleController = TextEditingController();
  final _subtaskController = TextEditingController();
  Task? _expandedTask;

  @override
  void dispose() {
    _taskTitleController.dispose();
    _subtaskController.dispose();
    super.dispose();
  }

  void _addNewTask() {
    final title = _taskTitleController.text.trim();
    if (title.isEmpty) return;

    final newTask = Task(
      id: 'task-${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      status: _selectedFilter,
      priority: TaskPriority.medium,
      tags: [],
      subtasks: [],
      createdAt: DateTime.now(),
    );

    Provider.of<TaskProvider>(context, listen: false).addTask(newTask);
    _taskTitleController.clear();
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    final taskProvider = Provider.of<TaskProvider>(context);
    final displayedTasks = _selectedFilter == TaskStatus.inbox
        ? taskProvider.inboxTasks
        : _selectedFilter == TaskStatus.todo
            ? taskProvider.todoTasks
            : _selectedFilter == TaskStatus.inProgress
                ? taskProvider.inProgressTasks
                : taskProvider.completedTasks;

    return ScreenShell(
      title: 'SPRINT BACKLOG',
      child: Column(
        children: [
          // 1. Status Filter Header Slider
          _buildFilterTabs(),
          const SizedBox(height: AppTheme.space8),

          // 2. Active List Content
          Expanded(
            child: displayedTasks.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24),
                    itemCount: displayedTasks.length,
                    itemBuilder: (context, index) {
                      final task = displayedTasks[index];
                      final isExpanded = _expandedTask?.id == task.id;

                      return _buildTaskItem(task, isExpanded, taskProvider);
                    },
                  ),
          ),

          // 3. Floating Quick-Addition Bar
          _buildQuickAdditionBar(),
        ],
      ),
    );
  }

  Widget _buildFilterTabs() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildFilterButton('INBOX', TaskStatus.inbox),
          _buildFilterButton('TODO', TaskStatus.todo),
          _buildFilterButton('ACTIVE', TaskStatus.inProgress),
          _buildFilterButton('DONE', TaskStatus.done),
        ],
      ),
    );
  }

  Widget _buildFilterButton(String label, TaskStatus status) {
    final isSelected = _selectedFilter == status;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = status;
          _expandedTask = null;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppTheme.space8, horizontal: AppTheme.space12),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isSelected ? AppTheme.electricBlue : Colors.transparent,
              width: 2.0,
            ),
          ),
        ),
        child: Text(
          label,
          style: AppTheme.navItem.copyWith(
            color: isSelected ? AppTheme.carbonDark : AppTheme.pewter,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
      ),
    );
  }

  Widget _buildTaskItem(Task task, bool isExpanded, TaskProvider taskProvider) {
    final Color priorityColor = task.priority == TaskPriority.urgent
        ? AppTheme.priorityUrgent
        : task.priority == TaskPriority.high
            ? AppTheme.priorityHigh
            : task.priority == TaskPriority.medium
                ? AppTheme.priorityMedium
                : AppTheme.priorityLow;

    return Container(
      margin: const EdgeInsets.only(bottom: AppTheme.space8),
      decoration: BoxDecoration(
        color: isExpanded ? AppTheme.lightAsh : AppTheme.pureWhite,
        border: Border.all(color: AppTheme.cloudGray),
        borderRadius: BorderRadius.circular(AppTheme.radiusCard),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ListTile(
            leading: Checkbox(
              value: task.status == TaskStatus.done,
              onChanged: (_) {
                taskProvider.toggleTaskStatus(task.id);
                if (isExpanded) {
                  setState(() => _expandedTask = null);
                }
              },
              activeColor: AppTheme.electricBlue,
              side: const BorderSide(color: AppTheme.paleSilver),
            ),
            title: Text(
              task.title,
              style: AppTheme.bodyMedium.copyWith(
                decoration: task.status == TaskStatus.done ? TextDecoration.lineThrough : null,
                color: task.status == TaskStatus.done ? AppTheme.pewter : AppTheme.carbonDark,
              ),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Priority pill
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: AppTheme.space8, vertical: AppTheme.space2),
                  decoration: BoxDecoration(
                    border: Border.all(color: priorityColor),
                    borderRadius: BorderRadius.circular(AppTheme.radiusIndicator),
                  ),
                  child: Text(
                    task.priority.name.toUpperCase(),
                    style: AppTheme.captionText.copyWith(color: priorityColor, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: AppTheme.space8),
                Icon(
                  isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  color: AppTheme.pewter,
                ),
              ],
            ),
            onTap: () {
              setState(() {
                _expandedTask = isExpanded ? null : task;
              });
            },
          ),

          // Detail Expander Panel
          if (isExpanded) ...[
            const Divider(color: AppTheme.paleSilver, height: 1),
            Padding(
              padding: const EdgeInsets.all(AppTheme.space16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (task.description.isNotEmpty) ...[
                    Text(
                      task.description,
                      style: AppTheme.bodyRegular.copyWith(color: AppTheme.graphite),
                    ),
                    const SizedBox(height: AppTheme.space16),
                  ],

                  // Tags display
                  if (task.tags.isNotEmpty) ...[
                    Wrap(
                      spacing: AppTheme.space4,
                      children: task.tags.map((tag) {
                        return Chip(
                          label: Text(tag.toUpperCase(), style: AppTheme.captionText.copyWith(fontSize: 10)),
                          backgroundColor: AppTheme.lightAsh,
                          side: BorderSide.none,
                          padding: EdgeInsets.zero,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: AppTheme.space16),
                  ],

                  // Nested Subtask Header
                  Text(
                    'SUBTASKS',
                    style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
                  ),
                  const SizedBox(height: AppTheme.space8),

                  // Subtask checklist
                  ...task.subtasks.map((sub) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: AppTheme.space4),
                      child: Row(
                        children: [
                          GestureDetector(
                            onTap: () => taskProvider.toggleSubtask(task.id, sub.id),
                            child: Icon(
                              sub.isDone ? Icons.check_box : Icons.check_box_outline_blank,
                              color: sub.isDone ? AppTheme.electricBlue : AppTheme.pewter,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: AppTheme.space8),
                          Expanded(
                            child: Text(
                              sub.title,
                              style: AppTheme.bodyRegular.copyWith(
                                decoration: sub.isDone ? TextDecoration.lineThrough : null,
                                color: sub.isDone ? AppTheme.pewter : AppTheme.carbonDark,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),

                  // Quick subtask adder
                  Padding(
                    padding: const EdgeInsets.only(top: AppTheme.space12),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _subtaskController,
                            decoration: const InputDecoration(
                              hintText: 'Add subtask...',
                              hintStyle: TextStyle(color: AppTheme.silverFog, fontSize: 13),
                              border: InputBorder.none,
                              isDense: true,
                            ),
                            style: AppTheme.bodyRegular,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.add, color: AppTheme.electricBlue, size: 20),
                          onPressed: () {
                            final title = _subtaskController.text.trim();
                            if (title.isNotEmpty) {
                              taskProvider.addSubtask(task.id, title);
                              _subtaskController.clear();
                            }
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppTheme.space16),

                  // Quick Actions row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Priority selector cycling
                      TextButton(
                        onPressed: () {
                          final currentPriority = task.priority;
                          final nextPriority = currentPriority == TaskPriority.low
                              ? TaskPriority.medium
                              : currentPriority == TaskPriority.medium
                                  ? TaskPriority.high
                                  : currentPriority == TaskPriority.high
                                      ? TaskPriority.urgent
                                      : TaskPriority.low;

                          task.priority = nextPriority;
                          taskProvider.updateTask(task);
                        },
                        child: Text('CYCLE PRIORITY'),
                      ),

                      // Delete task
                      TextButton(
                        onPressed: () {
                          taskProvider.deleteTask(task.id);
                          setState(() => _expandedTask = null);
                        },
                        style: TextButton.styleFrom(foregroundColor: AppTheme.priorityHigh),
                        child: const Text('DELETE'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_outlined, size: 48, color: AppTheme.pewter.withOpacity(0.5)),
          const SizedBox(height: AppTheme.space16),
          Text(
            'All clean here.',
            style: AppTheme.productName.copyWith(color: AppTheme.pewter),
          ),
          const SizedBox(height: AppTheme.space4),
          Text(
            'Create a task below or sync with Copilot.',
            style: AppTheme.captionText,
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAdditionBar() {
    return Container(
      color: AppTheme.pureWhite,
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.lightAsh,
          borderRadius: BorderRadius.circular(AppTheme.radiusButton),
        ),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space16),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _taskTitleController,
                decoration: InputDecoration(
                  border: InputBorder.none,
                  hintText: 'Add to ${_selectedFilter.name.toUpperCase()}...',
                  hintStyle: const TextStyle(color: AppTheme.silverFog),
                ),
                style: AppTheme.bodyRegular,
                onSubmitted: (_) => _addNewTask(),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.arrow_upward, color: AppTheme.electricBlue),
              onPressed: _addNewTask,
            ),
          ],
        ),
      ),
    );
  }
}
