enum FocusMode {
  pomodoro,
  deepWork,
  flow;

  String toJson() => name;
  static FocusMode fromJson(String value) =>
      FocusMode.values.firstWhere((e) => e.name == value, orElse: () => FocusMode.pomodoro);
}

class FocusSession {
  String id;
  String? taskId;
  DateTime startAt;
  DateTime? endAt;
  int plannedMinutes;
  int? actualMinutes;
  FocusMode mode;
  int breaksTaken;
  String? notes;

  FocusSession({
    required this.id,
    this.taskId,
    required this.startAt,
    this.endAt,
    required this.plannedMinutes,
    this.actualMinutes,
    this.mode = FocusMode.pomodoro,
    this.breaksTaken = 0,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'taskId': taskId,
        'startAt': startAt.toIso8601String(),
        'endAt': endAt?.toIso8601String(),
        'plannedMinutes': plannedMinutes,
        'actualMinutes': actualMinutes,
        'mode': mode.toJson(),
        'breaksTaken': breaksTaken,
        'notes': notes,
      };

  factory FocusSession.fromJson(Map<String, dynamic> json) => FocusSession(
        id: json['id'] as String,
        taskId: json['taskId'] as String?,
        startAt: DateTime.parse(json['startAt'] as String),
        endAt: json['endAt'] != null ? DateTime.parse(json['endAt'] as String) : null,
        plannedMinutes: json['plannedMinutes'] as int? ?? 25,
        actualMinutes: json['actualMinutes'] as int?,
        mode: FocusMode.fromJson(json['mode'] as String? ?? 'pomodoro'),
        breaksTaken: json['breaksTaken'] as int? ?? 0,
        notes: json['notes'] as String?,
      );
}
