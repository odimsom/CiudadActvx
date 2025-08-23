// Enhanced API Service with Request Queue and Smart Rate Limiting
const API_BASE_URL = "https://ciudadactvx-server.onrender.com/api";

// Request queue para evitar rate limiting
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private lastRequest = 0;
  private minInterval = 1000; // 1 segundo entre requests

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    console.log(
      `📋 Procesando cola de requests: ${this.queue.length} pendientes`
    );

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequest;

      if (timeSinceLastRequest < this.minInterval) {
        const waitTime = this.minInterval - timeSinceLastRequest;
        console.log(`⏳ Esperando ${waitTime}ms antes del próximo request`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      const request = this.queue.shift();
      if (request) {
        try {
          await request();
          this.lastRequest = Date.now();
        } catch (error) {
          console.error("❌ Error procesando request en cola:", error);
        }
      }
    }

    this.processing = false;
    console.log("✅ Cola de requests procesada");
  }
}

const requestQueue = new RequestQueue();

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

  // Enhanced timeout with better error handling
  private static async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 15000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
      }
      throw error;
    }
  }

  // Smart retry with exponential backoff
  private static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries = 3
  ): Promise<T> {
    const currentRetries = this.retryCount.get(operationName) || 0;

    // Rate limiting: Wait between requests
    const lastRequest = this.lastRequestTime.get(operationName) || 0;
    const now = Date.now();
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
        error.message.includes("Rate limit") ||
        error.message.includes("Too Many Requests")
      ) {
        // Exponential backoff for rate limiting
        const backoffTime = Math.min(3000 * Math.pow(2, currentRetries), 20000);
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

  // Incidents API with queue
  static async getIncidents(): Promise<ApiIncident[]> {
    return requestQueue.add(() => {
      return this.retryWithBackoff(async () => {
        console.log(
          "🔄 Intentando obtener incidentes de:",
          `${API_BASE_URL}/incidents`
        );
        const response = await this.fetchWithTimeout(
          `${API_BASE_URL}/incidents`
        );
        const data = await response.json();
        console.log(`✅ ${data.length} incidentes obtenidos exitosamente`);
        return data;
      }, "getIncidents");
    });
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
    return requestQueue.add(() => {
      return this.retryWithBackoff(async () => {
        console.log("🔄 Creando nuevo incidente:", data.title);
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
      }, "createIncident");
    });
  }

  static async voteIncident(
    id: string,
    action: "up" | "down"
  ): Promise<{ message: string }> {
    return requestQueue.add(() => {
      return this.retryWithBackoff(async () => {
        const response = await this.fetchWithTimeout(
          `${API_BASE_URL}/incidents/${id}/vote`,
          {
            method: "POST",
            body: JSON.stringify({ action }),
          }
        );
        return response.json();
      }, "voteIncident");
    });
  }

  // Statistics API with queue
  static async getStatistics(): Promise<ApiStatistics> {
    return requestQueue.add(() => {
      return this.retryWithBackoff(async () => {
        console.log("📊 Obteniendo estadísticas...");
        const response = await this.fetchWithTimeout(
          `${API_BASE_URL}/statistics`
        );
        const data = await response.json();
        console.log("✅ Estadísticas obtenidas:", data);
        return data;
      }, "getStatistics");
    });
  }

  // Notifications API with queue
  static async getNotifications(): Promise<ApiNotification[]> {
    return requestQueue.add(() => {
      return this.retryWithBackoff(async () => {
        console.log("🔔 Obteniendo notificaciones...");
        const response = await this.fetchWithTimeout(
          `${API_BASE_URL}/notifications`
        );
        const data = await response.json();
        console.log(`✅ ${data.length} notificaciones obtenidas`);
        return data;
      }, "getNotifications");
    });
  }

  static async markNotificationAsRead(id: string): Promise<void> {
    return requestQueue.add(() => {
      return this.retryWithBackoff(async () => {
        await this.fetchWithTimeout(
          `${API_BASE_URL}/notifications/${id}/read`,
          {
            method: "PATCH",
          }
        );
      }, "markNotificationAsRead");
    });
  }

  // Emergency API with queue
  static async getEmergencies(): Promise<any[]> {
    return requestQueue.add(() => {
      return this.retryWithBackoff(async () => {
        const response = await this.fetchWithTimeout(
          `${API_BASE_URL}/emergencies`
        );
        return response.json();
      }, "getEmergencies");
    });
  }

  static async reportEmergency(data: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    severity: string;
  }): Promise<{ id: string; message: string }> {
    return requestQueue.add(() => {
      return this.retryWithBackoff(async () => {
        const response = await this.fetchWithTimeout(
          `${API_BASE_URL}/emergencies`,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );
        return response.json();
      }, "reportEmergency");
    });
  }
}
