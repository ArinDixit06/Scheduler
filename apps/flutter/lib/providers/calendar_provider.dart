import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/event.dart';

class CalendarProvider extends ChangeNotifier {
  List<CalendarEvent> _events = [];
  bool _isGoogleSynced = false;
  bool _isSyncing = false;

  List<CalendarEvent> get events => _events;
  bool get isGoogleSynced => _isGoogleSynced;
  bool get isSyncing => _isSyncing;

  CalendarProvider() {
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    final prefs = await SharedPreferences.getInstance();
    _isGoogleSynced = prefs.getBool('calendar_google_synced') ?? false;
    final String? eventsJson = prefs.getString('apex_events');

    if (eventsJson != null) {
      try {
        final List<dynamic> decoded = jsonDecode(eventsJson);
        _events = decoded.map((e) => CalendarEvent.fromJson(e as Map<String, dynamic>)).toList();
      } catch (e) {
        _populateSampleEvents();
      }
    } else {
      _populateSampleEvents();
    }
  }

  void _populateSampleEvents() {
    final now = DateTime.now();
    _events = [
      CalendarEvent(
        id: 'event-1',
        title: 'Standup Sync & Sprint Planning',
        description: 'Sync with the development team on active tickets and address any roadblocks.',
        startAt: DateTime(now.year, now.month, now.day, 9, 0),
        endAt: DateTime(now.year, now.month, now.day, 9, 30),
        location: 'APEX Headquarters, Room 4B',
        attendees: ['Arin Dixit', 'Sarah Carter', 'Michael Chen'],
        source: EventSource.internal,
      ),
      CalendarEvent(
        id: 'event-2',
        title: 'Weekly Focus Review',
        description: 'Review overall metrics and compile habits charts.',
        startAt: DateTime(now.year, now.month, now.day, 16, 0),
        endAt: DateTime(now.year, now.month, now.day, 16, 45),
        location: 'Focus Room A',
        attendees: ['Arin Dixit'],
        source: EventSource.internal,
      ),
    ];
    _saveEvents();
  }

  Future<void> _saveEvents() async {
    final prefs = await SharedPreferences.getInstance();
    final String encoded = jsonEncode(_events.map((e) => e.toJson()).toList());
    await prefs.setString('apex_events', encoded);
    await prefs.setBool('calendar_google_synced', _isGoogleSynced);
  }

  Future<void> toggleGoogleSync() async {
    _isSyncing = true;
    notifyListeners();

    // Simulate network delay for sync
    await Future.delayed(const Duration(milliseconds: 1500));

    _isGoogleSynced = !_isGoogleSynced;

    if (_isGoogleSynced) {
      // Sync Google calendar events
      final now = DateTime.now();
      _events.addAll([
        CalendarEvent(
          id: 'google-event-1',
          title: 'Google Partner Q3 Product Briefing',
          description: 'A deep-dive technical alignment sync reviewing API deprecations and SDK 54 migrations.',
          startAt: DateTime(now.year, now.month, now.day, 10, 0),
          endAt: DateTime(now.year, now.month, now.day, 11, 30),
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          attendees: ['Arin Dixit', 'Marcus Aurelius (Google)', 'Julius Caesar (Google)'],
          source: EventSource.google,
        ),
        CalendarEvent(
          id: 'google-event-2',
          title: 'Design Critique: Universal Typographies',
          description: 'Review custom displays, letters spacing, and baseline rules inspired by minimal luxury brands.',
          startAt: DateTime(now.year, now.month, now.day, 14, 0),
          endAt: DateTime(now.year, now.month, now.day, 15, 0),
          meetingUrl: 'https://meet.google.com/xyz-qprs-tuv',
          attendees: ['Arin Dixit', 'Clara Schumann', 'Ludwig van Beethoven'],
          source: EventSource.google,
        ),
      ]);
    } else {
      // Remove Google calendar events
      _events.removeWhere((e) => e.source == EventSource.google);
    }

    _isSyncing = false;
    await _saveEvents();
    notifyListeners();
  }

  void addEvent(CalendarEvent event) {
    _events.add(event);
    _saveEvents();
    notifyListeners();
  }

  void deleteEvent(String eventId) {
    _events.removeWhere((e) => e.id == eventId);
    _saveEvents();
    notifyListeners();
  }
}
