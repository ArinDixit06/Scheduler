import 'dart:async';
import 'package:flutter/material.dart';
import '../models/message.dart';
import '../models/task.dart';
import '../models/event.dart';
import 'task_provider.dart';
import 'calendar_provider.dart';

class CopilotProposal {
  final String id;
  final String type; // 'TASK' or 'EVENT'
  final String title;
  final String description;
  final String detail; // e.g. Priority for task, start hour for event
  final int durationMinutes;
  bool isAccepted;

  CopilotProposal({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.detail,
    required this.durationMinutes,
    this.isAccepted = false,
  });
}

class CopilotProvider extends ChangeNotifier {
  final List<Message> _messages = [];
  final List<CopilotProposal> _pendingProposals = [];
  bool _isGenerating = false;

  List<Message> get messages => _messages;
  List<CopilotProposal> get pendingProposals => _pendingProposals.where((p) => !p.isAccepted).toList();
  bool get isGenerating => _isGenerating;

  CopilotProvider() {
    _messages.add(Message(
      id: 'welcome',
      role: MessageRole.assistant,
      content: "Hello Arin! I am APEX, your personal intelligence copilot. Based on your logged energy profile and upcoming Google Workspace syncs, I can optimize your task queues, generate subtask outlines, or reschedule overloaded sessions. How can I help you today?",
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
    ));
  }

  Future<void> sendMessage(String userContent, TaskProvider taskProvider, CalendarProvider calendarProvider) async {
    if (userContent.trim().isEmpty) return;

    _messages.add(Message(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}-user',
      role: MessageRole.user,
      content: userContent,
      timestamp: DateTime.now(),
    ));
    _isGenerating = true;
    notifyListeners();

    // Simulate network delay to Groq backend
    await Future.delayed(const Duration(milliseconds: 1500));

    String assistantReply = '';
    final promptLower = userContent.toLowerCase();

    if (promptLower.contains('plan') || promptLower.contains('schedule') || promptLower.contains('optimize')) {
      assistantReply = "Based on your focus metrics and logged peak energy hours (9:00 AM - 12:00 PM), your current roadmap is highly achievable, but has two potential gaps.\n\n"
          "I have generated 2 specific adjustments to keep you at optimal cognitive load today:\n\n"
          "• [SUGGESTION:TASK|Review Partner Telemetry|Read and audit user retention metrics in the partner panel|high|45]\n"
          "• [SUGGESTION:EVENT|Q3 Retention Alignment Sync|14|60]\n\n"
          "Would you like to accept these recommendations? You can add them individually or sync both instantly in bulk using the header control above!";
    } else if (promptLower.contains('breakdown') || promptLower.contains('subtask')) {
      assistantReply = "I have reviewed your active task 'Refactor Authentication Provider Store'. To reduce cognitive friction, here is a structured breakdown:\n\n"
          "• [SUGGESTION:TASK|Refactor: Map Local Schemas|Configure new SharedPreferences adapters for offline-first support|medium|30]\n"
          "• [SUGGESTION:TASK|Refactor: Connect Token Refresh|Link secure token rotators and test edge cases|urgent|45]\n\n"
          "Tapping 'Accept All' will insert these subtasks into your active sprint lists immediately.";
    } else {
      assistantReply = "I understand. I am analyzing your workload context. To optimize your focus metrics today, I recommend scheduling a dedicated rest block:\n\n"
          "• [SUGGESTION:EVENT|Mindfulness Breathing Session|15|15]\n\n"
          "Let me know if you would like me to schedule this or perform a full calendar audit!";
    }

    _messages.add(Message(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}-assistant',
      role: MessageRole.assistant,
      content: assistantReply,
      timestamp: DateTime.now(),
    ));

    _parseProposals(assistantReply);
    _isGenerating = false;
    notifyListeners();
  }

  void _parseProposals(String content) {
    // Syntax matching: [SUGGESTION:TYPE|title|description|detail|duration]
    final regex = RegExp(r'\[SUGGESTION:(TASK|EVENT)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|(\d+)\]');
    final matches = regex.allMatches(content);

    for (final match in matches) {
      final type = match.group(1)!;
      final title = match.group(2)!;
      final description = match.group(3)!;
      final detail = match.group(4)!;
      final duration = int.parse(match.group(5)!);

      _pendingProposals.add(CopilotProposal(
        id: 'prop-${DateTime.now().millisecondsSinceEpoch}-${_pendingProposals.length}',
        type: type,
        title: title,
        description: description,
        detail: detail,
        durationMinutes: duration,
      ));
    }
  }

  void acceptProposal(String proposalId, TaskProvider taskProvider, CalendarProvider calendarProvider) {
    final index = _pendingProposals.indexWhere((p) => p.id == proposalId);
    if (index != -1) {
      final proposal = _pendingProposals[index];
      proposal.isAccepted = true;

      if (proposal.type == 'TASK') {
        final taskPriority = proposal.detail == 'low'
            ? TaskPriority.low
            : proposal.detail == 'high'
                ? TaskPriority.high
                : proposal.detail == 'urgent'
                    ? TaskPriority.urgent
                    : TaskPriority.medium;

        taskProvider.addTask(Task(
          id: 'task-ai-${DateTime.now().millisecondsSinceEpoch}',
          title: proposal.title,
          description: proposal.description,
          status: TaskStatus.todo,
          priority: taskPriority,
          estimatedMinutes: proposal.durationMinutes,
          tags: ['AI-Suggested'],
          subtasks: [],
          createdAt: DateTime.now(),
        ));
      } else if (proposal.type == 'EVENT') {
        final startHour = int.tryParse(proposal.detail) ?? 12;
        final now = DateTime.now();

        calendarProvider.addEvent(CalendarEvent(
          id: 'event-ai-${DateTime.now().millisecondsSinceEpoch}',
          title: proposal.title,
          description: proposal.description,
          startAt: DateTime(now.year, now.month, now.day, startHour, 0),
          endAt: DateTime(now.year, now.month, now.day, startHour, 0).add(Duration(minutes: proposal.durationMinutes)),
          attendees: ['Arin Dixit'],
          source: EventSource.internal,
        ));
      }
      notifyListeners();
    }
  }

  void acceptAllProposals(TaskProvider taskProvider, CalendarProvider calendarProvider) {
    final active = pendingProposals;
    for (final prop in active) {
      acceptProposal(prop.id, taskProvider, calendarProvider);
    }
  }
}
