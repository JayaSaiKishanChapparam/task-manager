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
  if (event.client_id === socket.id) {
    return;
  }

  set((state) => {
    if (state.processedEvents.has(event.id)) {
      return state;
    }

    state.processedEvents.add(event.id);

    switch (event.entity) {
      case 'PROJECT': {
        const project = event.payload as Project;
        if (event.type === 'CREATE') {
          return {
            ...state,
            projects: [...state.projects, project],
          };
        } else if (event.type === 'UPDATE') {
          return {
            ...state,
            projects: state.projects.map((p) =>
              p.id === project.id ? project : p
            ),
          };
        } else if (event.type === 'DELETE') {
          return {
            ...state,
            projects: state.projects.filter((p) => p.id !== project.id),
            tasks: Object.fromEntries(
              Object.entries(state.tasks).filter(([pid]) => pid !== project.id)
            ),
          };
        }
        break;
      }

      case 'TASK': {
        const task = event.payload as Task;
        switch (event.type) {
          case 'CREATE':
            return {
              ...state,
              tasks: {
                ...state.tasks,
                [task.project_id]: [
                  ...(state.tasks[task.project_id] || []),
                  task,
                ],
              },
            };

          case 'UPDATE':
            return {
              ...state,
              tasks: updateTasksForProject(
                state.tasks,
                task.project_id,
                (tasks) => updateTaskInList(tasks, task.id, task)
              ),
            };

          case 'DELETE':
            return {
              ...state,
              tasks: updateTasksForProject(
                state.tasks,
                task.project_id,
                (tasks) => removeTaskFromList(tasks, task.id)
              ),
            };
        }
        break;
      }
    }
    return state;
  });
};
