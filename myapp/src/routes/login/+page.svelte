<script lang="ts">
  import { isAuthenticated, user } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { authApi } from "$lib/api";

  let email = "admin@university.ru"; //预设管理员邮箱
  let password = "admin123"; //预设密码
  let error = "";
  let isLoading = false;

  async function login(event: Event) {
    event.preventDefault();
    isLoading = true;
    error = "";
    goto("/calendar");
    // try {
    //   const result = await authApi.login(email, password);

    //   if (result.success) {
    //     user.set(result.user);
    //     isAuthenticated.set(true);

    //     // Загружаем данные с бэкенда
    //     setTimeout(() => {

    //     }, 100);
    //   }
    // } catch (err) {
    //   error = err instanceof Error ? err.message : "Ошибка авторизации";
    // } finally {
    //   isLoading = false;
    // }
  }
</script>

<div class="login-container">
  <div class="login-card">
    <h1>Вход в админ-панель</h1>
    <form on:submit={login}>
      <div class="input-group">
        <label for="email">Email:</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="Введите email"
          required
          disabled={isLoading}
        />
      </div>

      <div class="input-group">
        <label for="password">Пароль:</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="Введите пароль"
          required
          disabled={isLoading}
        />
      </div>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <button
        type="submit"
        class="login-btn"
        disabled={isLoading}
        class:loading={isLoading}
      >
        {#if isLoading}
          <span class="spinner"></span>
          Вход...
        {:else}
          Войти
        {/if}
      </button>

      <div class="demo-credentials">
        <p><strong>Demo доступ:</strong></p>
        <p>Email: admin@university.ru</p>
        <p>Пароль: admin123</p>
      </div>
    </form>
  </div>
</div>

<style>
  .demo-credentials {
    margin-top: 2rem;
    padding: 1rem;
    background: var(--gray-100);
    border-radius: var(--radius);
    font-size: 0.9rem;
    color: var(--gray-600);
  }

  .demo-credentials p {
    margin: 0.25rem 0;
  }
</style>
