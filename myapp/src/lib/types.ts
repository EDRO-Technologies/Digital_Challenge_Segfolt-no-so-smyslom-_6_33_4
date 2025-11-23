export interface User {
  id: string;
  username: string;
  role: "admin";
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: "lecture" | "seminar" | "pair";
  instructor: string;
  participants: string[];
  startTime: string;
  endTime: string;
  duration: number;
  date: string;
  description?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  channels: ("email" | "push")[];
  schedule: "immediate" | "daily" | "weekly";
  template: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  recipients: string[];
  sentAt?: string;
  status: "draft" | "sent" | "scheduled";
}
