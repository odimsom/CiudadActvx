// API Configuration
const API_BASE_URL = "https://ciudadactvx-server.onrender.com/api";

export interface ApiIncident {
  id: string;
  type: {
    id: string;
    name: string;
    icon: string;
    color: string;
    category: string;
    description: string;
  };
  title: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  status: string;
  priority: string;
  reportedBy: string;
  reportedAt: Date;
  updatedAt: Date;
  votes: number;
  views: number;
  photos: string[];
  tags: string[];
}

export interface ApiStatistics {
  total_incidents: number;
  pending_incidents: number;
  in_progress_incidents: number;
  resolved_incidents: number;
  updated_at: string;
}

export interface ApiNotification {
  id: string;
  type: "incident" | "emergency" | "info";
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  incident_id?: string;
}

export class ApiService {
  private static retryCount = new Map<string, number>();
  private static lastRequestTime = new Map<string, number>();

  private static async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 15000
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            `Rate limit exceeded. Please wait before trying again.`
          );
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries = 3
  ): Promise<T> {
    const currentRetries = this.retryCount.get(operationName) || 0;
    const lastRequest = this.lastRequestTime.get(operationName) || 0;
    const now = Date.now();

    // Implement rate limiting - wait at least 2 seconds between requests
    if (now - lastRequest < 2000) {
      await new Promise((resolve) =>
        setTimeout(resolve, 2000 - (now - lastRequest))
      );
    }

    this.lastRequestTime.set(operationName, Date.now());

    try {
      const result = await operation();
      this.retryCount.set(operationName, 0); // Reset on success
      return result;
    } catch (error: any) {
      if (currentRetries >= maxRetries) {
        console.error(`❌ Max retries reached for ${operationName}:`, error);
        throw error;
      }

      if (
        error.message.includes("429") ||
        error.message.includes("Rate limit")
      ) {
        // Exponential backoff for rate limiting
        const backoffTime = Math.min(5000 * Math.pow(2, currentRetries), 30000);
        console.warn(
          `⏳ Rate limited for ${operationName}, waiting ${backoffTime}ms before retry ${currentRetries + 1}/${maxRetries}`
        );

        this.retryCount.set(operationName, currentRetries + 1);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));

        return this.retryWithBackoff(operation, operationName, maxRetries);
      }

      throw error;
    }
  }

  // Incidents API
  static async getIncidents(): Promise<ApiIncident[]> {
    return this.retryWithBackoff(async () => {
      console.log(
        "🔄 Intentando obtener incidentes de:",
        `${API_BASE_URL}/incidents`
      );
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/incidents`);
      const data = await response.json();
      console.log("✅ Incidentes obtenidos exitosamente:", data);
      return data;
    }, "getIncidents");
  }

  static async createIncident(data: {
    title: string;
    description?: string;
    typeId: string;
    typeName: string;
    typeIcon: string;
    typeColor: string;
    typeCategory: string;
    latitude: number;
    longitude: number;
    address?: string;
    priority?: string;
    reportedBy?: string;
    photos?: string[];
    tags?: string[];
  }): Promise<{ id: string; message: string }> {
    try {
      console.log("🔄 Intentando crear incidente:", data);
      console.log("🌐 POST URL:", `${API_BASE_URL}/incidents`);
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/incidents`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      console.log("✅ Incidente creado exitosamente:", result);
      return result;
    } catch (error) {
      console.error("❌ Error creating incident:", error);
      console.error("🔍 Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        name: error instanceof Error ? error.name : "UnknownError",
      });
      throw new Error("Failed to create incident");
    }
  }

  static async voteIncident(
    id: string,
    action: "up" | "down"
  ): Promise<{ message: string }> {
    return this.retryWithBackoff(async () => {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/incidents/${id}/vote`,
        {
          method: "POST",
          body: JSON.stringify({ action }),
        }
      );
      return await response.json();
    }, `voteIncident_${id}`);
  }

  // Statistics API
  static async getStatistics(): Promise<ApiStatistics> {
    return this.retryWithBackoff(async () => {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/statistics`
      );
      return await response.json();
    }, "getStatistics");
  }

  static async getCategoryStatistics(): Promise<any[]> {
    return this.retryWithBackoff(async () => {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/statistics/category`
      );
      return await response.json();
    }, "getCategoryStatistics");
  }

  static async getMonthlyStatistics(): Promise<any[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/statistics/monthly`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching monthly statistics:", error);
      throw new Error("Failed to fetch monthly statistics");
    }
  }

  // Notifications API
  static async getNotifications(): Promise<ApiNotification[]> {
    return this.retryWithBackoff(async () => {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/notifications`
      );
      return await response.json();
    }, "getNotifications");
  }

  static async getUnreadNotifications(): Promise<ApiNotification[]> {
    return this.retryWithBackoff(async () => {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/notifications/unread`
      );
      return await response.json();
    }, "getUnreadNotifications");
  }

  static async markNotificationAsRead(
    id: string
  ): Promise<{ message: string }> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/notifications/${id}/read`,
        {
          method: "POST",
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error("Failed to mark notification as read");
    }
  }

  static async markAllNotificationsAsRead(): Promise<{
    message: string;
    count: number;
  }> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/notifications/read-all`,
        {
          method: "POST",
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw new Error("Failed to mark all notifications as read");
    }
  }

  // Health check
  static async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version: string;
  }> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error("Error checking API health:", error);
      throw new Error("Failed to check API health");
    }
  }
}
