import type { Socket } from 'socket.io-client';
import type { Project, Task, ChangeEvent } from '../types';

export interface Store {
  projects: Project[];
  tasks: Record<string, Task[]>;
  loading: boolean;
  error: string | null;
  socket: typeof Socket;
  lastSyncTimestamp: number;
  projectToDelete: string | null;
  processedEvents: Set<number>;
  fetchProjects: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  fetchTasks: (projectId: string) => Promise<void>;
  addProject: (description: string) => Promise<void>;
  addTask: (
    projectId: string,
    title: string,
    configuration: Task['configuration']
  ) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string, projectId: string) => Promise<void>;
  deleteTasks: (taskIds: string[], projectId: string) => Promise<void>;
  syncEvents: () => Promise<void>;
  handleChangeEvent: (event: ChangeEvent) => void;
  setProjectToDelete: (projectId: string | null) => void;
}
