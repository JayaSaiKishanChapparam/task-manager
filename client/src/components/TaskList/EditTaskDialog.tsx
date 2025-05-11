import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { Task } from '@/types';
import { useState, useEffect } from 'react';

interface EditTaskDialogProps {
  task: Task | null;
  onClose: () => void;
  onSubmit: (task: Task) => void;
}

export function EditTaskDialog({
  task,
  onClose,
  onSubmit,
}: EditTaskDialogProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!editedTask) return null;

  return (
    <Dialog open={Boolean(task)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Title"
            value={editedTask.title}
            onChange={(e) =>
              setEditedTask({
                ...editedTask,
                title: e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={editedTask.configuration.description}
            onChange={(e) =>
              setEditedTask({
                ...editedTask,
                configuration: {
                  ...editedTask.configuration,
                  description: e.target.value,
                },
              })
            }
          />
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={editedTask.configuration.priority}
              label="Priority"
              onChange={(e) =>
                setEditedTask({
                  ...editedTask,
                  configuration: {
                    ...editedTask.configuration,
                    priority: e.target
                      .value as Task['configuration']['priority'],
                  },
                })
              }
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSubmit(editedTask)}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
