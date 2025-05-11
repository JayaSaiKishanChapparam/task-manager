import { useState } from 'react';
import { useStore } from '@/store';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { TaskItem } from './TaskItem';
import { CreateTaskDialog } from './CreateTaskDialog';
import { EditTaskDialog } from './EditTaskDialog';
import type { Task } from '@/types';

interface TaskListProps {
  projectId: string;
}

export function TaskList({ projectId }: TaskListProps) {
  const {
    tasks,
    loading,
    error,
    addTask,
    deleteTask,
    deleteTasks,
    updateTask,
  } = useStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const projectTasks = tasks[projectId] ?? [];

  const handleCreateTask = async (
    title: string,
    description: string,
    priority: Task['configuration']['priority']
  ) => {
    await addTask(projectId, title, {
      priority,
      description,
      completed: false,
    });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateTask = async (task: Task) => {
    await updateTask(task.id, task);
    setEditingTask(null);
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAllTasks = () => {
    if (selectedTasks.size === projectTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(projectTasks.map((task) => task.id)));
    }
  };

  const handleToggleComplete = (task: Task) => {
    updateTask(task.id, {
      ...task,
      configuration: {
        ...task.configuration,
        completed: !task.configuration.completed,
      },
    });
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size > 0) {
      await deleteTasks(Array.from(selectedTasks), projectId);
      setSelectedTasks(new Set());
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5">Tasks</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {selectedTasks.size > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedTasks.size})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateTask}
      />

      <EditTaskDialog
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
      />

      <Paper elevation={0} variant="outlined">
        <List sx={{ width: '100%' }}>
          {projectTasks.length > 0 && (
            <ListItem
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Checkbox
                checked={selectedTasks.size === projectTasks.length}
                indeterminate={
                  selectedTasks.size > 0 &&
                  selectedTasks.size < projectTasks.length
                }
                onChange={handleSelectAllTasks}
                sx={{ mr: 1 }}
              />
              <ListItemText primary="Select All" />
            </ListItem>
          )}
          {projectTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              selected={selectedTasks.has(task.id)}
              onSelect={handleSelectTask}
              onEdit={setEditingTask}
              onDelete={(taskId) => deleteTask(taskId, projectId)}
              onToggleComplete={handleToggleComplete}
            />
          ))}
          {projectTasks.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No tasks yet"
                secondary="Create a new task to get started"
                sx={{ textAlign: 'center', py: 4 }}
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}
