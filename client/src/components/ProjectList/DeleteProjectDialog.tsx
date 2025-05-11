import { useStore } from '@/store';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

export function DeleteProjectDialog() {
  const { projectToDelete, setProjectToDelete, deleteProject } = useStore();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      setIsDeleting(true);
      await deleteProject(projectToDelete);
      if (projectId === projectToDelete) {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };

  return (
    <Dialog
      open={Boolean(projectToDelete)}
      onClose={() => !isDeleting && setProjectToDelete(null)}
    >
      <DialogTitle>Delete Project</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this project? This will also delete
          all tasks associated with it.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setProjectToDelete(null)} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={isDeleting}
          startIcon={
            isDeleting && <CircularProgress size={20} color="inherit" />
          }
        >
          {isDeleting ? 'Deleting...' : 'Delete Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
