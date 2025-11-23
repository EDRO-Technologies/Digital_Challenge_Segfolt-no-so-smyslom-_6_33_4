import { writable } from "svelte/store";
import { scheduleApi, notificationsApi } from "./api";
import type { User, ScheduleEvent, NotificationSettings } from "./types";

// Инициализация из localStorage
const storedUser =
  typeof window !== "undefined" ? localStorage.getItem("admin-user") : null;
const initialUser = storedUser ? JSON.parse(storedUser) : null;

export const user = writable<User | null>(initialUser);
export const isAuthenticated = writable<boolean>(!!initialUser);
export const scheduleEvents = writable<ScheduleEvent[]>([]);
export const notificationSettings = writable<NotificationSettings>({
  enabled: true,
  channels: ["email"],
  schedule: "immediate",
  template: "Уведомление о занятии",
});

// Функции для работы с бэкендом
export async function loadScheduleFromBackend() {
  try {
    const events = await scheduleApi.getAll();
    // Преобразуем данные из бэкенда в наш формат
    const formattedEvents: ScheduleEvent[] = events.map((event) => ({
      id: event.id.toString(),
      title: event.title,
      type: event.type,
      instructor: event.instructor,
      participants: event.participants || [],
      startTime: event.startTime,
      endTime: event.endTime,
      duration: event.duration,
      date: event.date,
      description: event.description,
    }));
    scheduleEvents.set(formattedEvents);
  } catch (error) {
    console.error("Failed to load schedule:", error);
    // Можно показать уведомление об ошибке
  }
}

export async function initializeApp() {
  if (typeof window !== "undefined" && localStorage.getItem("admin-auth")) {
    try {
      await loadScheduleFromBackend();
    } catch (error) {
      console.error("Failed to initialize app:", error);
    }
  }
}
