enum EventSource {
  internal,
  google;

  String toJson() => name;
  static EventSource fromJson(String value) =>
      EventSource.values.firstWhere((e) => e.name == value, orElse: () => EventSource.internal);
}

class CalendarEvent {
  String id;
  String title;
  String description;
  DateTime startAt;
  DateTime endAt;
  bool allDay;
  String? location;
  String? meetingUrl;
  List<String> attendees;
  EventSource source;

  CalendarEvent({
    required this.id,
    required this.title,
    this.description = '',
    required this.startAt,
    required this.endAt,
    this.allDay = false,
    this.location,
    this.meetingUrl,
    required this.attendees,
    this.source = EventSource.internal,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'startAt': startAt.toIso8601String(),
        'endAt': endAt.toIso8601String(),
        'allDay': allDay,
        'location': location,
        'meetingUrl': meetingUrl,
        'attendees': attendees,
        'source': source.toJson(),
      };

  factory CalendarEvent.fromJson(Map<String, dynamic> json) => CalendarEvent(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String? ?? '',
        startAt: DateTime.parse(json['startAt'] as String),
        endAt: DateTime.parse(json['endAt'] as String),
        allDay: json['allDay'] as bool? ?? false,
        location: json['location'] as String?,
        meetingUrl: json['meetingUrl'] as String?,
        attendees: List<String>.from(json['attendees'] as List? ?? []),
        source: EventSource.fromJson(json['source'] as String? ?? 'internal'),
      );
}
