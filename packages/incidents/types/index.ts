// Incident types
// TODO: Define incident-related types here

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

// Placeholder export to make this a valid module
export const incidentTypes = {};
