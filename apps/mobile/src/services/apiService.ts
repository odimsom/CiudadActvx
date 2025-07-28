// API Configuration
const API_BASE_URL = import.meta.env.PROD
  ? "https://ciudadactvx-server.onrender.com/api"
  : "http://localhost:3333/api";

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
  incident_id?: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read_at?: string;
}

export class ApiService {
  private static async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 10000
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Incidents API
  static async getIncidents(): Promise<ApiIncident[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/incidents`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching incidents:", error);
      throw new Error("Failed to fetch incidents");
    }
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
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/incidents`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error creating incident:", error);
      throw new Error("Failed to create incident");
    }
  }

  static async voteIncident(
    id: string,
    action: "up" | "down"
  ): Promise<{ message: string }> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/incidents/${id}/vote`,
        {
          method: "POST",
          body: JSON.stringify({ action }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error voting incident:", error);
      throw new Error("Failed to vote on incident");
    }
  }

  // Statistics API
  static async getStatistics(): Promise<ApiStatistics> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/statistics`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw new Error("Failed to fetch statistics");
    }
  }

  static async getCategoryStatistics(): Promise<any[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/statistics/category`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching category statistics:", error);
      throw new Error("Failed to fetch category statistics");
    }
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
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/notifications`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new Error("Failed to fetch notifications");
    }
  }

  static async getUnreadNotifications(): Promise<ApiNotification[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/notifications/unread`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      throw new Error("Failed to fetch unread notifications");
    }
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
