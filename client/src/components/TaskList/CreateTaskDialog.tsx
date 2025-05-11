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
import { useState } from 'react';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    description: string,
    priority: Task['configuration']['priority']
  ) => void;
}

export function CreateTaskDialog({
  open,
  onClose,
  onSubmit,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] =
    useState<Task['configuration']['priority']>('MEDIUM');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit(title, description, priority);
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Title"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <TextField
            fullWidth
            label="Description"
            placeholder="Task description"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) =>
                setPriority(e.target.value as Task['configuration']['priority'])
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
        <Button variant="contained" onClick={handleSubmit}>
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}
