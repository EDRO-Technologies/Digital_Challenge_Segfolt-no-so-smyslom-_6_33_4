<script lang="ts">
  import { notificationSettings, scheduleEvents } from "$lib/stores";
  import type {
    Notification,
    NotificationSettings,
    ScheduleEvent,
  } from "$lib/types";

  // Хранилище уведомлений
  let notifications = $state<Notification[]>([]);

  // Форма нового уведомления
  let newNotification = $state({
    title: "",
    message: "",
    recipients: [] as string[],
    schedule: "immediate" as "immediate" | "scheduled",
    scheduledDate: "",
    scheduledTime: "",
  });

  // Временные данные для демонстрации
  let allUsers = $state([
    "Иван Иванов",
    "Мария Петрова",
    "Петр Сидоров",
    "Анна Козлова",
    "Сергей Смирнов",
    "Ольга Новикова",
  ]);

  let selectedTemplate = $state("default");
  let showPreview = $state(false);
  let isSending = $state(false);

  // Шаблоны уведомлений
  const templates = {
    default: {
      title: "Уведомление о занятии",
      message: "Уважаемый участник, напоминаем о предстоящем занятии.",
    },
    reminder: {
      title: "Напоминание о занятии",
      message:
        "Напоминаем, что завтра у вас запланировано занятие. Не забудьте подготовиться.",
    },
    cancellation: {
      title: "Отмена занятия",
      message:
        "К сожалению, занятие отменяется. О новой дате сообщим дополнительно.",
    },
    change: {
      title: "Изменение в расписании",
      message:
        "В расписании произошли изменения. Пожалуйста, проверьте актуальное расписание.",
    },
  };

  // Просто используем store через $scheduleEvents
  let upcomingEvents = $derived(
    $scheduleEvents
      .filter((event) => {
        const eventDate = new Date(event.date);
        const today = new Date();
        return eventDate >= today;
      })
      .slice(0, 5)
  );
  // Добавить получателей из занятия
  function addRecipientsFromEvent(event: ScheduleEvent) {
    const newRecipients = [
      ...new Set([...newNotification.recipients, ...event.participants]),
    ];
    newNotification.recipients = newRecipients;

    // Автозаполнение сообщения
    if (!newNotification.title) {
      newNotification.title = `Напоминание: ${event.title}`;
    }
    if (!newNotification.message) {
      newNotification.message = `Уважаемые участники, напоминаем о занятии "${event.title}" которое состоится ${new Date(event.date).toLocaleDateString("ru-RU")} в ${event.startTime}. Преподаватель: ${event.instructor}.`;
    }
  }

  // Применить шаблон
  function applyTemplate() {
    const template = templates[selectedTemplate as keyof typeof templates];
    if (template) {
      newNotification.title = template.title;
      newNotification.message = template.message;
    }
  }

  // Добавить/удалить получателя
  function toggleRecipient(user: string) {
    if (newNotification.recipients.includes(user)) {
      newNotification.recipients = newNotification.recipients.filter(
        (u) => u !== user
      );
    } else {
      newNotification.recipients = [...newNotification.recipients, user];
    }
  }

  // Выбрать всех получателей
  function selectAllRecipients() {
    newNotification.recipients = [...allUsers];
  }

  // Очистить получателей
  function clearRecipients() {
    newNotification.recipients = [];
  }

  // Отправить уведомление
  async function sendNotification() {
    if (
      !newNotification.title ||
      !newNotification.message ||
      newNotification.recipients.length === 0
    ) {
      alert("Заполните все обязательные поля и выберите получателей");
      return;
    }

    isSending = true;

    // Имитация отправки
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const notification: Notification = {
      id: Date.now().toString(),
      title: newNotification.title,
      message: newNotification.message,
      recipients: newNotification.recipients,
      sentAt: new Date().toISOString(),
      status: "sent",
    };

    notifications = [notification, ...notifications];

    // Сброс формы
    resetForm();
    isSending = false;

    alert("Уведомление успешно отправлено!");
  }

  // Запланировать уведомление
  async function scheduleNotification() {
    if (
      !newNotification.title ||
      !newNotification.message ||
      newNotification.recipients.length === 0
    ) {
      alert("Заполните все обязательные поля и выберите получателей");
      return;
    }

    if (!newNotification.scheduledDate || !newNotification.scheduledTime) {
      alert("Укажите дату и время отправки");
      return;
    }

    isSending = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const notification: Notification = {
      id: Date.now().toString(),
      title: newNotification.title,
      message: newNotification.message,
      recipients: newNotification.recipients,
      status: "scheduled",
    };

    notifications = [notification, ...notifications];
    resetForm();
    isSending = false;

    alert("Уведомление запланировано!");
  }

  // Отменить запланированное уведомление
  function cancelScheduledNotification(notification: Notification) {
    notifications = notifications.filter((n) => n.id !== notification.id);
    alert("Уведомление отменено");
  }

  // Сброс формы
  function resetForm() {
    newNotification = {
      title: "",
      message: "",
      recipients: [],
      schedule: "immediate",
      scheduledDate: "",
      scheduledTime: "",
    };
    selectedTemplate = "default";
  }

  // Получить статус уведомления
  function getNotificationStatus(notification: Notification) {
    switch (notification.status) {
      case "sent":
        return { text: "Отправлено", class: "sent", icon: "✅" };
      case "scheduled":
        return { text: "Запланировано", class: "scheduled", icon: "⏰" };
      case "draft":
        return { text: "Черновик", class: "draft", icon: "📝" };
      default:
        return { text: "Неизвестно", class: "unknown", icon: "❓" };
    }
  }

  // Форматирование даты
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("ru-RU");
  }
</script>

<div class="notifications-page">
  <header class="page-header">
    <h1>Управление уведомлениями</h1>
    <div class="header-stats">
      <span class="stat"
        >Отправлено: {notifications.filter((n) => n.status === "sent")
          .length}</span
      >
      <span class="stat"
        >Запланировано: {notifications.filter((n) => n.status === "scheduled")
          .length}</span
      >
    </div>
  </header>

  <div class="notifications-layout">
    <!-- Левая колонка: Настройки и форма -->
    <div class="left-column">
      <!-- Настройки уведомлений -->
      <div class="settings-card">
        <h2>⚙️ Настройки уведомлений</h2>

        <div class="setting-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              bind:checked={$notificationSettings.enabled}
            />
            <span class="checkmark"></span>
            Включить систему уведомлений
          </label>
        </div>

        <div class="setting-group">
          <label>Каналы отправки:</label>
          <div class="channels-grid">
            <label class="checkbox-label">
              <input
                type="checkbox"
                bind:group={$notificationSettings.channels}
                value="push"
              />
              <span class="checkmark"></span>
              📧 Email
            </label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                bind:group={$notificationSettings.channels}
                value="push"
              />
              <span class="checkmark"></span>
              📱 Push-уведомления
            </label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                bind:group={$notificationSettings.channels}
                value="sms"
              />
              <span class="checkmark"></span>
              💬 SMS
            </label>
          </div>
        </div>

        <div class="setting-group">
          <label>Расписание отправки:</label>
          <select bind:value={$notificationSettings.schedule}>
            <option value="immediate">Немедленно</option>
            <option value="daily">Ежедневно в 09:00</option>
            <option value="weekly">Еженедельно (понедельник)</option>
          </select>
        </div>

        <div class="setting-group">
          <label>Шаблон уведомления по умолчанию:</label>
          <textarea
            bind:value={$notificationSettings.template}
            rows="3"
            placeholder="Шаблон текста уведомления..."
          ></textarea>
        </div>
      </div>

      <!-- Форма отправки уведомления -->
      <div class="send-card">
        <h2>📤 Отправить уведомление</h2>

        <div class="form-section">
          <label class="form-label">Шаблон:</label>
          <select bind:value={selectedTemplate} on:change={applyTemplate}>
            <option value="default">Стандартный</option>
            <option value="reminder">Напоминание</option>
            <option value="cancellation">Отмена занятия</option>
            <option value="change">Изменение расписания</option>
            <option value="custom">Свой текст</option>
          </select>
        </div>

        <div class="form-section">
          <label class="form-label">Заголовок:</label>
          <input
            type="text"
            bind:value={newNotification.title}
            placeholder="Введите заголовок уведомления"
            class="form-input"
          />
        </div>

        <div class="form-section">
          <label class="form-label">Сообщение:</label>
          <textarea
            bind:value={newNotification.message}
            rows="4"
            placeholder="Введите текст уведомления"
            class="form-textarea"
          ></textarea>
        </div>

        <!-- Быстрый выбор из занятий -->
        <div class="form-section">
          <label class="form-label">Быстрый выбор из занятий:</label>
          <div class="events-quick-select">
            {#each upcomingEvents as event}
              <button
                type="button"
                on:click={() => addRecipientsFromEvent(event)}
                class="event-quick-btn"
              >
                <span class="event-title">{event.title}</span>
                <span class="event-date">
                  {new Date(event.date).toLocaleDateString("ru-RU")}
                  {event.startTime}
                </span>
                <span class="event-participants"
                  >{event.participants.length} участ.</span
                >
              </button>
            {/each}
          </div>
        </div>

        <!-- Выбор получателей -->
        <div class="form-section">
          <div class="recipients-header">
            <label class="form-label">Получатели:</label>
            <div class="recipients-actions">
              <button
                type="button"
                on:click={selectAllRecipients}
                class="btn-small">Выбрать всех</button
              >
              <button type="button" on:click={clearRecipients} class="btn-small"
                >Очистить</button
              >
            </div>
          </div>

          <div class="recipients-grid">
            {#each allUsers as user}
              <label class="recipient-checkbox">
                <input
                  type="checkbox"
                  checked={newNotification.recipients.includes(user)}
                  on:change={() => toggleRecipient(user)}
                />
                <span class="checkmark"></span>
                <span class="recipient-name">{user}</span>
              </label>
            {/each}
          </div>

          <div class="selected-count">
            Выбрано: {newNotification.recipients.length} получателей
          </div>
        </div>

        <!-- Настройка отправки -->
        <div class="form-section">
          <label class="form-label">Время отправки:</label>
          <div class="schedule-options">
            <label class="radio-label">
              <input
                type="radio"
                value="immediate"
                bind:group={newNotification.schedule}
              />
              <span class="radiomark"></span>
              Немедленно
            </label>

            <label class="radio-label">
              <input
                type="radio"
                value="scheduled"
                bind:group={newNotification.schedule}
              />
              <span class="radiomark"></span>
              Запланировать
            </label>
          </div>

          {#if newNotification.schedule === "scheduled"}
            <div class="schedule-datetime">
              <input
                type="date"
                bind:value={newNotification.scheduledDate}
                class="form-input"
              />
              <input
                type="time"
                bind:value={newNotification.scheduledTime}
                class="form-input"
              />
            </div>
          {/if}
        </div>

        <!-- Действия -->
        <div class="form-actions">
          <button
            type="button"
            on:click={() => (showPreview = true)}
            class="btn-secondary"
            disabled={isSending}
          >
            👁️ Предпросмотр
          </button>

          {#if newNotification.schedule === "immediate"}
            <button
              type="button"
              on:click={sendNotification}
              class="btn-primary"
              disabled={isSending}
            >
              {#if isSending}
                <span class="spinner"></span>
                Отправка...
              {:else}
                📤 Отправить сейчас
              {/if}
            </button>
          {:else}
            <button
              type="button"
              on:click={scheduleNotification}
              class="btn-primary"
              disabled={isSending}
            >
              {#if isSending}
                <span class="spinner"></span>
                Планирование...
              {:else}
                ⏰ Запланировать
              {/if}
            </button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Правая колонка: История уведомлений -->
    <div class="right-column">
      <div class="history-card">
        <h2>📋 История уведомлений</h2>

        {#if notifications.length === 0}
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <p>Нет отправленных уведомлений</p>
          </div>
        {:else}
          <div class="notifications-list">
            {#each notifications as notification}
              <div
                class="notification-item {getNotificationStatus(notification)
                  .class}"
              >
                <div class="notification-header">
                  <h4>{notification.title}</h4>
                  <div class="notification-meta">
                    <span
                      class="status {getNotificationStatus(notification).class}"
                    >
                      {getNotificationStatus(notification).icon}
                      {getNotificationStatus(notification).text}
                    </span>
                    {#if notification.sentAt}
                      <span class="sent-date"
                        >{formatDate(notification.sentAt)}</span
                      >
                    {/if}
                  </div>
                </div>

                <p class="notification-message">{notification.message}</p>

                <div class="notification-footer">
                  <div class="recipients-count">
                    📧 {notification.recipients.length} получателей
                  </div>

                  {#if notification.status === "scheduled"}
                    <button
                      on:click={() => cancelScheduledNotification(notification)}
                      class="btn-danger btn-small"
                    >
                      Отменить
                    </button>
                  {/if}
                </div>

                <div class="recipients-list">
                  {#each notification.recipients.slice(0, 3) as recipient}
                    <span class="recipient-tag">{recipient}</span>
                  {/each}
                  {#if notification.recipients.length > 3}
                    <span class="recipient-more"
                      >+{notification.recipients.length - 3}</span
                    >
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Модальное окно предпросмотра -->
  {#if showPreview}
    <div class="modal-overlay" on:click={() => (showPreview = false)}>
      <div class="modal" on:click|stopPropagation>
        <div class="modal-header">
          <h2>Предпросмотр уведомления</h2>
          <button on:click={() => (showPreview = false)} class="close-btn"
            >×</button
          >
        </div>

        <div class="preview-content">
          <div class="preview-notification">
            <h3>{newNotification.title || "Заголовок уведомления"}</h3>
            <p>{newNotification.message || "Текст уведомления..."}</p>
            <div class="preview-meta">
              <strong>Получатели:</strong>
              {newNotification.recipients.length} человек
            </div>
            {#if newNotification.schedule === "scheduled"}
              <div class="preview-meta">
                <strong>Запланировано на:</strong>
                {newNotification.scheduledDate}
                {newNotification.scheduledTime}
              </div>
            {:else}
              <div class="preview-meta">
                <strong>Отправка:</strong> Немедленно
              </div>
            {/if}
          </div>
        </div>

        <div class="modal-actions">
          <button on:click={() => (showPreview = false)} class="btn-secondary"
            >Закрыть</button
          >
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .notifications-page {
    padding: 1rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .header-stats {
    display: flex;
    gap: 2rem;
  }

  .stat {
    background: white;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    font-weight: 500;
    color: var(--gray-700);
  }

  /* Основной layout */
  .notifications-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    align-items: start;
  }

  /* Карточки */
  .settings-card,
  .send-card,
  .history-card {
    background: white;
    padding: 2rem;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    margin-bottom: 2rem;
  }

  .settings-card h2,
  .send-card h2,
  .history-card h2 {
    margin-bottom: 1.5rem;
    color: var(--gray-800);
    border-bottom: 2px solid var(--gray-200);
    padding-bottom: 0.5rem;
  }

  /* Настройки */
  .setting-group {
    margin-bottom: 1.5rem;
  }

  .setting-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--gray-800);
  }

  .channels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 0.5rem;
  }

  /* Форма */
  .form-section {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--gray-800);
  }

  .form-input,
  .form-textarea,
  select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid var(--gray-300);
    border-radius: var(--radius);
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }

  .form-input:focus,
  .form-textarea:focus,
  select:focus {
    outline: none;
    border-color: var(--primary-blue);
  }

  /* Быстрый выбор занятий */
  .events-quick-select {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .event-quick-btn {
    background: var(--gray-100);
    border: 2px solid var(--gray-300);
    border-radius: var(--radius);
    padding: 0.75rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .event-quick-btn:hover {
    border-color: var(--primary-blue);
    background: var(--sky-blue);
  }

  .event-title {
    display: block;
    font-weight: 500;
    color: var(--gray-800);
  }

  .event-date,
  .event-participants {
    font-size: 0.875rem;
    color: var(--gray-600);
  }

  /* Получатели */
  .recipients-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .recipients-actions {
    display: flex;
    gap: 0.5rem;
  }

  .recipients-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    max-height: 200px;
    overflow-y: auto;
    padding: 1rem;
    background: var(--gray-50);
    border-radius: var(--radius);
    margin-bottom: 1rem;
  }

  .recipient-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .selected-count {
    text-align: center;
    color: var(--gray-600);
    font-size: 0.875rem;
  }

  /* Чекбоксы и радиокнопки */
  .checkbox-label,
  .radio-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: normal;
  }

  .checkmark,
  .radiomark {
    width: 18px;
    height: 18px;
    border: 2px solid var(--gray-300);
    border-radius: 4px;
    display: inline-block;
    position: relative;
  }

  .radiomark {
    border-radius: 50%;
  }

  .checkbox-label input:checked + .checkmark {
    background: var(--primary-blue);
    border-color: var(--primary-blue);
  }

  .checkbox-label input:checked + .checkmark::after {
    content: "✓";
    color: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
  }

  .radio-label input:checked + .radiomark {
    border-color: var(--primary-blue);
  }

  .radio-label input:checked + .radiomark::after {
    content: "";
    width: 8px;
    height: 8px;
    background: var(--primary-blue);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  /* Расписание */
  .schedule-options {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .schedule-datetime {
    display: flex;
    gap: 1rem;
  }

  /* Действия формы */
  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  /* История уведомлений */
  .empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--gray-500);
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .notifications-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 600px;
    overflow-y: auto;
  }

  .notification-item {
    background: var(--gray-50);
    padding: 1.5rem;
    border-radius: var(--radius);
    border-left: 4px solid var(--gray-300);
  }

  .notification-item.sent {
    border-left-color: #10b981;
  }

  .notification-item.scheduled {
    border-left-color: var(--yellow);
  }

  .notification-item.draft {
    border-left-color: var(--gray-400);
  }

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .notification-header h4 {
    margin: 0;
    color: var(--gray-800);
    flex: 1;
  }

  .notification-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .status {
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
  }

  .status.sent {
    background: #d1fae5;
    color: #065f46;
  }

  .status.scheduled {
    background: #fef3c7;
    color: #92400e;
  }

  .status.draft {
    background: var(--gray-200);
    color: var(--gray-700);
  }

  .sent-date {
    font-size: 0.75rem;
    color: var(--gray-600);
  }

  .notification-message {
    color: var(--gray-700);
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .notification-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .recipients-count {
    font-size: 0.875rem;
    color: var(--gray-600);
  }

  .recipients-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .recipient-tag {
    background: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    border: 1px solid var(--gray-300);
  }

  .recipient-more {
    background: var(--gray-200);
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    color: var(--gray-600);
  }

  /* Кнопки */
  .btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .btn-danger {
    background: #ef4444;
    color: white;
  }

  .btn-danger:hover {
    background: #dc2626;
  }

  /* Спиннер */
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Модальное окно */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: white;
    border-radius: var(--radius);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--gray-200);
  }

  .modal-header h2 {
    margin: 0;
    color: var(--gray-800);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--gray-600);
  }

  .preview-content {
    padding: 2rem;
  }

  .preview-notification {
    background: var(--gray-50);
    padding: 2rem;
    border-radius: var(--radius);
    border-left: 4px solid var(--primary-blue);
  }

  .preview-notification h3 {
    margin: 0 0 1rem 0;
    color: var(--gray-800);
  }

  .preview-meta {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: var(--gray-600);
  }

  .modal-actions {
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--gray-200);
    display: flex;
    justify-content: flex-end;
  }

  /* Адаптивность */
  @media (max-width: 1024px) {
    .notifications-layout {
      grid-template-columns: 1fr;
    }

    .right-column {
      order: -1;
    }
  }

  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .header-stats {
      justify-content: center;
    }

    .channels-grid {
      grid-template-columns: 1fr;
    }

    .recipients-grid {
      grid-template-columns: 1fr;
    }

    .schedule-datetime {
      flex-direction: column;
    }

    .form-actions {
      flex-direction: column;
    }

    .notification-header {
      flex-direction: column;
      gap: 1rem;
    }

    .notification-meta {
      align-items: flex-start;
    }
  }
</style>
