// Simulador de servidor simple para persistencia
// Este archivo simula una API de backend para compartir reportes entre usuarios

export class SimpleServer {
  private static instance: SimpleServer;
  private storageKey = 'ciudad-activa-server-simulation';
  private syncInterval: number | null = null;
  private subscribers: Array<(incidents: any[]) => void> = [];
  private lastUserActivity: number = Date.now();
  private isUserActive: boolean = false;

  private constructor() {
    this.startSyncSimulation();
    this.trackUserActivity();
  }

  static getInstance(): SimpleServer {
    if (!SimpleServer.instance) {
      SimpleServer.instance = new SimpleServer();
    }
    return SimpleServer.instance;
  }

  // Rastrear actividad del usuario
  private trackUserActivity() {
    const updateActivity = () => {
      this.lastUserActivity = Date.now();
      this.isUserActive = true;
    };

    // Escuchar eventos de actividad
    ['click', 'scroll', 'keypress', 'mousemove'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Verificar inactividad cada minuto
    setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastUserActivity;
      this.isUserActive = timeSinceLastActivity < 120000; // Activo si hubo actividad en los últimos 2 minutos
    }, 60000);
  }

  // Simular sincronización con "servidor"
  private startSyncSimulation() {
    this.syncInterval = window.setInterval(() => {
      // Solo simular actividad si el usuario está activo
      if (this.isUserActive) {
        this.simulateServerUpdates();
      }
    }, 8000); // Aumentar intervalo a 8 segundos
  }

  // Simular actualizaciones del servidor (otros usuarios reportando)
  private simulateServerUpdates() {
    const serverData = this.getServerData();
    
    // Reducir probabilidad: 5% solo si hay reportes existentes
    if (Math.random() < 0.05 && serverData.length > 0) {
      const newReport = this.generateRandomReport();
      serverData.push(newReport);
      this.saveServerData(serverData);
      this.notifySubscribers(serverData);
      
      // Mostrar notificación de nuevo reporte
      this.showNotification(newReport);
    }

    // 10% de probabilidad de que un reporte cambie de estado (solo si hay reportes)
    if (Math.random() < 0.1 && serverData.length > 0) {
      const pendingReports = serverData.filter((r: any) => r.status === 'pending');
      if (pendingReports.length > 0) {
        const reportToUpdate = pendingReports[Math.floor(Math.random() * pendingReports.length)];
        reportToUpdate.status = Math.random() < 0.7 ? 'in_progress' : 'resolved';
        reportToUpdate.updatedAt = new Date().toISOString();
        
        if (reportToUpdate.status === 'resolved') {
          reportToUpdate.notes = reportToUpdate.notes || [];
          reportToUpdate.notes.push('✅ Problema resuelto por las autoridades competentes');
        }
        
        this.saveServerData(serverData);
        this.notifySubscribers(serverData);
        this.showNotification(reportToUpdate, 'actualizado');
      }
    }
  }

  private generateRandomReport() {
    const types = [
      { id: 'waste', name: 'Basura acumulada', category: 'waste', color: '#ef4444' },
      { id: 'lighting', name: 'Iluminación pública', category: 'infrastructure', color: '#fbbf24' },
      { id: 'pothole', name: 'Bache en la calle', category: 'infrastructure', color: '#6b7280' },
      { id: 'noise', name: 'Ruido excesivo', category: 'noise', color: '#8b5cf6' },
      { id: 'trees', name: 'Árbol caído', category: 'environment', color: '#10b981' },
    ];

    const locations = [
      { address: 'Calle El Conde, Zona Colonial', lat: 18.4861, lng: -69.9312 },
      { address: 'Avenida 27 de Febrero', lat: 18.4896, lng: -69.9018 },
      { address: 'Malecón de Santo Domingo', lat: 18.4707, lng: -69.8948 },
      { address: 'Piantini', lat: 18.4747, lng: -69.9173 },
      { address: 'Los Alcarrizos', lat: 18.5158, lng: -70.0142 },
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const citizens = ['María Rodríguez', 'Carlos Pérez', 'Ana Gómez', 'Luis Martínez', 'Elena Vargas', 'José Fernández', 'Carmen Torres', 'Miguel Santos'];

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: {
        id: type.id,
        name: type.name,
        icon: 'AlertTriangle',
        color: type.color,
        category: type.category,
        description: `Reporte de ${type.name.toLowerCase()}`
      },
      title: `${type.name} reportada por la comunidad`,
      description: `Se reportó ${type.name.toLowerCase()} que requiere atención de las autoridades.`,
      coordinates: { lat: location.lat + (Math.random() - 0.5) * 0.01, lng: location.lng + (Math.random() - 0.5) * 0.01 },
      address: location.address,
      status: 'pending',
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      reportedBy: citizens[Math.floor(Math.random() * citizens.length)],
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFromServer: true // Marcar como reporte del servidor
    };
  }

  private showNotification(report: any, action: string = 'nuevo') {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`Ciudad Activa - Reporte ${action}`, {
        body: `${report.title} en ${report.address}`,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: report.id
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    }
  }

  // API pública
  subscribe(callback: (incidents: any[]) => void) {
    this.subscribers.push(callback);
    
    // Enviar datos iniciales
    const data = this.getServerData();
    callback(data);
    
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(data: any[]) {
    this.subscribers.forEach(callback => callback(data));
  }

  getServerData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveServerData(data: any[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  addReport(report: any) {
    const serverData = this.getServerData();
    const reportWithServerFlag = { ...report, isFromUser: true };
    serverData.push(reportWithServerFlag);
    this.saveServerData(serverData);
    this.notifySubscribers(serverData);
    return reportWithServerFlag;
  }

  updateReport(id: string, updates: any) {
    const serverData = this.getServerData();
    const index = serverData.findIndex((r: any) => r.id === id);
    if (index !== -1) {
      serverData[index] = { ...serverData[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveServerData(serverData);
      this.notifySubscribers(serverData);
      return serverData[index];
    }
    return null;
  }

  deleteReport(id: string) {
    const serverData = this.getServerData();
    const filtered = serverData.filter((r: any) => r.id !== id);
    this.saveServerData(filtered);
    this.notifySubscribers(filtered);
  }

  // Solicitar permisos de notificación
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.subscribers = [];
  }
}
