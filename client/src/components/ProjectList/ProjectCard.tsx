import { useNavigate } from 'react-router-dom';
import type { Project } from '@/types';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useStore } from '@/store';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const { setProjectToDelete } = useStore();

  const handleCardClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('.delete-button')) {
      return;
    }
    navigate(`/projects/${project.id}`);
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        minHeight: '100px',
        '&:hover': {
          boxShadow: 3,
          '& .MuiButton-root': {
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
      }}
      onClick={handleCardClick}
    >
      <CardHeader
        title={
          <Typography
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project.description}
          </Typography>
        }
        action={
          <IconButton
            className="delete-button"
            onClick={() => setProjectToDelete(project.id)}
            color="error"
            size="small"
          >
            <Delete />
          </IconButton>
        }
      />
      <CardContent>
        <Button
          variant="outlined"
          fullWidth
          sx={{
            transform: 'translateY(10px)',
            opacity: 0,
            transition: 'all 0.2s',
          }}
        >
          View Tasks
        </Button>
      </CardContent>
    </Card>
  );
}
