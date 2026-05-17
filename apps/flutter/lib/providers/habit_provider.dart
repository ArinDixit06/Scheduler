import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import '../models/habit.dart';

class HabitProvider extends ChangeNotifier {
  List<Habit> _habits = [];
  bool _isLoading = true;

  List<Habit> get habits => _habits;
  bool get isLoading => _isLoading;

  HabitProvider() {
    _loadHabits();
  }

  Future<void> _loadHabits() async {
    _isLoading = true;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    final String? habitsJson = prefs.getString('apex_habits');

    if (habitsJson != null) {
      try {
        final List<dynamic> decoded = jsonDecode(habitsJson);
        _habits = decoded.map((e) => Habit.fromJson(e as Map<String, dynamic>)).toList();
      } catch (e) {
        _populateSampleHabits();
      }
    } else {
      _populateSampleHabits();
    }

    _isLoading = false;
    notifyListeners();
  }

  void _populateSampleHabits() {
    final now = DateTime.now();
    final today = DateFormat('yyyy-MM-dd').format(now);
    final yesterday = DateFormat('yyyy-MM-dd').format(now.subtract(const Duration(days: 1)));
    final dayBefore = DateFormat('yyyy-MM-dd').format(now.subtract(const Duration(days: 2)));

    _habits = [
      Habit(
        id: 'habit-1',
        title: 'Drink Water (2L)',
        description: 'Stay hydrated through the day to maintain peak cognitive stamina.',
        frequency: HabitFrequency.daily,
        targetCount: 3,
        streak: 5,
        longestStreak: 12,
        entries: {
          today: 2,
          yesterday: 3,
          dayBefore: 3,
        },
        createdAt: now.subtract(const Duration(days: 10)),
      ),
      Habit(
        id: 'habit-2',
        title: 'Write Code',
        description: 'Commit at least one robust, fully unit-tested implementation block.',
        frequency: HabitFrequency.daily,
        targetCount: 1,
        streak: 12,
        longestStreak: 20,
        entries: {
          today: 1,
          yesterday: 1,
          dayBefore: 1,
        },
        createdAt: now.subtract(const Duration(days: 30)),
      ),
      Habit(
        id: 'habit-3',
        title: 'Mindful Breathing',
        description: 'Perform a 5-minute deep focus box-breathing cycle.',
        frequency: HabitFrequency.daily,
        targetCount: 1,
        streak: 3,
        longestStreak: 6,
        entries: {
          today: 0,
          yesterday: 1,
          dayBefore: 1,
        },
        createdAt: now.subtract(const Duration(days: 5)),
      ),
    ];
    _saveHabits();
  }

  Future<void> _saveHabits() async {
    final prefs = await SharedPreferences.getInstance();
    final String encoded = jsonEncode(_habits.map((e) => e.toJson()).toList());
    await prefs.setString('apex_habits', encoded);
  }

  void addHabit(Habit habit) {
    _habits.add(habit);
    _saveHabits();
    notifyListeners();
  }

  void logHabitProgress(String habitId, int countOffset) {
    final index = _habits.indexWhere((h) => h.id == habitId);
    if (index != -1) {
      final habit = _habits[index];
      final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final currentLog = habit.entries[today] ?? 0;

      int newCount = currentLog + countOffset;
      if (newCount < 0) newCount = 0;
      if (newCount > habit.targetCount) newCount = habit.targetCount;

      habit.entries[today] = newCount;

      // Update streaks
      if (newCount >= habit.targetCount && currentLog < habit.targetCount) {
        habit.streak += 1;
        if (habit.streak > habit.longestStreak) {
          habit.longestStreak = habit.streak;
        }
      } else if (newCount < habit.targetCount && currentLog >= habit.targetCount) {
        habit.streak = habit.streak > 0 ? habit.streak - 1 : 0;
      }

      _habits[index] = habit;
      _saveHabits();
      notifyListeners();
    }
  }

  void deleteHabit(String habitId) {
    _habits.removeWhere((h) => h.id == habitId);
    _saveHabits();
    notifyListeners();
  }

  bool isCompletedToday(String habitId) {
    final index = _habits.indexWhere((h) => h.id == habitId);
    if (index == -1) return false;
    final habit = _habits[index];
    final todayKey = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final currentLog = habit.entries[todayKey] ?? 0;
    return currentLog >= habit.targetCount;
  }

  void toggleHabitCompletion(String habitId) {
    final index = _habits.indexWhere((h) => h.id == habitId);
    if (index != -1) {
      final habit = _habits[index];
      final todayKey = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final currentLog = habit.entries[todayKey] ?? 0;

      if (currentLog >= habit.targetCount) {
        // Completed today -> Toggle off
        habit.entries[todayKey] = 0;
        habit.streak = habit.streak > 0 ? habit.streak - 1 : 0;
      } else {
        // Not completed today -> Complete
        habit.entries[todayKey] = habit.targetCount;
        habit.streak += 1;
        if (habit.streak > habit.longestStreak) {
          habit.longestStreak = habit.streak;
        }
      }
      _habits[index] = habit;
      _saveHabits();
      notifyListeners();
    }
  }
}
