export interface Incident {
  id: string;
  title: string;
  description?: string;
  type_id: string;
  type_name: string;
  type_icon: string;
  type_color: string;
  type_category: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high" | "urgent";
  reported_by?: string;
  reported_at: string;
  updated_at: string;
  votes: number;
  views: number;
  photos?: string;
  tags?: string;
}

export interface CreateIncidentData {
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
  priority?: "low" | "medium" | "high" | "urgent";
  reportedBy?: string;
  photos?: string[];
  tags?: string[];
}

export interface Statistics {
  total_incidents: number;
  pending_incidents: number;
  in_progress_incidents: number;
  resolved_incidents: number;
  updated_at: string;
}

export interface Notification {
  id: string;
  incident_id?: string;
  type: "new_incident" | "status_change" | "system";
  title: string;
  message: string;
  created_at: string;
  read_at?: string;
}
