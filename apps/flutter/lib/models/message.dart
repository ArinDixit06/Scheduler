enum MessageRole {
  user,
  assistant;

  String toJson() => name;
  static MessageRole fromJson(String value) =>
      MessageRole.values.firstWhere((e) => e.name == value, orElse: () => MessageRole.user);
}

class Message {
  String id;
  MessageRole role;
  String content;
  DateTime timestamp;

  Message({
    required this.id,
    required this.role,
    required this.content,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'role': role.toJson(),
        'content': content,
        'timestamp': timestamp.toIso8601String(),
      };

  factory Message.fromJson(Map<String, dynamic> json) => Message(
        id: json['id'] as String,
        role: MessageRole.fromJson(json['role'] as String? ?? 'user'),
        content: json['content'] as String? ?? '',
        timestamp: DateTime.parse(json['timestamp'] as String? ?? DateTime.now().toIso8601String()),
      );
}
