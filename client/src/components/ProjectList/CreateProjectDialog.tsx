import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import { AddCircle } from '@mui/icons-material';
import { useStore } from '@/store';

export function CreateProjectDialog() {
  const { addProject } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');

  const handleCreateProject = async () => {
    if (!description.trim()) return;
    await addProject(description);
    setDescription('');
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddCircle />}
        onClick={() => setIsOpen(true)}
      >
        New Project
      </Button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Add a new project to organize your tasks.
          </Typography>
          <TextField
            fullWidth
            placeholder="Project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateProject}>
            Create Project
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
