import { Request, Response } from 'express';
import { pool } from '../db';
import { Server } from 'socket.io';
import { safeSerialize } from '../utils';

export class ProjectController {
  private readonly io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  createProject = async (req: Request, res: Response) => {
    try {
      const { description } = req.body;
      const result = await pool.query(
        'INSERT INTO projects (description) VALUES ($1) RETURNING *',
        [description]
      );

      const safePayload = safeSerialize(result.rows[0]);
      const event = {
        type: 'CREATE',
        entity: 'PROJECT',
        payload: safePayload,
        client_id: req.body.client_id,
        timestamp: Date.now(),
      };

      await pool.query(
        'INSERT INTO events (type, entity, payload, client_id, timestamp) VALUES ($1, $2, $3, $4, $5)',
        [
          event.type,
          event.entity,
          event.payload,
          event.client_id,
          event.timestamp,
        ]
      );

      // Broadcast the change to all connected clients
      this.io.emit('project:change', event);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  };

  getProjects = async (req: Request, res: Response) => {
    try {
      const result = await pool.query(
        'SELECT * FROM projects ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  };

  deleteProject = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'DELETE FROM projects WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const safePayload = safeSerialize(result.rows[0]);
      // Record the event and broadcast it
      const event = {
        type: 'DELETE',
        entity: 'PROJECT',
        payload: safePayload,
        client_id: req.body.client_id,
        timestamp: Date.now(),
      };

      await pool.query(
        'INSERT INTO events (type, entity, payload, client_id, timestamp) VALUES ($1, $2, $3, $4, $5)',
        [
          event.type,
          event.entity,
          event.payload,
          event.client_id,
          event.timestamp,
        ]
      );

      // Broadcast the change to all connected clients
      this.io.emit('project:change', event);

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  };
}
