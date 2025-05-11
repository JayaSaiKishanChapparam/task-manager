# Task Manager

A real-time collaborative task management application built with React, Node.js, and PostgreSQL.

## Features

- Real-time collaboration using WebSocket
- Project-based task organization
- Priority-based task management
- Optimistic UI updates with conflict resolution
- Event-driven architecture for sync
- Dark mode UI with Material Design

## Architecture

### Tech Stack

- **Frontend**: React + TypeScript + Vite

  - Zustand for state management
  - Material-UI for components
  - Socket.IO client for real-time updates
  - Axios for HTTP requests

- **Backend**: Node.js + TypeScript + Express
  - Socket.IO for WebSocket communication
  - PostgreSQL for data persistence
  - Event-sourcing pattern for sync

### Sync Strategy

The application uses a hybrid approach for data synchronization:

1. **Real-time Updates**:

   - WebSocket connections for immediate sync across clients
   - Event-based architecture to broadcast changes
   - Client-side optimistic updates with server validation

2. **Event Sourcing**:

   - All changes are stored as events in the database
   - Clients can resync missed updates using timestamp-based polling
   - Conflict resolution using client IDs and timestamps

3. **Connection Handling**:
   - Automatic reconnection with exponential backoff
   - Event queue for offline changes
   - Heartbeat mechanism to detect stale connections

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Local Setup

1. Clone the repository:

```bash
git clone https://github.com/JayaSaiKishanChapparam/task-manager.git
cd task-manager
```

2. Create a PostgreSQL database:

```bash
createdb taskmanager
```

3. Set up the server:

```bash
cd server
cp .env.example .env  # Configure your environment variables
npm install
npm run dev
```

4. Set up the client:

```bash
cd ../client
cp .env.example .env  # Configure your environment variables
npm install
npm run dev
```

### Docker Setup

1. Build and run using Docker Compose:

```bash
docker-compose up -d
```

This will start:

- PostgreSQL database
- Backend API server
- Frontend development server

Access the application at http://localhost:5173

## Scaling Considerations

### Current Limitations

- Single server instance
- Basic PostgreSQL setup
- In-memory Socket.IO adapter
- No caching layer

### Scaling Strategy

1. **Horizontal Scaling**:

   - Use Redis for Socket.IO adapter to support multiple server instances
   - Implement load balancing with sticky sessions
   - Add read replicas for PostgreSQL

2. **Performance Optimizations**:

   - Implement Redis caching layer
   - Batch database operations
   - Optimize WebSocket payload size
   - Use connection pooling for database

3. **Monitoring and Reliability**:
   - Add health checks
   - Implement circuit breakers
   - Set up logging and monitoring
   - Add rate limiting

## Trade-offs and Decisions

1. **Event Sourcing**:

   - Pros: Complete audit trail, reliable sync
   - Cons: Additional storage, complexity in event handling

2. **Optimistic Updates**:

   - Pros: Better user experience, reduced latency
   - Cons: Potential conflicts, more complex state management

3. **PostgreSQL**:

   - Pros: ACID compliance, JSON support
   - Cons: Vertical scaling limitations

4. **Zustand over Redux**:
   - Pros: Simpler API, smaller bundle size
   - Cons: Less ecosystem, fewer dev tools

## Future Improvements

1. Add authentication and user management
2. Implement file attachments for tasks
3. Add project templates and task categories
4. Implement activity logs and notifications
5. Add data export/import functionality
