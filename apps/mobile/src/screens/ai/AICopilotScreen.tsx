import { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Animated,
  Vibration,
  Clipboard,
  Dimensions,
  LayoutAnimation
} from 'react-native';
import { usePlannerStore } from '../../store/plannerStore';
import { colors } from '../../constants/colors';
import { fetchGroqChatResponse, saveConversationHistory, loadConversationHistory } from '../../api/groq';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isCardSuggestion?: boolean;
  suggestionData?: {
    title: string;
    startAt: string;
    endAt: string;
    description: string;
    scheduled?: boolean;
  };
};

const QUICK_ACTIONS = [
  'Plan my week',
  'Review habits',
  'Schedule focus blocks',
  "What's due today"
];

export function AICopilotScreen() {
  const tasks = usePlannerStore((s) => s.tasks);
  const habits = usePlannerStore((s) => s.habits);
  const events = usePlannerStore((s) => s.events);
  const focusHistory = usePlannerStore((s) => s.focusHistory);
  const addEventStore = usePlannerStore((s) => s.addEvent);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // RAG Context Sources Toggles
  const [allowCalendar, setAllowCalendar] = useState(true);
  const [allowHabits, setAllowHabits] = useState(true);
  const [allowFocus, setAllowFocus] = useState(true);
  const [isContextSheetVisible, setIsContextSheetVisible] = useState(false);

  // Clear Conversation & Context Menu Dialogs
  const [isClearAlertVisible, setIsClearAlertVisible] = useState(false);
  const [isBubbleMenuVisible, setIsBubbleMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // Bouncing dots typing indicator states
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // Load chat history from storage on mount
  useEffect(() => {
    async function loadHistory() {
      const saved = await loadConversationHistory();
      if (saved && saved.length > 0) {
        setMessages(saved);
      } else {
        // Fallback welcoming message
        setMessages([
          {
            id: 'welcome_1',
            role: 'assistant',
            text: "Hello! I am your AI Copilot. I have live access to your tasks and habits. Tap 'Review habits' or ask me to schedule a deep work block!"
          }
        ]);
      }
    }
    loadHistory();
  }, []);

  // Save history on message list updates
  const updateMessages = (newMsgs: Message[]) => {
    setMessages(newMsgs);
    saveConversationHistory(newMsgs);
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Typing animation loops
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isTyping) {
      animation = Animated.loop(
        Animated.stagger(150, [
          Animated.sequence([
            Animated.timing(dot1, { toValue: 1.0, duration: 450, useNativeDriver: true }),
            Animated.timing(dot1, { toValue: 0.3, duration: 450, useNativeDriver: true })
          ]),
          Animated.sequence([
            Animated.timing(dot2, { toValue: 1.0, duration: 450, useNativeDriver: true }),
            Animated.timing(dot2, { toValue: 0.3, duration: 450, useNativeDriver: true })
          ]),
          Animated.sequence([
            Animated.timing(dot3, { toValue: 1.0, duration: 450, useNativeDriver: true }),
            Animated.timing(dot3, { toValue: 0.3, duration: 450, useNativeDriver: true })
          ])
        ])
      );
      animation.start();
    } else {
      dot1.setValue(0.3);
      dot2.setValue(0.3);
      dot3.setValue(0.3);
      if (animation) (animation as any).stop();
    }
    return () => {
      if (animation) (animation as any).stop();
    };
  }, [isTyping]);

  // Dynamic contextbadge label on top bar
  const contextBadgeText = useMemo(() => {
    const list = [];
    if (allowCalendar) list.push('Calendar');
    if (allowHabits) list.push('Habits');
    if (allowFocus) list.push('Focus');
    return list.length === 0 ? 'No Context' : `${list.join(', ')} context loaded`;
  }, [allowCalendar, allowHabits, allowFocus]);

  // Compiles limited state based on RAG toggles
  const getFilteredRAGState = () => {
    return {
      tasks: tasks,
      habits: allowHabits ? habits : [],
      events: allowCalendar ? events : [],
      focusHistory: allowFocus ? focusHistory : [],
      selectedDate: 'Today'
    };
  };

  // Card suggestion parser (looks for [SUGGESTION:EVENT] blocks)
  const parseResponseForCard = (rawText: string): Message => {
    const suggestionTag = '[SUGGESTION:EVENT]';
    const closeSuggestionTag = '[/SUGGESTION]';

    if (rawText.includes(suggestionTag) && rawText.includes(closeSuggestionTag)) {
      const parts = rawText.split(suggestionTag);
      const preText = parts[0].trim();
      const nextParts = parts[1].split(closeSuggestionTag);
      const jsonContent = nextParts[0].trim();
      
      try {
        const data = JSON.parse(jsonContent);
        return {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          text: preText,
          isCardSuggestion: true,
          suggestionData: {
            title: data.title || 'AI Focus Block',
            startAt: data.startAt || '12:00',
            endAt: data.endAt || '13:00',
            description: data.description || 'Recommended focus slot',
            scheduled: false
          }
        };
      } catch (err) {
        console.error('Failed to parse suggestion JSON:', err);
      }
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      text: rawText
    };
  };

  // Send message dispatches to Groq API
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    Vibration.vibrate(8);

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: text.trim()
    };

    const updatedHistory = [...messages, userMsg];
    updateMessages(updatedHistory);
    setInputText('');
    setIsTyping(true);

    // Call Groq API helper
    const apiHistory = updatedHistory.map(m => ({
      role: m.role,
      content: m.text
    }));

    const response = await fetchGroqChatResponse(apiHistory, getFilteredRAGState());

    setIsTyping(false);
    
    // Parse response
    const parsedMsg = parseResponseForCard(response);
    updateMessages([...updatedHistory, parsedMsg]);
    Vibration.vibrate(10);
  };

  // Trigger quick suggestion chip click
  const handleTapChip = (phrase: string) => {
    handleSendMessage(phrase);
  };

  // Accept/Add Event to calendar
  const handleAcceptSuggestion = (msgId: string, eventData: any) => {
    Vibration.vibrate([0, 15, 30]); // success chime vibration
    addEventStore(eventData.title, eventData.startAt, eventData.endAt, 'INTERNAL');

    // Update message card state to "Scheduled"
    setMessages(prev =>
      prev.map(m => {
        if (m.id !== msgId) return m;
        return {
          ...m,
          suggestionData: {
            ...m.suggestionData!,
            scheduled: true
          }
        };
      })
    );
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  // Clear Conversation dialog
  const handleClearConversation = () => {
    Vibration.vibrate(20);
    setIsClearAlertVisible(false);
    updateMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        text: 'Conversation cleared. How can I help support your productivity today?'
      }
    ]);
  };

  // Copy or Delete single messages
  const handleLongPressBubble = (msg: Message) => {
    Vibration.vibrate(25);
    setSelectedMessage(msg);
    setIsBubbleMenuVisible(true);
  };

  const handleCopyMessage = () => {
    if (selectedMessage) {
      Clipboard.setString(selectedMessage.text);
      Vibration.vibrate(5);
    }
    setIsBubbleMenuVisible(false);
  };

  const handleDeleteMessage = () => {
    if (selectedMessage) {
      updateMessages(messages.filter(m => m.id !== selectedMessage.id));
    }
    setIsBubbleMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.titleText}>AI Copilot</Text>
          <Text style={styles.badgeText}>{contextBadgeText}</Text>
        </View>
        <View style={styles.topBarRight}>
          <Pressable
            onPress={() => setIsClearAlertVisible(true)}
            style={styles.menuIconCell}
            android_ripple={{ color: colors.border }}
          >
            <Text style={styles.menuIcon}>🗑️</Text>
          </Pressable>
        </View>
      </View>

      {/* 2. Scrollable chat message thread */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatScrollContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isUser ? styles.messageRowUser : styles.messageRowAssistant
              ]}
            >
              {/* Avatar for assistant */}
              {!isUser && (
                <View style={styles.avatarCell}>
                  <Text style={styles.avatarText}>🤖</Text>
                </View>
              )}

              <View style={styles.bubbleWrapper}>
                <Pressable
                  onLongPress={() => handleLongPressBubble(msg)}
                  style={[
                    styles.chatBubble,
                    isUser ? styles.chatBubbleUser : styles.chatBubbleAssistant
                  ]}
                >
                  <Text style={[styles.chatText, isUser ? styles.chatTextUser : styles.chatTextAssistant]}>
                    {msg.text}
                  </Text>
                </Pressable>

                {/* Structured Event recommendation Card reply inside bubble wrapper */}
                {msg.isCardSuggestion && msg.suggestionData && (
                  <View style={styles.cardReplyContainer}>
                    <View style={styles.cardIndicatorLine} />
                    <View style={styles.cardReplyBody}>
                      <Text style={styles.cardReplyTitle}>{msg.suggestionData.title}</Text>
                      
                      <View style={styles.cardTimeRow}>
                        <Text style={styles.cardTimeText}>⏱️ {msg.suggestionData.startAt} – {msg.suggestionData.endAt}</Text>
                      </View>

                      {msg.suggestionData.description ? (
                        <Text style={styles.cardDescText}>{msg.suggestionData.description}</Text>
                      ) : null}

                      {/* Accept/Add button */}
                      <Pressable
                        disabled={msg.suggestionData.scheduled}
                        onPress={() => handleAcceptSuggestion(msg.id, msg.suggestionData)}
                        style={[
                          styles.cardAcceptButton,
                          msg.suggestionData.scheduled && styles.cardAcceptButtonDisabled
                        ]}
                      >
                        <Text style={[
                          styles.cardAcceptButtonText,
                          msg.suggestionData.scheduled && styles.cardAcceptButtonTextDisabled
                        ]}>
                          {msg.suggestionData.scheduled ? 'Scheduled ✓' : 'Add to Calendar / Accept'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* 3B. Animated typing indicator bubbles */}
        {isTyping && (
          <View style={[styles.messageRow, styles.messageRowAssistant]}>
            <View style={styles.avatarCell}>
              <Text style={styles.avatarText}>🤖</Text>
            </View>
            <View style={[styles.chatBubble, styles.chatBubbleAssistant, styles.typingBubble]}>
              <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
              <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
              <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* 3. Suggestion action chips (Scrollable row) */}
      <View style={styles.suggestionChipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionChipsScroll}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action}
              onPress={() => handleTapChip(action)}
              style={styles.suggestionChipPill}
              android_ripple={{ color: colors.border }}
            >
              <Text style={styles.suggestionChipText}>{action}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* 4. Bottom Input Bar */}
      <View style={styles.inputBar}>
        {/* Context Toggles Picker sheet trigger button */}
        <Pressable
          onPress={() => setIsContextSheetVisible(true)}
          style={styles.contextPickerButton}
          android_ripple={{ color: colors.border }}
        >
          <Text style={styles.contextPickerIcon}>⚙️</Text>
        </Pressable>

        {/* TextInput multiline */}
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask Copilot anything..."
          placeholderTextColor={colors.textLight}
          multiline
          style={styles.chatTextInput}
        />

        {/* Send Button */}
        <Pressable
          disabled={!inputText.trim()}
          onPress={() => handleSendMessage(inputText)}
          style={[
            styles.sendButtonCircle,
            inputText.trim() && styles.sendButtonCircleActive
          ]}
        >
          <Text style={[styles.sendIcon, inputText.trim() && styles.sendIconActive]}>➔</Text>
        </Pressable>
      </View>

      {/* RAG Context Sources Picker sheet */}
      <Modal
        visible={isContextSheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsContextSheetVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetDismissArea} onPress={() => setIsContextSheetVisible(false)} />
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Data Context Scope</Text>
            <Text style={styles.sheetDesc}>
              Control which local application assets Scheduler Copilot has access to for RAG context queries.
            </Text>

            {/* Toggle 1 - Calendar */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleTitle}>Calendar Events</Text>
                <Text style={styles.toggleSub}>Allows the AI to check your daily time slots.</Text>
              </View>
              <Pressable
                onPress={() => setAllowCalendar(!allowCalendar)}
                style={[styles.toggleSwitch, allowCalendar && styles.toggleSwitchActive]}
              >
                <View style={[styles.toggleThumb, allowCalendar && styles.toggleThumbActive]} />
              </Pressable>
            </View>

            {/* Toggle 2 - Habits */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleTitle}>Habits Tracker</Text>
                <Text style={styles.toggleSub}>Allows the AI to check streak continuity records.</Text>
              </View>
              <Pressable
                onPress={() => setAllowHabits(!allowHabits)}
                style={[styles.toggleSwitch, allowHabits && styles.toggleSwitchActive]}
              >
                <View style={[styles.toggleThumb, allowHabits && styles.toggleThumbActive]} />
              </Pressable>
            </View>

            {/* Toggle 3 - Focus */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleTitle}>Focus sessions history</Text>
                <Text style={styles.toggleSub}>Allows the AI to check focus minutes stats.</Text>
              </View>
              <Pressable
                onPress={() => setAllowFocus(!allowFocus)}
                style={[styles.toggleSwitch, allowFocus && styles.toggleSwitchActive]}
              >
                <View style={[styles.toggleThumb, allowFocus && styles.toggleThumbActive]} />
              </Pressable>
            </View>

            {/* Footer warning */}
            <View style={styles.sheetFooterBox}>
              <Text style={styles.sheetFooterText}>
                ⚠️ Note: Toggling off sources blocks the AI from seeing those entities in planning recommendations.
              </Text>
            </View>

            {/* Dismiss Button */}
            <Pressable
              onPress={() => setIsContextSheetVisible(false)}
              style={styles.sheetDismissButton}
            >
              <Text style={styles.sheetDismissText}>Confirm Scope</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Clear conversation confirmation modal */}
      <Modal
        visible={isClearAlertVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsClearAlertVisible(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Clear conversation?</Text>
            <Text style={styles.alertDesc}>
              This action is irreversible and deletes your full chat history log.
            </Text>
            <View style={styles.alertButtonsRow}>
              <Pressable onPress={() => setIsClearAlertVisible(false)} style={styles.alertButton}>
                <Text style={styles.alertButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleClearConversation} style={[styles.alertButton, styles.alertButtonDestructive]}>
                <Text style={[styles.alertButtonText, styles.alertButtonTextDestructive]}>Clear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bubble Long Press Context Menu */}
      <Modal
        visible={isBubbleMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsBubbleMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setIsBubbleMenuVisible(false)}>
          <View style={styles.menuContent}>
            <Text style={styles.menuHeader}>Message Options</Text>
            
            <Pressable onPress={handleCopyMessage} style={styles.menuOption}>
              <Text style={styles.menuOptionText}>📋 Copy Text</Text>
            </Pressable>

            {selectedMessage?.role === 'assistant' && (
              <Pressable
                onPress={() => {
                  setIsBubbleMenuVisible(false);
                  if (selectedMessage) handleSendMessage(selectedMessage.text); // Simulated regeneration
                }}
                style={styles.menuOption}
              >
                <Text style={styles.menuOptionText}>🔄 Regenerate Response</Text>
              </Pressable>
            )}

            <View style={styles.menuDivider} />

            <Pressable onPress={handleDeleteMessage} style={styles.menuOption}>
              <Text style={[styles.menuOptionText, styles.menuOptionTextDanger]}>
                🗑️ Delete Message
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  topBarLeft: {
    gap: 4
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  badgeText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600'
  },
  menuIconCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuIcon: {
    fontSize: 16
  },
  chatScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start'
  },
  messageRowUser: {
    justifyContent: 'flex-end'
  },
  messageRowAssistant: {
    justifyContent: 'flex-start'
  },
  avatarCell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2
  },
  avatarText: {
    fontSize: 16
  },
  bubbleWrapper: {
    maxWidth: '80%',
    gap: 8
  },
  chatBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  chatBubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end'
  },
  chatBubbleAssistant: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start'
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20
  },
  chatTextUser: {
    color: colors.white
  },
  chatTextAssistant: {
    color: colors.textPrimary
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textLight
  },

  // Structured event card inside bubble wrapper styles
  cardReplyContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  cardIndicatorLine: {
    width: 4,
    backgroundColor: colors.success
  },
  cardReplyBody: {
    flex: 1,
    padding: 14,
    gap: 6
  },
  cardReplyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  cardTimeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSubdued
  },
  cardDescText: {
    fontSize: 11,
    color: colors.textLight,
    lineHeight: 15
  },
  cardAcceptButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4
  },
  cardAcceptButtonDisabled: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardAcceptButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600'
  },
  cardAcceptButtonTextDisabled: {
    color: colors.textLight
  },

  // Suggestion action chips
  suggestionChipsContainer: {
    backgroundColor: colors.transparent,
    paddingVertical: 8
  },
  suggestionChipsScroll: {
    paddingHorizontal: 20,
    gap: 8
  },
  suggestionChipPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  suggestionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSubdued
  },

  // Bottom Input Bar styles
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  contextPickerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  contextPickerIcon: {
    fontSize: 16
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10
  },
  sendButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonCircleActive: {
    backgroundColor: colors.primary
  },
  sendIcon: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 18
  },
  sendIconActive: {
    color: colors.white
  },

  // Sheet overlay styles
  sheetOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end'
  },
  sheetDismissArea: {
    flex: 1
  },
  sheetContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 40,
    maxHeight: '80%'
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6
  },
  sheetDesc: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
    marginBottom: 20
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: 20
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  toggleSub: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center'
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  toggleThumbActive: {
    alignSelf: 'flex-end'
  },
  sheetFooterBox: {
    backgroundColor: colors.warningLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    marginBottom: 20
  },
  sheetFooterText: {
    fontSize: 11,
    color: colors.warning,
    lineHeight: 16,
    fontWeight: '600'
  },
  sheetDismissButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center'
  },
  sheetDismissText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600'
  },

  // Alert overlay
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertBox: {
    width: 280,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  alertDesc: {
    fontSize: 13,
    color: colors.textSubdued,
    textAlign: 'center',
    lineHeight: 18
  },
  alertButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  alertButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  alertButtonDestructive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger
  },
  alertButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSubdued
  },
  alertButtonTextDestructive: {
    color: colors.white
  },

  // Bubble Long Press Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuContent: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6
  },
  menuHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  menuOption: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  menuOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary
  },
  menuOptionTextDanger: {
    color: colors.danger
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border
  }
});
