<script lang="ts">
  import { loadScheduleFromBackend, scheduleEvents } from "$lib/stores";
  import type { ScheduleEvent } from "$lib/types";
  import { scheduleApi } from "$lib/api";

  let selectedDate = $state(new Date());
  let currentMonth = $state(new Date());
  let showEventModal = $state(false);
  let selectedEvent = $state<ScheduleEvent | null>(null);

  // Новое событие
  let newEvent = $state<Omit<ScheduleEvent, "id">>({
    title: "",
    type: "lecture",
    instructor: "",
    participants: [],
    startTime: "09:00",
    endTime: "10:30",
    duration: 90,
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  // Получить дни месяца
  function getDaysInMonth() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0); // Последний день месяца
    const daysInMonth = lastDay.getDate();

    // День недели первого дня месяца (0 - воскресенье, 1 - понедельник и т.д.)
    // Мы хотим чтобы неделя начиналась с понедельника (1)
    let startDay = firstDay.getDay();
    if (startDay === 0) startDay = 7; // Воскресенье становится 7-м днем

    const days = [];

    // Пустые ячейки перед первым днем (начинаем с понедельника)
    for (let i = 1; i < startDay; i++) {
      days.push(null);
    }

    // Дни месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }

  // Перейти к предыдущему месяцу
  function prevMonth() {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
  }

  function nextMonth() {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
  }

  // Получить события для конкретной даты
  function getEventsForDate(date: Date) {
    return $scheduleEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  }

  // Добавить событие
  async function addEvent() {
    try {
      const createdEvent = await scheduleApi.create(newEvent);

      // Обновляем хранилище
      scheduleEvents.update((events) => [
        ...events,
        {
          ...createdEvent,
          id: createdEvent.id.toString(), // Преобразуем ID в строку
        },
      ]);

      showEventModal = false;
      resetEventForm();
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert(
        "Ошибка при удалении занятия: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }
  // Редактировать событие
  function editEvent(event: ScheduleEvent) {
    selectedEvent = event;
    newEvent = { ...event };
    showEventModal = true;
  }

  // Обновить событие
  function updateEvent() {
    // Добавь ! чтобы сказать TypeScript, что это не null
    scheduleEvents.update((events) =>
      events.map((event) =>
        event.id === selectedEvent!.id
          ? { ...newEvent, id: selectedEvent!.id }
          : event
      )
    );
    showEventModal = false;
    resetEventForm();
  }
  // Удалить событие
  async function deleteEvent(event: ScheduleEvent) {
    if (confirm("Удалить это событие?")) {
      try {
        await scheduleApi.delete(event.id);
        scheduleEvents.update((events) =>
          events.filter((e) => e.id !== event.id)
        );
      } catch (error) {
        console.error("Failed to delete event:", error);
        alert(
          "Ошибка при удалении занятия: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
      }
    }
  }
  import { onMount } from "svelte";

  onMount(() => {
    loadScheduleFromBackend();
  });

  // Сброс формы
  function resetEventForm() {
    newEvent = {
      title: "",
      type: "lecture",
      instructor: "",
      participants: [],
      startTime: "09:00",
      endTime: "10:30",
      duration: 90,
      date: selectedDate.toISOString().split("T")[0],
      description: "",
    };
    selectedEvent = null;
  }

  // Рассчитать длительность
  function calculateDuration() {
    if (newEvent.startTime && newEvent.endTime) {
      const start = new Date(`2000-01-01T${newEvent.startTime}`);
      const end = new Date(`2000-01-01T${newEvent.endTime}`);
      newEvent.duration = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60)
      );
    }
  }

  // Форматирование времени
  function formatTime(time: string) {
    return time.substring(0, 5);
  }

  // Названия месяцев
  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  // Дни недели
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  let days = $derived(getDaysInMonth());
  let monthName = $derived(monthNames[currentMonth.getMonth()]);
  let year = $derived(currentMonth.getFullYear());
</script>

<div class="calendar-page">
  <header class="page-header">
    <h1>Календарь занятий</h1>
    <button
      on:click={() => {
        newEvent.date = selectedDate.toISOString().split("T")[0];
        showEventModal = true;
      }}
      class="btn-primary"
    >
      + Добавить занятие
    </button>
  </header>

  <!-- Навигация по месяцам -->
  <div class="calendar-nav">
    <button on:click={prevMonth} class="nav-btn">‹</button>
    <h2>{monthName} {year}</h2>
    <button on:click={nextMonth} class="nav-btn">›</button>
  </div>

  <!-- Сетка календаря -->
  <div class="calendar-grid">
    <!-- Заголовки дней недели -->
    {#each ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as day}
      <div class="calendar-header">{day}</div>
    {/each}

    <!-- Дни месяца -->
    {#each days as day}
      <div
        class="calendar-day {day ? 'has-day' : 'empty'} {day &&
        day.toDateString() === selectedDate.toDateString()
          ? 'selected'
          : ''}"
        on:click={() => day && (selectedDate = day)}
      >
        {#if day}
          <div class="day-number">{day.getDate()}</div>
          <div class="day-events">
            {#each getEventsForDate(day) as event}
              <div
                class="event-preview {event.type}"
                on:click|stopPropagation={() => editEvent(event)}
              >
                <span class="event-time">{formatTime(event.startTime)}</span>
                <span class="event-title">{event.title}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Панель выбранного дня -->
  <div class="selected-day-panel">
    <h3>
      Занятия на {selectedDate.toLocaleDateString("ru-RU", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </h3>

    {#if getEventsForDate(selectedDate).length === 0}
      <p class="no-events">На этот день занятий не запланировано</p>
    {:else}
      <div class="events-list">
        {#each getEventsForDate(selectedDate) as event}
          <div class="event-card {event.type}">
            <div class="event-header">
              <span class="event-type-badge">
                {event.type === "lecture"
                  ? "Лекция"
                  : event.type === "seminar"
                    ? "Семинар"
                    : "Пара"}
              </span>
              <div class="event-actions">
                <button on:click={() => editEvent(event)} class="btn-edit"
                  >✏️</button
                >
                <button on:click={() => deleteEvent(event)} class="btn-delete"
                  >🗑️</button
                >
              </div>
            </div>

            <h4>{event.title}</h4>
            <p><strong>Преподаватель:</strong> {event.instructor}</p>
            <p>
              <strong>Время:</strong>
              {event.startTime} - {event.endTime} ({event.duration} мин.)
            </p>

            {#if event.description}
              <p><strong>Описание:</strong> {event.description}</p>
            {/if}

            {#if event.participants.length > 0}
              <p><strong>Участники:</strong> {event.participants.join(", ")}</p>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Модальное окно добавления/редактирования события -->
  {#if showEventModal}
    <div
      class="modal-overlay"
      on:click={() => {
        showEventModal = false;
        resetEventForm();
      }}
    >
      <div class="modal" on:click|stopPropagation>
        <h2>{selectedEvent ? "Редактировать занятие" : "Добавить занятие"}</h2>

        <form on:submit|preventDefault={selectedEvent ? updateEvent : addEvent}>
          <div class="form-grid">
            <div class="input-group">
              <label>Название занятия:</label>
              <input
                type="text"
                bind:value={newEvent.title}
                placeholder="Введите название"
                required
              />
            </div>

            <div class="input-group">
              <label>Тип занятия:</label>
              <select bind:value={newEvent.type}>
                <option value="lecture">Лекция</option>
                <option value="seminar">Семинар</option>
                <option value="pair">Пара</option>
              </select>
            </div>

            <div class="input-group">
              <label>Преподаватель:</label>
              <input
                type="text"
                bind:value={newEvent.instructor}
                placeholder="ФИО преподавателя"
                required
              />
            </div>

            <div class="input-group">
              <label>Дата:</label>
              <input type="date" bind:value={newEvent.date} required />
            </div>

            <div class="input-group">
              <label>Время начала:</label>
              <input
                type="time"
                bind:value={newEvent.startTime}
                on:change={calculateDuration}
                required
              />
            </div>

            <div class="input-group">
              <label>Время окончания:</label>
              <input
                type="time"
                bind:value={newEvent.endTime}
                on:change={calculateDuration}
                required
              />
            </div>

            <div class="input-group full-width">
              <label>Участники (через запятую):</label>
              <input
                type="text"
                bind:value={newEvent.participants}
                placeholder="Иван Иванов, Мария Петрова, Петр Сидоров"
              />
            </div>

            <div class="input-group full-width">
              <label>Описание:</label>
              <textarea
                bind:value={newEvent.description}
                placeholder="Дополнительная информация о занятии"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              on:click={() => {
                showEventModal = false;
                resetEventForm();
              }}
              class="btn-secondary"
            >
              Отмена
            </button>
            <button type="submit" class="btn-primary">
              {selectedEvent ? "Обновить" : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>

<style>
  .calendar-page {
    padding: 1rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  /* Навигация календаря */
  .calendar-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;
    background: white;
    padding: 1rem;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
  }

  .calendar-nav h2 {
    margin: 0;
    min-width: 200px;
    text-align: center;
    color: var(--gray-800);
  }

  .nav-btn {
    background: var(--primary-blue);
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
  }

  .nav-btn:hover {
    background: var(--light-blue);
  }

  /* Сетка календаря */
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: var(--gray-300);
    border: 1px solid var(--gray-300);
    border-radius: var(--radius);
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .calendar-header {
    background: var(--primary-blue);
    color: white;
    padding: 1rem;
    text-align: center;
    font-weight: 600;
  }

  .calendar-day {
    background: white;
    min-height: 120px;
    padding: 0.5rem;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .calendar-day.empty {
    background: var(--gray-100);
    cursor: default;
  }

  .calendar-day.has-day:hover {
    background: var(--gray-50);
  }

  .calendar-day.selected {
    background: var(--sky-blue);
    color: white;
  }

  .day-number {
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  .day-events {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .event-preview {
    font-size: 0.75rem;
    padding: 2px 4px;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .event-preview.lecture {
    background: var(--sky-blue);
    color: white;
  }

  .event-preview.seminar {
    background: var(--yellow);
    color: white;
  }

  .event-preview.pair {
    background: var(--primary-blue);
    color: white;
  }

  .event-time {
    font-weight: 600;
    margin-right: 4px;
  }

  /* Панель выбранного дня */
  .selected-day-panel {
    background: white;
    padding: 2rem;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
  }

  .selected-day-panel h3 {
    margin-bottom: 1.5rem;
    color: var(--gray-800);
    border-bottom: 2px solid var(--gray-200);
    padding-bottom: 0.5rem;
  }

  .no-events {
    text-align: center;
    color: var(--gray-500);
    font-style: italic;
    padding: 2rem;
  }

  .events-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .event-card {
    border-left: 4px solid;
    padding: 1rem;
    background: var(--gray-50);
    border-radius: 0 var(--radius) var(--radius) 0;
  }

  .event-card.lecture {
    border-left-color: var(--sky-blue);
  }

  .event-card.seminar {
    border-left-color: var(--yellow);
  }

  .event-card.pair {
    border-left-color: var(--primary-blue);
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .event-type-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    color: white;
  }

  .event-card.lecture .event-type-badge {
    background: var(--sky-blue);
  }

  .event-card.seminar .event-type-badge {
    background: var(--yellow);
  }

  .event-card.pair .event-type-badge {
    background: var(--primary-blue);
  }

  .event-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-edit,
  .btn-delete {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background 0.3s ease;
  }

  .btn-edit:hover {
    background: var(--gray-200);
  }

  .btn-delete:hover {
    background: #fee2e2;
  }

  .event-card h4 {
    margin: 0 0 0.5rem 0;
    color: var(--gray-800);
  }

  .event-card p {
    margin: 0.25rem 0;
    color: var(--gray-600);
    font-size: 0.9rem;
  }

  /* Форма */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .full-width {
    grid-column: 1 / -1;
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
    padding: 2rem;
    border-radius: var(--radius);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal h2 {
    margin-bottom: 1.5rem;
    color: var(--gray-800);
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .calendar-grid {
      grid-template-columns: repeat(7, 1fr);
    }

    .calendar-day {
      min-height: 80px;
      padding: 0.25rem;
    }

    .event-preview {
      font-size: 0.7rem;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .page-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .page-header h1 {
      text-align: center;
    }
  }
</style>
