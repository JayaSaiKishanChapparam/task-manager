import { useEffect } from 'react';
import { useStore } from '@/store';
import { Box, Typography, Alert } from '@mui/material';
import { ProjectCard } from '@/components/ProjectList/ProjectCard';
import { CreateProjectDialog } from '@/components/ProjectList/CreateProjectDialog';
import { DeleteProjectDialog } from '@/components/ProjectList/DeleteProjectDialog';
import Grid from '@mui/material/Grid';

export function ProjectsPage() {
  const { projects, loading, error, fetchProjects } = useStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          height: '50vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">Loading projects...</Typography>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h3" fontWeight="bold">
            Projects
          </Typography>
          <Typography color="text.secondary">
            Manage your projects and their tasks
          </Typography>
        </Box>
        <CreateProjectDialog />
      </Box>

      <DeleteProjectDialog />

      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={project.id}>
            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
