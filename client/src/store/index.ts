import { create } from 'zustand';
import axios from 'axios';
import type { Project, Task, ChangeEvent } from '../types';
import type { Store } from './types';
import { socket, API_URL } from './config/socket';
import {
  handleError,
  updateTasksForProject,
  removeTaskFromList,
  filterDeletedTasks,
} from './utils/helpers';
import { handleChangeEvent } from './slices/eventHandlers';

export const useStore = create<Store>((set, get) => ({
  projects: [],
  tasks: {},
  loading: false,
  error: null,
  socket,
  lastSyncTimestamp: Date.now(),
  projectToDelete: null,

  setProjectToDelete: (projectId: string | null) =>
    set({ projectToDelete: projectId }),

  fetchProjects: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get<Project[]>(`${API_URL}/projects`);
      set({ projects: response.data, loading: false });
    } catch (error) {
      set({ error: handleError(error), loading: false });
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.delete<Project>(
        `${API_URL}/projects/${projectId}`,
        {
          data: { client_id: socket.id },
        }
      );
      const deletedProject = response.data;

      const event: ChangeEvent = {
        type: 'DELETE',
        entity: 'PROJECT',
        payload: deletedProject,
        client_id: socket.id,
        timestamp: Date.now(),
      };

      socket.emit('project:change', event);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        tasks: Object.fromEntries(
          Object.entries(state.tasks).filter(([pid]) => pid !== projectId)
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: handleError(error), loading: false });
    }
  },

  fetchTasks: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get<Task[]>(
        `${API_URL}/projects/${projectId}/tasks`
      );
      set((state) => ({
        tasks: { ...state.tasks, [projectId]: response.data },
        loading: false,
      }));
    } catch (error) {
      set({ error: handleError(error), loading: false });
    }
  },

  addProject: async (description: string) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post<Project>(`${API_URL}/projects`, {
        description,
        client_id: socket.id,
      });
      const project = response.data;

      const event: ChangeEvent = {
        type: 'CREATE',
        entity: 'PROJECT',
        payload: project,
        client_id: socket.id,
        timestamp: Date.now(),
      };

      socket.emit('project:change', event);
      set((state) => ({
        projects: [...state.projects, project],
        loading: false,
      }));
    } catch (error) {
      set({ error: handleError(error), loading: false });
    }
  },

  addTask: async (
    projectId: string,
    title: string,
    configuration: Task['configuration']
  ) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post<Task>(
        `${API_URL}/projects/${projectId}/tasks`,
        {
          projectId,
          title,
          configuration,
          client_id: socket.id,
        }
      );
      const task = response.data;

      const event: ChangeEvent = {
        type: 'CREATE',
        entity: 'TASK',
        payload: task,
        client_id: socket.id,
        timestamp: Date.now(),
      };

      socket.emit('task:change', event);
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: [...(state.tasks[projectId] || []), task],
        },
        loading: false,
      }));
    } catch (error) {
      set({ error: handleError(error), loading: false });
    }
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.put<Task>(`${API_URL}/tasks/${taskId}`, {
        ...updates,
        client_id: socket.id,
      });
      const updatedTask = response.data;

      const event: ChangeEvent = {
        type: 'UPDATE',
        entity: 'TASK',
        payload: updatedTask,
        client_id: socket.id,
        timestamp: Date.now(),
      };

      socket.emit('task:change', event);
      set((state) => ({
        tasks: updateTasksForProject(
          state.tasks,
          updatedTask.project_id,
          (tasks) =>
            tasks.map((task) => (task.id === taskId ? updatedTask : task))
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: handleError(error), loading: false });
    }
  },

  deleteTask: async (taskId: string, projectId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.delete<Task>(`${API_URL}/tasks/${taskId}`, {
        data: { client_id: socket.id },
      });
      const deletedTask = response.data;

      const event: ChangeEvent = {
        type: 'DELETE',
        entity: 'TASK',
        payload: deletedTask,
        client_id: socket.id,
        timestamp: Date.now(),
      };

      socket.emit('task:change', event);
      set((state) => ({
        tasks: updateTasksForProject(state.tasks, projectId, (tasks) =>
          removeTaskFromList(tasks, taskId)
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: handleError(error), loading: false });
    }
  },

  deleteTasks: async (taskIds: string[], projectId: string) => {
    try {
      set({ loading: true, error: null });

      for (const taskId of taskIds) {
        const response = await axios.delete<Task>(
          `${API_URL}/tasks/${taskId}`,
          {
            data: { client_id: socket.id },
          }
        );
        const deletedTask = response.data;

        const event: ChangeEvent = {
          type: 'DELETE',
          entity: 'TASK',
          payload: deletedTask,
          client_id: socket.id,
          timestamp: Date.now(),
        };

        socket.emit('task:change', event);
      }

      set((state) => ({
        tasks: updateTasksForProject(state.tasks, projectId, (tasks) =>
          filterDeletedTasks(tasks, taskIds)
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: handleError(error), loading: false });
    }
  },

  syncEvents: async () => {
    try {
      const { lastSyncTimestamp } = get();
      const response = await axios.get<ChangeEvent[]>(`${API_URL}/events`, {
        params: { timestamp: lastSyncTimestamp },
      });
      const events = response.data;

      events.forEach((event) => {
        if (event.client_id !== socket.id) {
          handleChangeEvent(event, set);
        }
      });

      set({ lastSyncTimestamp: Date.now() });
    } catch (error) {
      console.error('Failed to sync events:', handleError(error));
    }
  },

  handleChangeEvent: (event: ChangeEvent) => {
    handleChangeEvent(event, set);
  },
}));
