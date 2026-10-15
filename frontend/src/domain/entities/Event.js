export class Event {
  constructor({
    id,
    title,
    description = '',
    date,
    startTime,
    endTime,
    category = 'other',
    priority = 'medium',
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;
    this.category = category;
    this.priority = priority;
  }

  static fromApi(json) {
    if (!json) return null;
    return new Event({
      id: json.id,
      title: json.title,
      description: json.description || '',
      date: json.date,
      startTime: json.startTime,
      endTime: json.endTime,
      category: json.category,
      priority: json.priority,
    });
  }

  get isUpcoming() {
    const now = new Date();
    const start = new Date(`${this.date}T${this.startTime || '00:00'}`);
    return start.getTime() >= now.getTime();
  }
}
