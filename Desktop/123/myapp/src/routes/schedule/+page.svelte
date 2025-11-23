<script lang="ts">
  const monthNames = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];
  import { loadScheduleFromBackend, scheduleEvents } from "$lib/stores";
  import type { ScheduleEvent } from "$lib/types";
  import { scheduleApi } from "$lib/api";

  let selectedView: "table" | "week" | "day" = "table";
  let currentWeek = new Date();
  let currentDay = new Date();
  let filterType: "all" | "lecture" | "seminar" | "pair" = "all";
  let searchTerm = "";

  // Фильтрация событий
  $: filteredEvents = $scheduleEvents.filter((event) => {
    const matchesType = filterType === "all" || event.type === filterType;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.participants.some((p) =>
        p.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesType && matchesSearch;
  });

  // События для текущей недели
  $: weekEvents = getWeekEvents(currentWeek);

  // События для текущего дня
  $: dayEvents = getDayEvents(currentDay);

  // Получить события для недели
  function getWeekEvents(date: Date) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Начало недели (понедельник)

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Конец недели (воскресенье)

    return filteredEvents
      .filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      })
      .sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.startTime}`).getTime();
        const timeB = new Date(`2000-01-01T${b.startTime}`).getTime();
        return timeA - timeB;
      });
  }

  // Получить события для дня
  function getDayEvents(date: Date) {
    return filteredEvents
      .filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
      })
      .sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.startTime}`).getTime();
        const timeB = new Date(`2000-01-01T${b.startTime}`).getTime();
        return timeA - timeB;
      });
  }

  // Навигация по неделям
  function prevWeek() {
    currentWeek = new Date(
      currentWeek.getFullYear(),
      currentWeek.getMonth(),
      currentWeek.getDate() - 7
    );
  }

  function nextWeek() {
    currentWeek = new Date(
      currentWeek.getFullYear(),
      currentWeek.getMonth(),
      currentWeek.getDate() + 7
    );
  }

  // Навигация по дням
  function prevDay() {
    currentDay = new Date(
      currentDay.getFullYear(),
      currentDay.getMonth(),
      currentDay.getDate() - 1
    );
  }

  function nextDay() {
    currentDay = new Date(
      currentDay.getFullYear(),
      currentDay.getMonth(),
      currentDay.getDate() + 1
    );
  }

  function goToToday() {
    currentWeek = new Date();
    currentDay = new Date();
  }

  // Удалить событие
  function deleteEvent(id: string) {
    if (confirm("Вы уверены, что хотите удалить это занятие?")) {
      scheduleEvents.update((events) =>
        events.filter((event) => event.id !== id)
      );
    }
  }

  // Экспорт в JSON
  async function exportToJSON() {
    try {
      const events = await scheduleApi.export();
      const dataStr = JSON.stringify(events, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      const url = URL.createObjectURL(dataBlob);
      link.href = URL.createObjectURL(dataBlob);
      link.download = `schedule-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert(
        "Ошибка при удалении занятия: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }

  // Импорт из JSON
  async function importFromJSON(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          // Если файл содержит массив событий, создаем их на бэкенде
          if (Array.isArray(data)) {
            for (const eventData of data) {
              await scheduleApi.create(eventData);
            }
            // Перезагружаем расписание
            await loadScheduleFromBackend();
            alert("Расписание успешно импортировано!");
          } else {
            alert("Неверный формат файла");
          }
        } catch (error) {
          console.error("Failed to delete event:", error);
          alert(
            "Ошибка при удалении занятия: " +
              (error instanceof Error ? error.message : "Unknown error")
          );
        }
      };
      reader.readAsText(file);
    }

    input.value = "";
  }

  // Получить время в формате HH:MM
  function formatTime(time: string) {
    return time.substring(0, 5);
  }

  // Получить день недели
  function getDayName(date: Date) {
    const days = [
      "Воскресенье",
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
    ];
    return days[date.getDay()];
  }

  // Получить короткое название дня
  function getShortDayName(date: Date) {
    const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    return days[date.getDay()];
  }

  // Генерация временных слотов для дня
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = 8 + i; // с 8:00 до 21:00
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  // Получить события для временного слота и дня
  function getEventsForTimeSlot(day: Date, timeSlot: string) {
    return dayEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.toDateString() === day.toDateString() &&
        event.startTime.startsWith(timeSlot.substring(0, 2))
      );
    });
  }

  // Получить дни недели
  $: weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeek);
    date.setDate(currentWeek.getDate() - currentWeek.getDay() + 1 + i); // Пн-Вс
    return date;
  });

  // Статистика
  $: stats = {
    total: filteredEvents.length,
    lectures: filteredEvents.filter((e) => e.type === "lecture").length,
    seminars: filteredEvents.filter((e) => e.type === "seminar").length,
    pairs: filteredEvents.filter((e) => e.type === "pair").length,
  };
</script>

<div class="scheduler-page">
  <header class="page-header">
    <h1>Планировщик расписания</h1>
    <div class="header-actions">
      <button on:click={exportToJSON} class="btn-primary">
        📥 Экспорт JSON
      </button>
      <label class="btn-secondary import-btn">
        📤 Импорт JSON
        <input type="file" accept=".json" on:change={importFromJSON} hidden />
      </label>
    </div>
  </header>

  <!-- Панель управления -->
  <div class="control-panel">
    <div class="view-controls">
      <button
        class:active={selectedView === "table"}
        on:click={() => (selectedView = "table")}
      >
        📋 Таблица
      </button>
      <button
        class:active={selectedView === "week"}
        on:click={() => (selectedView = "week")}
      >
        📅 Неделя
      </button>
      <button
        class:active={selectedView === "day"}
        on:click={() => (selectedView = "day")}
      >
        📖 День
      </button>
    </div>

    <div class="filter-controls">
      <select bind:value={filterType}>
        <option value="all">Все типы</option>
        <option value="lecture">Лекции</option>
        <option value="seminar">Семинары</option>
        <option value="pair">Пары</option>
      </select>

      <input
        type="text"
        bind:value={searchTerm}
        placeholder="Поиск по названию, преподавателю..."
        class="search-input"
      />
    </div>
  </div>

  <!-- Статистика -->
  <div class="stats-panel">
    <div class="stat-card">
      <div class="stat-number">{stats.total}</div>
      <div class="stat-label">Всего занятий</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">{stats.lectures}</div>
      <div class="stat-label">Лекций</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">{stats.seminars}</div>
      <div class="stat-label">Семинаров</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">{stats.pairs}</div>
      <div class="stat-label">Пар</div>
    </div>
  </div>

  <!-- Представление: Таблица -->
  {#if selectedView === "table"}
    <div class="table-view">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Название</th>
              <th>Тип</th>
              <th>Преподаватель</th>
              <th>Дата</th>
              <th>Время</th>
              <th>Длительность</th>
              <th>Участники</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredEvents as event}
              <tr>
                <td class="event-title">{event.title}</td>
                <td>
                  <span class="event-badge {event.type}">
                    {event.type === "lecture"
                      ? "Лекция"
                      : event.type === "seminar"
                        ? "Семинар"
                        : "Пара"}
                  </span>
                </td>
                <td>{event.instructor}</td>
                <td>{new Date(event.date).toLocaleDateString("ru-RU")}</td>
                <td
                  >{formatTime(event.startTime)} - {formatTime(
                    event.endTime
                  )}</td
                >
                <td>{event.duration} мин.</td>
                <td>
                  <div class="participants">
                    {#each event.participants.slice(0, 2) as participant}
                      <span class="participant-tag">{participant}</span>
                    {/each}
                    {#if event.participants.length > 2}
                      <span class="participant-more"
                        >+{event.participants.length - 2}</span
                      >
                    {/if}
                  </div>
                </td>
                <td>
                  <button
                    on:click={() => deleteEvent(event.id)}
                    class="btn-danger"
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="8" class="no-data">
                  {searchTerm || filterType !== "all"
                    ? "Занятия не найдены"
                    : "Нет занятий"}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- Представление: Неделя -->
  {#if selectedView === "week"}
    <div class="week-view">
      <div class="week-nav">
        <button on:click={prevWeek}>‹</button>
        <h3>
          Неделя {currentWeek.getDate()}-{currentWeek.getDate() + 6}
          {monthNames[currentWeek.getMonth()]}
          {currentWeek.getFullYear()}
        </h3>
        <button on:click={nextWeek}>›</button>
        <button on:click={goToToday} class="today-btn">Сегодня</button>
      </div>

      <div class="week-grid">
        <div class="time-column">
          <div class="time-header">Время</div>
          {#each timeSlots as time}
            <div class="time-slot">{time}</div>
          {/each}
        </div>

        {#each weekDays as day}
          <div
            class="day-column {day.toDateString() === new Date().toDateString()
              ? 'today'
              : ''}"
          >
            <div class="day-header">
              <div class="day-name">{getShortDayName(day)}</div>
              <div class="day-date">{day.getDate()}</div>
            </div>
            {#each timeSlots as time}
              <div class="time-cell">
                {#each getEventsForTimeSlot(day, time) as event}
                  <div
                    class="week-event {event.type}"
                    style="--duration: {event.duration / 60}"
                    title="{event.title} - {event.instructor}"
                  >
                    <div class="event-time">{formatTime(event.startTime)}</div>
                    <div class="event-title">{event.title}</div>
                    <div class="event-instructor">{event.instructor}</div>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Представление: День -->
  {#if selectedView === "day"}
    <div class="day-view">
      <div class="day-nav">
        <button on:click={prevDay}>‹</button>
        <h3>
          {getDayName(currentDay)}
          {currentDay.toLocaleDateString("ru-RU")}
        </h3>
        <button on:click={nextDay}>›</button>
        <button on:click={goToToday} class="today-btn">Сегодня</button>
      </div>

      <div class="day-timeline">
        {#each timeSlots as time}
          <div class="timeline-row">
            <div class="time-label">{time}</div>
            <div class="time-content">
              {#each dayEvents.filter( (event) => event.startTime.startsWith(time.substring(0, 2)) ) as event}
                <div
                  class="day-event {event.type}"
                  style="--duration: {event.duration / 60}"
                >
                  <div class="event-header">
                    <span class="event-time"
                      >{formatTime(event.startTime)}-{formatTime(
                        event.endTime
                      )}</span
                    >
                    <span class="event-type-badge">
                      {event.type === "lecture"
                        ? "Л"
                        : event.type === "seminar"
                          ? "С"
                          : "П"}
                    </span>
                  </div>
                  <div class="event-title">{event.title}</div>
                  <div class="event-instructor">{event.instructor}</div>
                  {#if event.participants.length > 0}
                    <div class="event-participants">
                      {event.participants.slice(0, 3).join(", ")}
                      {#if event.participants.length > 3}...{/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .scheduler-page {
    padding: 1rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
  }

  .import-btn {
    position: relative;
    cursor: pointer;
  }

  /* Панель управления */
  .control-panel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    background: white;
    padding: 1.5rem;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
  }

  .view-controls {
    display: flex;
    gap: 0.5rem;
  }

  .view-controls button {
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--gray-300);
    background: white;
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .view-controls button.active {
    background: var(--primary-blue);
    color: white;
    border-color: var(--primary-blue);
  }

  .view-controls button:hover:not(.active) {
    border-color: var(--primary-blue);
  }

  .filter-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .search-input {
    padding: 0.75rem 1rem;
    border: 2px solid var(--gray-300);
    border-radius: var(--radius);
    min-width: 300px;
  }

  /* Статистика */
  .stats-panel {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    text-align: center;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary-blue);
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: var(--gray-600);
    font-size: 0.9rem;
  }

  /* Табличное представление */
  .table-container {
    background: white;
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--gray-200);
  }

  th {
    background: var(--gray-100);
    font-weight: 600;
    color: var(--gray-800);
  }

  .event-title {
    font-weight: 500;
    color: var(--gray-800);
  }

  .event-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    color: white;
  }

  .event-badge.lecture {
    background: var(--sky-blue);
  }

  .event-badge.seminar {
    background: var(--yellow);
  }

  .event-badge.pair {
    background: var(--primary-blue);
  }

  .participants {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    align-items: center;
  }

  .participant-tag {
    background: var(--gray-100);
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
  }

  .participant-more {
    background: var(--gray-200);
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
    color: var(--gray-600);
  }

  .no-data {
    text-align: center;
    color: var(--gray-500);
    padding: 3rem;
    font-style: italic;
  }

  /* Недельное представление */
  .week-view,
  .day-view {
    background: white;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .week-nav,
  .day-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    background: var(--gray-100);
    border-bottom: 1px solid var(--gray-200);
  }

  .week-nav h3,
  .day-nav h3 {
    margin: 0;
    color: var(--gray-800);
  }

  .week-nav button,
  .day-nav button {
    background: var(--primary-blue);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    cursor: pointer;
  }

  .today-btn {
    background: var(--yellow) !important;
  }

  .week-grid {
    display: grid;
    grid-template-columns: 100px repeat(7, 1fr);
    height: 600px;
    overflow-y: auto;
  }

  .time-column {
    background: var(--gray-50);
  }

  .time-header {
    padding: 1rem;
    font-weight: 600;
    border-bottom: 1px solid var(--gray-200);
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .time-slot {
    padding: 0.5rem;
    border-bottom: 1px solid var(--gray-200);
    height: 60px;
    font-size: 0.875rem;
    color: var(--gray-600);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .day-column {
    border-right: 1px solid var(--gray-200);
  }

  .day-column.today {
    background: var(--sky-blue);
  }

  .day-column:last-child {
    border-right: none;
  }

  .day-header {
    padding: 1rem;
    text-align: center;
    border-bottom: 1px solid var(--gray-200);
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .day-name {
    font-weight: 600;
    color: var(--gray-800);
  }

  .day-date {
    font-size: 0.875rem;
    color: var(--gray-600);
  }

  .time-cell {
    border-bottom: 1px solid var(--gray-200);
    height: 60px;
    position: relative;
  }

  .week-event {
    position: absolute;
    left: 2px;
    right: 2px;
    padding: 0.25rem;
    border-radius: 4px;
    font-size: 0.75rem;
    overflow: hidden;
    height: calc(var(--duration) * 60px - 4px);
    z-index: 1;
  }

  .week-event.lecture {
    background: var(--sky-blue);
    color: white;
  }

  .week-event.seminar {
    background: var(--yellow);
    color: white;
  }

  .week-event.pair {
    background: var(--primary-blue);
    color: white;
  }

  .event-time {
    font-weight: 600;
    font-size: 0.7rem;
  }

  .event-title {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .event-instructor {
    font-size: 0.7rem;
    opacity: 0.9;
  }

  /* Дневное представление */
  .day-timeline {
    padding: 1rem;
  }

  .timeline-row {
    display: grid;
    grid-template-columns: 80px 1fr;
    min-height: 80px;
    border-bottom: 1px solid var(--gray-200);
  }

  .time-label {
    padding: 1rem;
    font-weight: 600;
    color: var(--gray-700);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gray-50);
  }

  .time-content {
    padding: 0.5rem;
    position: relative;
  }

  .day-event {
    background: white;
    border-left: 4px solid;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 0 var(--radius) var(--radius) 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .day-event.lecture {
    border-left-color: var(--sky-blue);
  }

  .day-event.seminar {
    border-left-color: var(--yellow);
  }

  .day-event.pair {
    border-left-color: var(--primary-blue);
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .event-time {
    font-size: 0.875rem;
    color: var(--gray-600);
    font-weight: 500;
  }

  .event-type-badge {
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    color: white;
  }

  .day-event.lecture .event-type-badge {
    background: var(--sky-blue);
  }

  .day-event.seminar .event-type-badge {
    background: var(--yellow);
  }

  .day-event.pair .event-type-badge {
    background: var(--primary-blue);
  }

  .event-participants {
    font-size: 0.875rem;
    color: var(--gray-600);
    margin-top: 0.5rem;
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .control-panel {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .view-controls {
      justify-content: center;
    }

    .filter-controls {
      flex-direction: column;
    }

    .search-input {
      min-width: auto;
    }

    .stats-panel {
      grid-template-columns: repeat(2, 1fr);
    }

    .header-actions {
      flex-direction: column;
    }

    .week-grid {
      grid-template-columns: 60px repeat(7, 1fr);
      font-size: 0.75rem;
    }

    .time-header,
    .time-slot {
      padding: 0.25rem;
    }
  }
</style>
