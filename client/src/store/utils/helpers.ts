import { AxiosError } from 'axios';
import type { Task } from '../../types';

export const handleError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.error ?? error.message;
  }
  return error instanceof Error ? error.message : 'An unknown error occurred';
};

export const updateTaskInList = (
  tasks: Task[],
  taskId: string,
  updatedTask: Task
) => tasks.map((task) => (task.id === taskId ? updatedTask : task));

export const removeTaskFromList = (tasks: Task[], taskId: string) =>
  tasks.filter((task) => task.id !== taskId);

export const filterDeletedTasks = (tasks: Task[], taskIds: string[]) =>
  tasks.filter((task) => !taskIds.includes(task.id));

export const updateTasksForProject = (
  tasks: Record<string, Task[]>,
  projectId: string,
  updater: (tasks: Task[]) => Task[]
) => {
  const entries = Object.entries(tasks).map(([pid, projectTasks]) => [
    pid,
    pid === projectId ? updater(projectTasks) : projectTasks,
  ]);
  return Object.fromEntries(entries);
};
