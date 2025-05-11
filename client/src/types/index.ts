export interface Project {
  id: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  configuration: {
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    completed: boolean;
  };
  created_at: Date;
  updated_at: Date;
}

export interface ChangeEvent {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'PROJECT' | 'TASK';
  payload: Project | Task;
  client_id: string;
  timestamp: number;
}
