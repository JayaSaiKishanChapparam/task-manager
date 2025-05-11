import { Manager } from 'socket.io-client';
import { useStore } from '../index';
import type { ChangeEvent } from '../../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';
const API_URL = `${SOCKET_URL}/api`;

const manager = new Manager(SOCKET_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
});

export const socket = manager.socket('/');

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
  useStore
    .getState()
    .syncEvents()
    .catch((error) => {
      console.error('Failed to sync events on connect:', error);
      useStore.getState().error = 'Failed to sync with server';
    });
});

socket.on('disconnect', (reason: string) => {
  console.log('Socket disconnected:', reason);
  if (reason === 'io server disconnect') {
    socket.connect();
  }
});

socket.on('connect_error', (error: Error) => {
  console.error('Socket connection error:', error);
  useStore.getState().error = 'Connection error: ' + error.message;
});

socket.on('reconnect_failed', () => {
  console.error('Socket reconnection failed after maximum attempts');
  useStore.getState().error =
    'Failed to reconnect to server after multiple attempts';
});

socket.on('ping', () => {
  socket.emit('pong');
});

socket.on('pong-ack', () => {
  // Connection is healthy
});

socket.on('project:change', (event: ChangeEvent) => {
  if (event.client_id !== socket.id) {
    useStore.getState().handleChangeEvent(event);
  }
});

socket.on('task:change', (event: ChangeEvent) => {
  if (event.client_id !== socket.id) {
    useStore.getState().handleChangeEvent(event);
  }
});

export { API_URL };
