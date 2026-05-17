import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../models/task.dart';
import '../../providers/task_provider.dart';
import '../../widgets/screen_shell.dart';

class NewTaskScreen extends StatefulWidget {
  const NewTaskScreen({Key? key}) : super(key: key);

  @override
  State<NewTaskScreen> createState() => _NewTaskScreenState();
}

class _NewTaskScreenState extends State<NewTaskScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _tagController = TextEditingController();
  
  TaskPriority _priority = TaskPriority.medium;
  int? _estMinutes;
  final List<String> _tags = [];
  final List<String> _subtasks = [];

  final _subtaskController = TextEditingController();

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _tagController.dispose();
    _subtaskController.dispose();
    super.dispose();
  }

  void _addTag() {
    final t = _tagController.text.trim();
    if (t.isNotEmpty && !_tags.contains(t)) {
      setState(() {
        _tags.add(t);
        _tagController.clear();
      });
    }
  }

  void _addSubtask() {
    final s = _subtaskController.text.trim();
    if (s.isNotEmpty) {
      setState(() {
        _subtasks.add(s);
        _subtaskController.clear();
      });
    }
  }

  void _saveTask() {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a task title'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    final taskProvider = Provider.of<TaskProvider>(context, listen: false);
    taskProvider.addTask(Task(
      id: 'task-local-${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      description: _descController.text.trim(),
      status: TaskStatus.todo,
      priority: _priority,
      estimatedMinutes: _estMinutes,
      tags: _tags,
      subtasks: _subtasks.map((s) => Subtask(
        id: 'sub-${DateTime.now().millisecondsSinceEpoch}-${s.hashCode}',
        title: s,
        isDone: false,
      )).toList(),
      createdAt: DateTime.now(),
    ));

    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Task "$title" scheduled successfully!'),
        backgroundColor: AppTheme.electricBlue,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.pureWhite,
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0.0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: AppTheme.carbonDark),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'QUICK CAPTURE',
          style: AppTheme.productName.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
        actions: [
          TextButton(
            onPressed: _saveTask,
            child: Text(
              'SAVE',
              style: AppTheme.navItem.copyWith(color: AppTheme.electricBlue, fontWeight: FontWeight.bold),
            ),
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
            // Title Input
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(
                hintText: 'What needs to be done?',
                hintStyle: TextStyle(color: AppTheme.silverFog, fontSize: 18.0),
                border: InputBorder.none,
              ),
              style: AppTheme.displayTitle.copyWith(fontSize: 20.0, color: AppTheme.carbonDark),
              autofocus: true,
            ),
            const Divider(color: AppTheme.cloudGray, height: 1.0),
            const SizedBox(height: AppTheme.space20),

            // Description Input
            TextField(
              controller: _descController,
              decoration: const InputDecoration(
                hintText: 'Add description details...',
                hintStyle: TextStyle(color: AppTheme.silverFog),
                border: InputBorder.none,
              ),
              style: AppTheme.bodyRegular,
              maxLines: 3,
            ),
            const SizedBox(height: AppTheme.space12),

            // Est Minutes
            Row(
              children: [
                const Icon(Icons.timer_outlined, color: AppTheme.pewter, size: 20),
                const SizedBox(width: AppTheme.space8),
                Text('ESTIMATED TIME (MINS)', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(width: AppTheme.space16),
                Expanded(
                  child: TextField(
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                        borderSide: const BorderSide(color: AppTheme.cloudGray),
                      ),
                      hintText: 'e.g. 45',
                    ),
                    onChanged: (val) {
                      _estMinutes = int.tryParse(val);
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppTheme.space20),

            // Priority Selection
            Text('PRIORITY BADGE', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.space8),
            Row(
              children: TaskPriority.values.map((p) {
                final isSel = _priority == p;
                Color btnColor = AppTheme.lightAsh;
                Color textColor = AppTheme.graphite;
                if (isSel) {
                  textColor = AppTheme.pureWhite;
                  btnColor = p == TaskPriority.low
                      ? AppTheme.pewter
                      : p == TaskPriority.medium
                          ? AppTheme.electricBlue
                          : p == TaskPriority.high
                              ? Colors.orangeAccent
                              : Colors.redAccent;
                }

                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _priority = p),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4.0),
                      padding: const EdgeInsets.symmetric(vertical: AppTheme.space8),
                      decoration: BoxDecoration(
                        color: btnColor,
                        borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        p.name.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: textColor,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: AppTheme.space24),

            // Tags
            Text('TAG CATEGORIES', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.space8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _tagController,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                        borderSide: const BorderSide(color: AppTheme.cloudGray),
                      ),
                      hintText: 'Add category tag...',
                    ),
                    onSubmitted: (_) => _addTag(),
                  ),
                ),
                const SizedBox(width: AppTheme.space8),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline, color: AppTheme.electricBlue),
                  onPressed: _addTag,
                ),
              ],
            ),
            if (_tags.isNotEmpty) ...[
              const SizedBox(height: AppTheme.space8),
              Wrap(
                spacing: 6.0,
                runSpacing: 6.0,
                children: _tags.map((t) {
                  return Chip(
                    backgroundColor: AppTheme.lightAsh,
                    label: Text(t.toUpperCase(), style: AppTheme.captionText.copyWith(color: AppTheme.carbonDark)),
                    onDeleted: () {
                      setState(() => _tags.remove(t));
                    },
                    deleteIconColor: AppTheme.pewter,
                  );
                }).toList(),
              ),
            ],
            const SizedBox(height: AppTheme.space24),

            // Nested Subtasks
            Text('SUBTASK CHECKLIST', style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.space8),
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
                      hintText: 'e.g. Map offline schema models...',
                    ),
                    onSubmitted: (_) => _addSubtask(),
                  ),
                ),
                const SizedBox(width: AppTheme.space8),
                IconButton(
                  icon: const Icon(Icons.playlist_add, color: AppTheme.electricBlue),
                  onPressed: _addSubtask,
                ),
              ],
            ),
            if (_subtasks.isNotEmpty) ...[
              const SizedBox(height: AppTheme.space12),
              Column(
                children: _subtasks.asMap().entries.map((entry) {
                  final idx = entry.key;
                  final sub = entry.value;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 6.0),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.cloudGray),
                      borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                    ),
                    child: ListTile(
                      leading: const Icon(Icons.radio_button_off_outlined, color: AppTheme.pewter),
                      title: Text(sub, style: AppTheme.bodyMedium),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                        onPressed: () {
                          setState(() => _subtasks.removeAt(idx));
                        },
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12.0),
                    ),
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
