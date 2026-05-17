enum HabitFrequency {
  daily,
  weekly;

  String toJson() => name;
  static HabitFrequency fromJson(String value) =>
      HabitFrequency.values.firstWhere((e) => e.name == value, orElse: () => HabitFrequency.daily);
}

class Habit {
  String id;
  String title;
  String description;
  HabitFrequency frequency;
  int targetCount;
  int streak;
  int longestStreak;
  Map<String, int> entries; // Key: 'YYYY-MM-DD', Value: logged count
  DateTime createdAt;

  Habit({
    required this.id,
    required this.title,
    this.description = '',
    this.frequency = HabitFrequency.daily,
    this.targetCount = 1,
    this.streak = 0,
    this.longestStreak = 0,
    required this.entries,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'frequency': frequency.toJson(),
        'targetCount': targetCount,
        'streak': streak,
        'longestStreak': longestStreak,
        'entries': entries,
        'createdAt': createdAt.toIso8601String(),
      };

  factory Habit.fromJson(Map<String, dynamic> json) => Habit(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String? ?? '',
        frequency: HabitFrequency.fromJson(json['frequency'] as String? ?? 'daily'),
        targetCount: json['targetCount'] as int? ?? 1,
        streak: json['streak'] as int? ?? 0,
        longestStreak: json['longestStreak'] as int? ?? 0,
        entries: Map<String, int>.from(json['entries'] as Map? ?? {}),
        createdAt: DateTime.parse(json['createdAt'] as String? ?? DateTime.now().toIso8601String()),
      );
}
