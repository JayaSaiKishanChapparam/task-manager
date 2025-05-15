import { useEffect } from 'react';
import { useStore } from '@/store';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { KeyboardArrowLeft } from '@mui/icons-material';
import { TaskList } from '@/components/TaskList/TaskList';

const ProjectDetailPage = () => {
  const { projects, fetchTasks } = useStore();
  const navigate = useNavigate();
  const { projectId } = useParams();

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
    }
  }, [projectId, fetchTasks]);

  const currentProject = projectId
    ? projects.find((p) => p.id === projectId)
    : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2,
        }}
      >
        <Box>
          <Button
            startIcon={<KeyboardArrowLeft />}
            onClick={() => navigate('/')}
            sx={{ ml: -1 }}
          >
            Back to Projects
          </Button>
          <Typography variant="h4" sx={{ mt: 1 }}>
            {currentProject?.description}
          </Typography>
        </Box>
      </Box>
      {projectId && <TaskList projectId={projectId} />}
    </Box>
  );
};
export default ProjectDetailPage;
