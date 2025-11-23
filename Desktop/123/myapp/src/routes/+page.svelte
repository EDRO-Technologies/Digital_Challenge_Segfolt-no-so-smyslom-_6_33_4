<script lang="ts">
    import { isAuthenticated } from '$lib/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
  
    onMount(() => {
      // Если пользователь авторизован, редиректим в админку
      if ($isAuthenticated) {
        goto('/calendar', { replaceState: true });
      }
    });
  </script>
  
  <div class="landing">
    <header class="landing-header">
      <div class="container">
        <h1>Административная Панель</h1>
        <p>Система управления расписанием и уведомлениями</p>
        <div class="actions">
          <a href="/login" class="btn-primary">Войти в систему</a>
        </div>
      </div>
    </header>
  
    <main class="landing-features">
      <div class="container">
        <h2>Возможности системы</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📅</div>
            <h3>Управление расписанием</h3>
            <p>Создавайте и редактируйте расписание занятий, лекций и семинаров</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Управление участниками</h3>
            <p>Отслеживайте запись на занятия и управляйте списками участников</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔔</div>
            <h3>Система уведомлений</h3>
            <p>Отправляйте уведомления участникам с гибкими настройками</p>
          </div>
        </div>
      </div>
    </main>
  </div>
  
  <style>
    .landing {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--sky-blue) 0%, var(--primary-blue) 100%);
    }
  
    .landing-header {
      padding: 4rem 2rem;
      text-align: center;
      color: white;
    }
  
    .landing-header h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
  
    .landing-header p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
  
    .landing-features {
      background: white;
      padding: 4rem 2rem;
      border-radius: var(--radius) var(--radius) 0 0;
    }
  
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
  
    .landing-features h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: var(--gray-800);
    }
  
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
  
    .feature-card {
      text-align: center;
      padding: 2rem;
      background: var(--gray-100);
      border-radius: var(--radius);
      transition: transform 0.3s ease;
    }
  
    .feature-card:hover {
      transform: translateY(-5px);
    }
  
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
  
    .feature-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--gray-800);
    }
  
    .feature-card p {
      color: var(--gray-600);
      line-height: 1.6;
    }
  
    .actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
  
    @media (max-width: 768px) {
      .landing-header h1 {
        font-size: 2rem;
      }
      
      .landing-features h2 {
        font-size: 2rem;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>