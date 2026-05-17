import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/task.dart';

class TaskProvider extends ChangeNotifier {
  List<Task> _tasks = [];
  bool _isLoading = true;

  List<Task> get tasks => _tasks;
  bool get isLoading => _isLoading;

  List<Task> get inboxTasks => _tasks.where((t) => t.status == TaskStatus.inbox).toList();
  List<Task> get todoTasks => _tasks.where((t) => t.status == TaskStatus.todo).toList();
  List<Task> get inProgressTasks => _tasks.where((t) => t.status == TaskStatus.inProgress).toList();
  List<Task> get completedTasks => _tasks.where((t) => t.status == TaskStatus.done).toList();

  TaskProvider() {
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    _isLoading = true;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    final String? tasksJson = prefs.getString('apex_tasks');

    if (tasksJson != null) {
      try {
        final List<dynamic> decoded = jsonDecode(tasksJson);
        _tasks = decoded.map((item) => Task.fromJson(item as Map<String, dynamic>)).toList();
      } catch (e) {
        _populateSampleTasks();
      }
    } else {
      _populateSampleTasks();
    }

    _isLoading = false;
    notifyListeners();
  }

  void _populateSampleTasks() {
    final now = DateTime.now();
    _tasks = [
      Task(
        id: 'task-1',
        title: 'Review Engineering Roadmap',
        description: 'Read the draft architecture brief for Apex V2 and compile design notes.',
        status: TaskStatus.inbox,
        priority: TaskPriority.medium,
        tags: ['Engineering', 'Planning'],
        subtasks: [],
        createdAt: now.subtract(const Duration(hours: 4)),
      ),
      Task(
        id: 'task-2',
        title: 'Prep Slides for Q3 Executive Review',
        description: 'Prepare metrics slides outlining user retention, focus session count, and cloud build performance numbers.',
        status: TaskStatus.todo,
        priority: TaskPriority.high,
        dueDate: now.add(const Duration(days: 1)),
        estimatedMinutes: 45,
        tags: ['Marketing', 'Metrics'],
        subtasks: [
          Subtask(id: 'sub-2-1', title: 'Export Zod schema telemetry reports', isDone: true),
          Subtask(id: 'sub-2-2', title: 'Verify Google Calendar sync uptime stats', isDone: false),
          Subtask(id: 'sub-2-3', title: 'Structure slides layout', isDone: false),
        ],
        createdAt: now.subtract(const Duration(days: 1)),
      ),
      Task(
        id: 'task-3',
        title: 'Refactor Authentication Provider Store',
        description: 'Port the legacy state managers to our new modular architecture and configure local offline fallback paths.',
        status: TaskStatus.inProgress,
        priority: TaskPriority.urgent,
        estimatedMinutes: 90,
        tags: ['Refactoring', 'Auth'],
        subtasks: [
          Subtask(id: 'sub-3-1', title: 'Add SharedPreferences sync tests', isDone: true),
          Subtask(id: 'sub-3-2', title: 'Implement custom exceptions logger', isDone: false),
        ],
        createdAt: now.subtract(const Duration(days: 2)),
      ),
      Task(
        id: 'task-4',
        title: 'Clean EAS Android Credentials config',
        description: 'Double check release keys alignment inside the cloud properties dashboard.',
        status: TaskStatus.done,
        priority: TaskPriority.low,
        actualMinutes: 30,
        tags: ['DevOps', 'EAS'],
        subtasks: [],
        createdAt: now.subtract(const Duration(days: 3)),
      ),
    ];
    _saveTasks();
  }

  Future<void> _saveTasks() async {
    final prefs = await SharedPreferences.getInstance();
    final String encoded = jsonEncode(_tasks.map((e) => e.toJson()).toList());
    await prefs.setString('apex_tasks', encoded);
  }

  void addTask(Task task) {
    _tasks.add(task);
    _saveTasks();
    notifyListeners();
  }

  void updateTask(Task updatedTask) {
    final index = _tasks.indexWhere((t) => t.id == updatedTask.id);
    if (index != -1) {
      _tasks[index] = updatedTask;
      _saveTasks();
      notifyListeners();
    }
  }

  void deleteTask(String taskId) {
    _tasks.removeWhere((t) => t.id == taskId);
    _saveTasks();
    notifyListeners();
  }

  void toggleTaskStatus(String taskId) {
    final index = _tasks.indexWhere((t) => t.id == taskId);
    if (index != -1) {
      final task = _tasks[index];
      if (task.status == TaskStatus.done) {
        task.status = TaskStatus.todo;
        task.completedAt = null;
      } else {
        task.status = TaskStatus.done;
        task.completedAt = DateTime.now();
      }
      _tasks[index] = task;
      _saveTasks();
      notifyListeners();
    }
  }

  void toggleSubtask(String taskId, String subtaskId) {
    final taskIndex = _tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex != -1) {
      final task = _tasks[taskIndex];
      final subIndex = task.subtasks.indexWhere((s) => s.id == subtaskId);
      if (subIndex != -1) {
        task.subtasks[subIndex].isDone = !task.subtasks[subIndex].isDone;
        _tasks[taskIndex] = task;
        _saveTasks();
        notifyListeners();
      }
    }
  }

  void addSubtask(String taskId, String title) {
    final taskIndex = _tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex != -1) {
      final task = _tasks[taskIndex];
      task.subtasks.add(Subtask(
        id: 'sub-${DateTime.now().millisecondsSinceEpoch}',
        title: title,
        isDone: false,
      ));
      _tasks[taskIndex] = task;
      _saveTasks();
      notifyListeners();
    }
  }

  void deleteSubtask(String taskId, String subtaskId) {
    final taskIndex = _tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex != -1) {
      final task = _tasks[taskIndex];
      task.subtasks.removeWhere((s) => s.id == subtaskId);
      _tasks[taskIndex] = task;
      _saveTasks();
      notifyListeners();
    }
  }

  void updateTaskStatus(String taskId, TaskStatus status) {
    final index = _tasks.indexWhere((t) => t.id == taskId);
    if (index != -1) {
      final task = _tasks[index];
      task.status = status;
      if (status == TaskStatus.done) {
        task.completedAt = DateTime.now();
      } else {
        task.completedAt = null;
      }
      _tasks[index] = task;
      _saveTasks();
      notifyListeners();
    }
  }
}
