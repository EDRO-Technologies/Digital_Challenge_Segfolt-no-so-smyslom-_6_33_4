const API_BASE_URL = "http://localhost:3000";

// Функция для создания Basic Auth заголовка
function createAuthHeader(email: string, password: string) {
  const credentials = btoa(`${email}:${password}`);
  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const authData = localStorage.getItem("admin-auth");
  if (!authData) {
    throw new Error("Not authenticated");
  }

  const { email, password } = JSON.parse(authData);

  const headers = {
    ...createAuthHeader(email, password),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem("admin-auth");
      localStorage.removeItem("admin-user");
      window.location.href = "/login";
      throw new Error("Не авторизован");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// Аутентификация
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.user.role === "admin") {
      localStorage.setItem("admin-auth", JSON.stringify({ email, password }));
      localStorage.setItem("admin-user", JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.message || "Доступ запрещен");
    }
  },

  logout: () => {
    localStorage.removeItem("admin-auth");
    localStorage.removeItem("admin-user");
  },

  checkAuth: async () => {
    return await apiRequest("/auth/me");
  },
};

// Расписание
export const scheduleApi = {
  getAll: async (): Promise<any[]> => {
    const response = await apiRequest("/schedule");
    return response.data || [];
  },

  create: async (event: any): Promise<any> => {
    const response = await apiRequest("/schedule", {
      method: "POST",
      body: JSON.stringify(event),
    });
    return response.data;
  },

  update: async (id: string, event: any): Promise<any> => {
    const response = await apiRequest(`/schedule/${id}`, {
      method: "PUT",
      body: JSON.stringify(event),
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/schedule/${id}`, {
      method: "DELETE",
    });
  },

  export: async (): Promise<any[]> => {
    const response = await apiRequest("/schedule/export");
    return response.data || [];
  },
};

// Уведомления
export const notificationsApi = {
  send: async (notification: any): Promise<any> => {
    const response = await apiRequest("/notifications/send", {
      method: "POST",
      body: JSON.stringify(notification),
    });
    return response.data;
  },

  schedule: async (notification: any): Promise<any> => {
    const response = await apiRequest("/notifications/schedule", {
      method: "POST",
      body: JSON.stringify({
        ...notification,
        scheduledFor: notification.scheduledFor,
      }),
    });
    return response.data;
  },

  getHistory: async (): Promise<any[]> => {
    const response = await apiRequest("/notifications/history");
    return response.data || [];
  },

  cancelScheduled: async (id: string): Promise<void> => {
    await apiRequest(`/notifications/scheduled/${id}`, {
      method: "DELETE",
    });
  },
};
