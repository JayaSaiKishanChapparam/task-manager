import { Request, Response } from 'express';
import { pool } from '../db';
import { safeSerialize } from '../utils';

export class TaskController {
  createTask = async (req: Request, res: Response) => {
    try {
      const { projectId, title, configuration } = req.body;
      const result = await pool.query(
        'INSERT INTO tasks (project_id, title, configuration) VALUES ($1, $2, $3) RETURNING *',
        [
          projectId,
          title,
          {
            ...configuration,
            completed: configuration.completed ?? false,
          },
        ]
      );

      const safePayload = safeSerialize(result.rows[0]);

      // Record the event
      await pool.query(
        'INSERT INTO events (type, entity, payload, client_id, timestamp) VALUES ($1, $2, $3, $4, $5)',
        ['CREATE', 'TASK', safePayload, req.body.client_id, Date.now()]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  };

  getTasks = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const result = await pool.query(
        'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC',
        [projectId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  };

  updateTask = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Get current task
      const currentTask = await pool.query(
        'SELECT * FROM tasks WHERE id = $1',
        [id]
      );

      if (currentTask.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Merge existing configuration with updates
      const newConfiguration = {
        ...currentTask.rows[0].configuration,
        ...(updates.configuration ?? {}),
      };

      const result = await pool.query(
        'UPDATE tasks SET title = COALESCE($1, title), configuration = $2 WHERE id = $3 RETURNING *',
        [updates.title ?? currentTask.rows[0].title, newConfiguration, id]
      );

      const safePayload = safeSerialize(result.rows[0]);

      // Record the event
      await pool.query(
        'INSERT INTO events (type, entity, payload, client_id, timestamp) VALUES ($1, $2, $3, $4, $5)',
        ['UPDATE', 'TASK', safePayload, req.body.client_id, Date.now()]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  };

  deleteTask = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const safePayload = safeSerialize(result.rows[0]);

      // Record the event
      await pool.query(
        'INSERT INTO events (type, entity, payload, client_id, timestamp) VALUES ($1, $2, $3, $4, $5)',
        ['DELETE', 'TASK', safePayload, req.body.client_id, Date.now()]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  };

  getEvents = async (req: Request, res: Response) => {
    try {
      const { timestamp } = req.query;
      const result = await pool.query(
        'SELECT * FROM events WHERE timestamp > $1 ORDER BY timestamp ASC',
        [timestamp]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  };
}
