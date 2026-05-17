import 'dart:async';
import 'package:flutter/material.dart';
import '../models/focus.dart';

class FocusProvider extends ChangeNotifier {
  FocusMode _activeMode = FocusMode.pomodoro;
  int _durationSeconds = 25 * 60;
  int _totalSeconds = 25 * 60;
  bool _isRunning = false;
  bool _isPaused = false;
  String? _activeTaskId;
  Timer? _timer;

  // Session Statistics Mocks
  int _totalMinutesCompleted = 125;
  int _sessionsCompletedCount = 5;

  FocusMode get activeMode => _activeMode;
  int get durationSeconds => _durationSeconds;
  int get totalSeconds => _totalSeconds;
  bool get isRunning => _isRunning;
  bool get isPaused => _isPaused;
  String? get activeTaskId => _activeTaskId;

  int get totalMinutesCompleted => _totalMinutesCompleted;
  int get sessionsCompletedCount => _sessionsCompletedCount;

  double get progressPercent {
    if (_totalSeconds == 0) return 0.0;
    return 1.0 - (_durationSeconds / _totalSeconds);
  }

  String get timerString {
    final minutes = (_durationSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (_durationSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  void selectMode(FocusMode mode) {
    if (_isRunning) return;
    _activeMode = mode;
    switch (mode) {
      case FocusMode.pomodoro:
        _totalSeconds = 25 * 60;
        break;
      case FocusMode.deepWork:
        _totalSeconds = 45 * 60;
        break;
      case FocusMode.flow:
        _totalSeconds = 60 * 60;
        break;
    }
    _durationSeconds = _totalSeconds;
    notifyListeners();
  }

  void startSession({String? taskId}) {
    if (_isRunning) return;
    _isRunning = true;
    _isPaused = false;
    _activeTaskId = taskId;

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_durationSeconds > 0) {
        _durationSeconds--;
        notifyListeners();
      } else {
        _completeSession();
      }
    });
    notifyListeners();
  }

  void pauseSession() {
    if (!_isRunning || _isPaused) return;
    _isPaused = true;
    _timer?.cancel();
    notifyListeners();
  }

  void resumeSession() {
    if (!_isRunning || !_isPaused) return;
    _isPaused = false;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_durationSeconds > 0) {
        _durationSeconds--;
        notifyListeners();
      } else {
        _completeSession();
      }
    });
    notifyListeners();
  }

  void stopSession() {
    _timer?.cancel();
    _isRunning = false;
    _isPaused = false;
    _durationSeconds = _totalSeconds;
    _activeTaskId = null;
    notifyListeners();
  }

  void _completeSession() {
    _timer?.cancel();
    final completedMinutes = _totalSeconds ~/ 60;
    _totalMinutesCompleted += completedMinutes;
    _sessionsCompletedCount += 1;

    _isRunning = false;
    _isPaused = false;
    _durationSeconds = _totalSeconds;
    _activeTaskId = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
