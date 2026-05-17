import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../models/task.dart';
import '../../providers/task_provider.dart';
import 'task_detail_screen.dart';

class ProjectDetailScreen extends StatelessWidget {
  final String projectName;
  const ProjectDetailScreen({Key? key, required this.projectName}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final taskProvider = Provider.of<TaskProvider>(context);
    
    // Filter tasks that contain this tag/project name
    final projectTasks = taskProvider.tasks.where((t) {
      return t.tags.any((tag) => tag.toLowerCase() == projectName.toLowerCase()) ||
             (t.projectId?.toLowerCase() == projectName.toLowerCase());
    }).toList();

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
          projectName.toUpperCase(),
          style: AppTheme.productName.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
      ),
      body: projectTasks.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.folder_open_outlined, size: 48, color: AppTheme.pewter.withOpacity(0.5)),
                  const SizedBox(height: AppTheme.space16),
                  Text('No tasks categorized here.', style: AppTheme.bodyMedium.copyWith(color: AppTheme.pewter)),
                ],
              ),
            )
          : ListView.builder(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
              itemCount: projectTasks.length,
              itemBuilder: (context, index) {
                final task = projectTasks[index];

                return Container(
                  margin: const EdgeInsets.only(bottom: AppTheme.space8),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTheme.cloudGray),
                    borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                  ),
                  child: ListTile(
                    leading: Checkbox(
                      value: task.status == TaskStatus.done,
                      onChanged: (_) {
                        taskProvider.toggleTaskStatus(task.id);
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
                    trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppTheme.pewter),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => TaskDetailScreen(taskId: task.id)),
                      );
                    },
                  ),
                );
              },
            ),
    );
  }
}
