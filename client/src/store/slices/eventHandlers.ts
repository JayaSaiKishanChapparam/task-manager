import type { ChangeEvent, Project, Task } from '../../types';
import type { StoreApi } from 'zustand';
import type { Store } from '../types';
import {
  updateTasksForProject,
  updateTaskInList,
  removeTaskFromList,
} from '../utils/helpers';
import { socket } from '../config/socket';

export const handleChangeEvent = (
  event: ChangeEvent,
  set: StoreApi<Store>['setState']
) => {
  // Ignore events from the current client to prevent duplicate handling
  if (event.client_id === socket.id) {
    return;
  }

  switch (event.entity) {
    case 'PROJECT': {
      const project = event.payload as Project;
      if (event.type === 'CREATE') {
        set((state) => ({
          projects: [...state.projects, project],
        }));
      } else if (event.type === 'UPDATE') {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === project.id ? project : p
          ),
        }));
      } else if (event.type === 'DELETE') {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== project.id),
          tasks: Object.fromEntries(
            Object.entries(state.tasks).filter(([pid]) => pid !== project.id)
          ),
        }));
      }
      break;
    }

    case 'TASK': {
      const task = event.payload as Task;
      switch (event.type) {
        case 'CREATE':
          set((state) => ({
            tasks: {
              ...state.tasks,
              [task.project_id]: [
                ...(state.tasks[task.project_id] || []),
                task,
              ],
            },
          }));
          break;

        case 'UPDATE':
          set((state) => ({
            tasks: updateTasksForProject(
              state.tasks,
              task.project_id,
              (tasks) => updateTaskInList(tasks, task.id, task)
            ),
          }));
          break;

        case 'DELETE':
          set((state) => ({
            tasks: updateTasksForProject(
              state.tasks,
              task.project_id,
              (tasks) => removeTaskFromList(tasks, task.id)
            ),
          }));
          break;
      }
      break;
    }
  }
};
