<script lang="ts">
  import { page } from "$app/stores";
  import { isAuthenticated, user } from "$lib/stores";
  import "../app.css";
  import { onMount } from "svelte";
  import { initializeApp } from "$lib/stores";

  onMount(() => {
    initializeApp();
  });
  function isActive(path: string): boolean {
    return $page.url.pathname === path;
  }
</script>

<svelte:head>
  <title>Админ Панель</title>
</svelte:head>

<div class="app">
  {#if $isAuthenticated && $user}
    <nav class="sidebar">
      <div class="logo">
        <h2>Админ Панель</h2>
      </div>
      <ul class="nav-links">
        <li class:active={isActive("/calendar")}>
          <a href="/calendar">📅 Календарь</a>
        </li>
        <li class:active={isActive("/schedule")}>
          <a href="/schedule">📋 Расписание</a>
        </li>
        <li class:active={isActive("/notifications")}>
          <a href="/notifications">🔔 Уведомления</a>
        </li>
        <li>
          <button
            on:click={() => {
              isAuthenticated.set(false);
              user.set(null);
            }}
            class="logout-btn"
          >
            🚪 Выйти
          </button>
        </li>
      </ul>
    </nav>

    <main class="main-content">
      <slot />
    </main>
  {:else}
    <slot />
  {/if}
</div>
