import {
  Box,
  IconButton,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  selected: boolean;
  onSelect: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (task: Task) => void;
}

const getPriorityColor = (priority: Task['configuration']['priority']) => {
  switch (priority) {
    case 'HIGH':
      return 'error.main';
    case 'LOW':
      return 'success.main';
    default:
      return 'warning.main';
  }
};

export function TaskItem({
  task,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskItemProps) {
  return (
    <ListItem
      key={task.id}
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton edge="end" onClick={() => onEdit(task)} color="primary">
            <Typography variant="button">Edit</Typography>
          </IconButton>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => onDelete(task.id)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      }
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      <Checkbox
        checked={selected}
        onChange={() => onSelect(task.id)}
        sx={{ mr: 1 }}
        color={task.configuration.completed ? 'success' : 'default'}
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(task);
        }}
      />
      <ListItemText
        primary={task.title}
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              {task.configuration.description}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              sx={{
                color: getPriorityColor(task.configuration.priority),
              }}
            >
              {task.configuration.priority}
            </Typography>
          </>
        }
        sx={{
          textDecoration: task.configuration.completed
            ? 'line-through'
            : 'none',
          color: task.configuration.completed
            ? 'text.secondary'
            : 'text.primary',
        }}
      />
    </ListItem>
  );
}
