enum TaskStatus {
  inbox,
  todo,
  inProgress,
  done,
  archived;

  String toJson() => name;
  static TaskStatus fromJson(String value) =>
      TaskStatus.values.firstWhere((e) => e.name == value, orElse: () => TaskStatus.inbox);
}

enum TaskPriority {
  low,
  medium,
  high,
  urgent;

  String toJson() => name;
  static TaskPriority fromJson(String value) =>
      TaskPriority.values.firstWhere((e) => e.name == value, orElse: () => TaskPriority.medium);
}

class Subtask {
  String id;
  String title;
  bool isDone;

  Subtask({
    required this.id,
    required this.title,
    this.isDone = false,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'isDone': isDone,
      };

  factory Subtask.fromJson(Map<String, dynamic> json) => Subtask(
        id: json['id'] as String,
        title: json['title'] as String,
        isDone: json['isDone'] as bool? ?? false,
      );
}

class Task {
  String id;
  String title;
  String description;
  TaskStatus status;
  TaskPriority priority;
  DateTime? dueDate;
  int? estimatedMinutes;
  int? actualMinutes;
  String? projectId;
  List<String> tags;
  List<Subtask> subtasks;
  DateTime createdAt;

  Task({
    required this.id,
    required this.title,
    this.description = '',
    this.status = TaskStatus.inbox,
    this.priority = TaskPriority.medium,
    this.dueDate,
    this.estimatedMinutes,
    this.actualMinutes,
    this.projectId,
    required this.tags,
    required this.subtasks,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'status': status.toJson(),
        'priority': priority.toJson(),
        'dueDate': dueDate?.toIso8601String(),
        'estimatedMinutes': estimatedMinutes,
        'actualMinutes': actualMinutes,
        'projectId': projectId,
        'tags': tags,
        'subtasks': subtasks.map((e) => e.toJson()).toList(),
        'createdAt': createdAt.toIso8601String(),
      };

  factory Task.fromJson(Map<String, dynamic> json) => Task(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String? ?? '',
        status: TaskStatus.fromJson(json['status'] as String? ?? 'inbox'),
        priority: TaskPriority.fromJson(json['priority'] as String? ?? 'medium'),
        dueDate: json['dueDate'] != null ? DateTime.parse(json['dueDate'] as String) : null,
        estimatedMinutes: json['estimatedMinutes'] as int?,
        actualMinutes: json['actualMinutes'] as int?,
        projectId: json['projectId'] as String?,
        tags: List<String>.from(json['tags'] as List? ?? []),
        subtasks: (json['subtasks'] as List? ?? [])
            .map((e) => Subtask.fromJson(e as Map<String, dynamic>))
            .toList(),
        createdAt: DateTime.parse(json['createdAt'] as String? ?? DateTime.now().toIso8601String()),
      );
}
