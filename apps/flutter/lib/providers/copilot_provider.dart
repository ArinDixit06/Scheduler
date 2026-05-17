import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/message.dart';
import '../models/task.dart';
import '../models/event.dart';
import 'task_provider.dart';
import 'calendar_provider.dart';
import 'auth_provider.dart';
import 'focus_provider.dart';

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

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'title': title,
        'description': description,
        'detail': detail,
        'durationMinutes': durationMinutes,
        'isAccepted': isAccepted,
      };

  factory CopilotProposal.fromJson(Map<String, dynamic> json) => CopilotProposal(
        id: json['id'] as String,
        type: json['type'] as String,
        title: json['title'] as String,
        description: json['description'] as String,
        detail: json['detail'] as String,
        durationMinutes: json['durationMinutes'] as int,
        isAccepted: json['isAccepted'] as bool? ?? false,
      );
}

class CopilotProvider extends ChangeNotifier {
  List<Message> _messages = [];
  List<CopilotProposal> _pendingProposals = [];
  bool _isGenerating = false;

  List<Message> get messages => _messages;
  List<CopilotProposal> get pendingProposals => _pendingProposals.where((p) => !p.isAccepted).toList();
  bool get isGenerating => _isGenerating;

  CopilotProvider() {
    _loadState();
  }

  // Load from local storage
  Future<void> _loadState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final messagesStr = prefs.getString('apex_messages');
      final proposalsStr = prefs.getString('apex_proposals');

      if (messagesStr != null) {
        final List decoded = json.decode(messagesStr);
        _messages = decoded.map((item) => Message.fromJson(item)).toList();
      } else {
        // Welcome message if first boot
        _messages.add(Message(
          id: 'welcome',
          role: MessageRole.assistant,
          content: "Hello Arin! I am APEX, your personal intelligence copilot. Based on your logged energy profile and upcoming Google Workspace syncs, I can optimize your task queues, generate subtask outlines, or reschedule overloaded sessions. How can I help you today?",
          timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        ));
      }

      if (proposalsStr != null) {
        final List decoded = json.decode(proposalsStr);
        _pendingProposals = decoded.map((item) => CopilotProposal.fromJson(item)).toList();
      }
      notifyListeners();
    } catch (e) {
      debugPrint("Error loading CopilotProvider state: $e");
    }
  }

  // Save to local storage
  Future<void> _saveState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final messagesJson = json.encode(_messages.map((m) => m.toJson()).toList());
      final proposalsJson = json.encode(_pendingProposals.map((p) => p.toJson()).toList());

      await prefs.setString('apex_messages', messagesJson);
      await prefs.setString('apex_proposals', proposalsJson);
    } catch (e) {
      debugPrint("Error saving CopilotProvider state: $e");
    }
  }

  Future<void> sendMessage(
    String userContent,
    TaskProvider taskProvider,
    CalendarProvider calendarProvider,
    AuthProvider authProvider,
    FocusProvider focusProvider,
  ) async {
    if (userContent.trim().isEmpty) return;

    _messages.add(Message(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}-user',
      role: MessageRole.user,
      content: userContent,
      timestamp: DateTime.now(),
    ));
    _isGenerating = true;
    notifyListeners();
    await _saveState();

    // 1. HARVEST RAG CONTEXT FROM APP
    final energy = authProvider.todayEnergyScore;
    final focusMins = focusProvider.totalMinutesCompleted;
    final focusBlocks = focusProvider.sessionsCompletedCount;

    final List<String> taskDescriptions = taskProvider.tasks.map((t) {
      return "- ${t.title} [Status: ${t.status.name}, Priority: ${t.priority.name}, Est: ${t.estimatedMinutes ?? 0}m]";
    }).toList();

    final List<String> eventDescriptions = calendarProvider.events.map((e) {
      return "- ${e.title} [From: ${e.startAt.hour}:${e.startAt.minute.toString().padLeft(2, '0')} to ${e.endAt.hour}:${e.endAt.minute.toString().padLeft(2, '0')}]";
    }).toList();

    final ragPromptContext = """
[SYSTEM RAG RETRIEVAL CONTEXT]
- Today's User Energy Score: $energy/5
- Completed Focus Stamina: $focusMins mins across $focusBlocks blocks today.
- Active Sprint Task Backlog:
${taskDescriptions.isEmpty ? "No active sprint tasks." : taskDescriptions.join('\n')}
- Scheduled Calendar Meetings:
${eventDescriptions.isEmpty ? "No calendar meetings scheduled today." : eventDescriptions.join('\n')}
""";

    String assistantReply = '';
    final apiKey = dotenv.env['GROQ_API_KEY'] ?? '';

    // 2. CONNECT TO GROQ REST API OR FALLBACK STABLE COMPILER
    if (apiKey.isNotEmpty && apiKey.startsWith("gsk_")) {
      try {
        final messagesPayload = [
          {
            "role": "system",
            "content": "You are APEX, a high-performance productivity intelligence copilot. Today's date is ${DateTime.now().toIso8601String().split('T')[0]}.\n\n$ragPromptContext\n\nINSTRUCTIONS:\nAnalyze the user's workload, energy profile, and agenda slots. Suggest helpful advice and scheduling recommendations.\nYou can output special structured suggestion cards using this double-bracket tag syntax:\n- To suggest a task: `• [SUGGESTION:TASK|title|description|priority|duration]` (priority can be low/medium/high/urgent, duration in minutes)\n- To suggest a calendar event: `• [SUGGESTION:EVENT|title|start_hour|duration_minutes]` (start_hour must be 24-hour format int like 14, duration in minutes)\nKeep suggestions extremely clean, practical, and highly relevant."
          },
          ..._messages.map((m) => {
            "role": m.role == MessageRole.assistant ? "assistant" : "user",
            "content": m.content
          }).toList()
        ];

        final response = await http.post(
          Uri.parse("https://api.groq.com/openai/v1/chat/completions"),
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer $apiKey",
          },
          body: json.encode({
            "model": "llama3-8b-8192",
            "messages": messagesPayload,
            "temperature": 0.3,
            "max_tokens": 1024,
          }),
        ).timeout(const Duration(seconds: 10));

        if (response.statusCode == 200) {
          final resData = json.decode(utf8.decode(response.bodyBytes));
          assistantReply = resData['choices'][0]['message']['content'] as String;
        } else {
          debugPrint("Groq API error status: ${response.statusCode}, body: ${response.body}");
          throw Exception("API Error");
        }
      } catch (e) {
        debugPrint("Groq connection failed, fallback to local RAG synthesis compiler: $e");
        assistantReply = _compileLocalRAGReply(userContent, taskProvider, calendarProvider, energy);
      }
    } else {
      // Direct Local RAG Synthesis Compiler
      await Future.delayed(const Duration(milliseconds: 1500));
      assistantReply = _compileLocalRAGReply(userContent, taskProvider, calendarProvider, energy);
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
    await _saveState();
  }

  // Local Context-Aware Synthesis Engine (RAG)
  String _compileLocalRAGReply(String userContent, TaskProvider taskProvider, CalendarProvider calendarProvider, int energy) {
    final promptLower = userContent.toLowerCase();

    if (promptLower.contains('plan') || promptLower.contains('schedule') || promptLower.contains('optimize')) {
      final taskCount = taskProvider.tasks.length;
      final energyStr = energy > 3 ? "optimal ($energy/5)" : "low ($energy/5)";

      return "Based on your focus metrics and logged $energyStr energy profile, I have audited your calendar agenda and identified key optimization slots.\n\n"
          "I have generated 2 specific context-aware recommendations:\n\n"
          "• [SUGGESTION:TASK|RAG Backlog Audit|Audit active $taskCount backlog items and complete top priority milestones|medium|30]\n"
          "• [SUGGESTION:EVENT|Sprint Priority Realignment|16|45]\n\n"
          "Would you like to accept these recommendations? Tapping 'Accept All' will insert these items directly into your local database.";
    } else if (promptLower.contains('breakdown') || promptLower.contains('subtask')) {
      final firstTaskTitle = taskProvider.tasks.isNotEmpty ? taskProvider.tasks.first.title : "Workspace Backlog";

      return "I have reviewed your active task '$firstTaskTitle'. To reduce cognitive friction and streamline execution, here is a structured subtask breakdown:\n\n"
          "• [SUGGESTION:TASK|Refactor Data Schema|Update secure SharedPreferences and load parameters|medium|30]\n"
          "• [SUGGESTION:TASK|Refactor API Integrations|Integrate Groq AI REST and local RAG fallback models|high|60]\n\n"
          "You can accept these subtasks to schedule them immediately.";
    } else {
      return "I understand. I am keeping a close eye on your workload and daily energy checks. To balance your focus stamina today, I suggest adding a rest block:\n\n"
          "• [SUGGESTION:EVENT|Recharge & Breathe Session|15|20]\n\n"
          "Let me know if you would like me to perform a detailed audit of your active tasks!";
    }
  }

  void _parseProposals(String content) {
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
    _saveState();
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
      _saveState();
    }
  }

  void acceptAllProposals(TaskProvider taskProvider, CalendarProvider calendarProvider) {
    final active = pendingProposals;
    for (final prop in active) {
      acceptProposal(prop.id, taskProvider, calendarProvider);
    }
  }

  // Clear chat log entirely
  Future<void> clearHistory() async {
    _messages.clear();
    _pendingProposals.clear();
    _messages.add(Message(
      id: 'welcome',
      role: MessageRole.assistant,
      content: "Hello Arin! I am APEX, your personal intelligence copilot. Based on your logged energy profile and upcoming Google Workspace syncs, I can optimize your task queues, generate subtask outlines, or reschedule overloaded sessions. How can I help you today?",
      timestamp: DateTime.now(),
    ));
    notifyListeners();
    await _saveState();
  }
}
