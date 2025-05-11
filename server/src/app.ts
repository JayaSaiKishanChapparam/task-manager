import express, { RequestHandler } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { ProjectController } from './controllers/projectController';
import { TaskController } from './controllers/taskController';
import './db';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  connectTimeout: 10000,
  pingTimeout: 5000,
  pingInterval: 10000,
});

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT ?? 3000;

const projectController = new ProjectController(io);
const taskController = new TaskController();

// Add project routes
app.post(
  '/api/projects',
  projectController.createProject.bind(projectController) as RequestHandler
);
app.get(
  '/api/projects',
  projectController.getProjects.bind(projectController) as RequestHandler
);
app.delete(
  '/api/projects/:id',
  projectController.deleteProject.bind(projectController) as RequestHandler
);

// Add task routes
app.post(
  '/api/projects/:projectId/tasks',
  taskController.createTask.bind(taskController) as RequestHandler
);
app.get(
  '/api/projects/:projectId/tasks',
  taskController.getTasks.bind(taskController) as RequestHandler
);
app.put(
  '/api/tasks/:id',
  taskController.updateTask.bind(taskController) as RequestHandler
);
app.delete(
  '/api/tasks/:id',
  taskController.deleteTask.bind(taskController) as RequestHandler
);
app.get(
  '/api/events',
  taskController.getEvents.bind(taskController) as RequestHandler
);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  let pingInterval: NodeJS.Timeout;

  pingInterval = setInterval(() => {
    socket.emit('ping');
  }, 25000);

  socket.on('pong', () => {
    socket.emit('pong-ack');
  });

  socket.on('project:change', (changeEvent) => {
    socket.broadcast.emit('project:change', changeEvent);
  });

  socket.on('task:change', (changeEvent) => {
    socket.broadcast.emit('task:change', changeEvent);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected (${reason}):`, socket.id);
    clearInterval(pingInterval);
  });
});

const cleanup = () => {
  console.log('Shutting down server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      'Could not close connections in time, forcefully shutting down'
    );
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
