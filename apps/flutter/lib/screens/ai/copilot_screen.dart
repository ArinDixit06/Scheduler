import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../models/message.dart';
import '../../providers/copilot_provider.dart';
import '../../providers/task_provider.dart';
import '../../providers/calendar_provider.dart';
import '../../widgets/screen_shell.dart';

class CopilotScreen extends StatefulWidget {
  const CopilotScreen({Key? key}) : super(key: key);

  @override
  State<CopilotScreen> createState() => _CopilotScreenState();
}

class _CopilotScreenState extends State<CopilotScreen> {
  final _inputController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final query = _inputController.text.trim();
    if (query.isEmpty) return;

    final taskProvider = Provider.of<TaskProvider>(context, listen: false);
    final calendarProvider = Provider.of<CalendarProvider>(context, listen: false);
    Provider.of<CopilotProvider>(context, listen: false).sendMessage(query, taskProvider, calendarProvider);

    _inputController.clear();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _quickSend(String promptText) {
    _inputController.text = promptText;
    _sendMessage();
  }

  @override
  Widget build(BuildContext context) {
    final copilot = Provider.of<CopilotProvider>(context);
    final taskProvider = Provider.of<TaskProvider>(context);
    final calendarProvider = Provider.of<CalendarProvider>(context);

    return ScreenShell(
      title: 'APEX AI COPILOT',
      child: Column(
        children: [
          // 1. Proposals Bulk Header Bar
          if (copilot.pendingProposals.isNotEmpty)
            _buildProposalsBulkHeader(copilot, taskProvider, calendarProvider),

          // 2. Chat Log Messages Thread
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
              itemCount: copilot.messages.length + (copilot.isGenerating ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == copilot.messages.length) {
                  return _buildGeneratingBubble();
                }

                final message = copilot.messages[index];
                return _buildMessageBubble(message);
              },
            ),
          ),

          // 3. Structured Proposals List Cards
          if (copilot.pendingProposals.isNotEmpty)
            _buildProposalsCards(copilot, taskProvider, calendarProvider),

          // 4. Quick prompts carousel
          if (copilot.pendingProposals.isEmpty && !copilot.isGenerating) _buildQuickPromptsCarousel(),

          // 5. Input control bar
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildProposalsBulkHeader(
      CopilotProvider copilot, TaskProvider taskProvider, CalendarProvider calendarProvider) {
    final proposals = copilot.pendingProposals;

    return Container(
      color: AppTheme.electricBlue.withOpacity(0.05),
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              '${proposals.length} SCHEDULE RECOMMENDATIONS DETECTED',
              style: AppTheme.captionText.copyWith(
                color: AppTheme.electricBlue,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.0,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              copilot.acceptAllProposals(taskProvider, calendarProvider);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Successfully scheduled ${proposals.length} items in bulk!'),
                  backgroundColor: AppTheme.electricBlue,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.electricBlue,
              foregroundColor: AppTheme.pureWhite,
              shadowColor: Colors.transparent,
              elevation: 0.0,
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.space12, vertical: AppTheme.space4),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusButton),
              ),
            ),
            child: const Text('ACCEPT ALL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildGeneratingBubble() {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.space16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CircleAvatar(
            radius: 14.0,
            backgroundColor: AppTheme.carbonDark,
            child: Text('AI', style: TextStyle(color: AppTheme.pureWhite, fontSize: 10)),
          ),
          const SizedBox(width: AppTheme.space12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppTheme.space16, vertical: AppTheme.space12),
            decoration: BoxDecoration(
              color: AppTheme.lightAsh,
              borderRadius: BorderRadius.circular(AppTheme.radiusCard),
            ),
            child: Text(
              'APEX is calculating...',
              style: AppTheme.bodyRegular.copyWith(fontStyle: FontStyle.italic, color: AppTheme.pewter),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(dynamic message) {
    final isAssistant = message.role == MessageRole.assistant;

    // Clean suggestion syntax from displayed reply
    String cleanContent = message.content;
    cleanContent = cleanContent.replaceAll(RegExp(r'•\s*\[SUGGESTION:[^\]]+\]\n?'), '');
    cleanContent = cleanContent.replaceAll(RegExp(r'\[SUGGESTION:[^\]]+\]\n?'), '');

    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.space16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: isAssistant ? MainAxisAlignment.start : MainAxisAlignment.end,
        children: [
          if (isAssistant) ...[
            const CircleAvatar(
              radius: 14.0,
              backgroundColor: AppTheme.carbonDark,
              child: Text('AI', style: TextStyle(color: AppTheme.pureWhite, fontSize: 10)),
            ),
            const SizedBox(width: AppTheme.space12),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.space16, vertical: AppTheme.space12),
              decoration: BoxDecoration(
                color: isAssistant ? AppTheme.lightAsh : AppTheme.electricBlue,
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
              ),
              child: Text(
                cleanContent.trim(),
                style: AppTheme.bodyRegular.copyWith(
                  color: isAssistant ? AppTheme.carbonDark : AppTheme.pureWhite,
                ),
              ),
            ),
          ),
          if (!isAssistant) ...[
            const SizedBox(width: AppTheme.space12),
            const CircleAvatar(
              radius: 14.0,
              backgroundColor: AppTheme.electricBlue,
              child: Icon(Icons.person, color: AppTheme.pureWhite, size: 14),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildProposalsCards(
      CopilotProvider copilot, TaskProvider taskProvider, CalendarProvider calendarProvider) {
    final proposals = copilot.pendingProposals;

    return Container(
      height: 120,
      margin: const EdgeInsets.only(bottom: AppTheme.space8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24),
        itemCount: proposals.length,
        itemBuilder: (context, index) {
          final prop = proposals[index];
          final isTask = prop.type == 'TASK';

          return Container(
            width: 260,
            margin: const EdgeInsets.only(right: AppTheme.space12),
            decoration: BoxDecoration(
              color: AppTheme.pureWhite,
              border: Border.all(color: AppTheme.cloudGray, width: 1.5),
              borderRadius: BorderRadius.circular(AppTheme.radiusCard),
            ),
            padding: const EdgeInsets.all(AppTheme.space12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isTask ? 'SUGGESTED TASK' : 'SUGGESTED EVENT',
                      style: AppTheme.captionText.copyWith(
                        color: AppTheme.electricBlue,
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        copilot.acceptProposal(prop.id, taskProvider, calendarProvider);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.lightAsh,
                          borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                        ),
                        child: Text(
                          'ACCEPT',
                          style: AppTheme.captionText.copyWith(fontWeight: FontWeight.bold, color: AppTheme.carbonDark),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppTheme.space4),
                Text(
                  prop.title,
                  style: AppTheme.bodyMedium,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppTheme.space2),
                Text(
                  prop.description,
                  style: AppTheme.captionText,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildQuickPromptsCarousel() {
    final prompts = [
      'Plan my day schedule',
      'Analyze calendar bottlenecks',
      'Subtask breakdown for auth refactor',
    ];

    return Container(
      height: 36,
      margin: const EdgeInsets.only(bottom: AppTheme.space8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24),
        itemCount: prompts.length,
        itemBuilder: (context, index) {
          final p = prompts[index];
          return GestureDetector(
            onTap: () => _quickSend(p),
            child: Container(
              margin: const EdgeInsets.only(right: AppTheme.space8),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.cloudGray),
                borderRadius: BorderRadius.circular(AppTheme.radiusIndicator),
              ),
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.space12, vertical: AppTheme.space4),
              alignment: Alignment.center,
              child: Text(
                p,
                style: AppTheme.captionText.copyWith(color: AppTheme.carbonDark, fontWeight: FontWeight.w500),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildInputBar() {
    return Container(
      color: AppTheme.pureWhite,
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.space24, vertical: AppTheme.space12),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.lightAsh,
          borderRadius: BorderRadius.circular(AppTheme.radiusButton),
        ),
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.space16),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _inputController,
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  hintText: 'Ask APEX anything...',
                  hintStyle: TextStyle(color: AppTheme.silverFog),
                ),
                style: AppTheme.bodyRegular,
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.send_rounded, color: AppTheme.electricBlue),
              onPressed: _sendMessage,
            ),
          ],
        ),
      ),
    );
  }
}
