# Docker Setup for Vyapar 360 Frontend

This guide will help you build and run the Vyapar 360 frontend application using Docker.

## Prerequisites

- Docker installed on your machine ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose installed (comes with Docker Desktop)

## Quick Start

### Production Build

1. **Build the Docker image:**

   ```bash
   docker build -t vyapar360-frontend:latest .
   ```

2. **Run the container:**

   ```bash
   docker run -p 3000:3000 vyapar360-frontend:latest
   ```

3. **Access the app:**
   Open http://localhost:3000 in your browser

### Using Docker Compose (Production)

```bash
docker-compose up -d
```

This will:

- Build the image
- Start the container on port 3000
- Set up networking
- Enable automatic restart on failure

## Development Setup

### Using Docker Compose with Hot Reload

```bash
docker-compose -f docker-compose.dev.yml up
```

This starts the development server with:

- Hot module reloading (HMR)
- Volume mounts for live code editing
- Development environment configuration

### Stop the Development Server

```bash
docker-compose -f docker-compose.dev.yml down
```

## Commands Reference

### Production Container

| Command                                             | Description                              |
| --------------------------------------------------- | ---------------------------------------- |
| `docker build -t vyapar360-frontend:latest .`       | Build the production image               |
| `docker run -p 3000:3000 vyapar360-frontend:latest` | Run the production container             |
| `docker-compose up -d`                              | Start production container in background |
| `docker-compose down`                               | Stop and remove production container     |
| `docker-compose logs -f`                            | View production container logs           |

### Development Container

| Command                                            | Description                       |
| -------------------------------------------------- | --------------------------------- |
| `docker-compose -f docker-compose.dev.yml up`      | Start development with hot reload |
| `docker-compose -f docker-compose.dev.yml down`    | Stop development container        |
| `docker-compose -f docker-compose.dev.yml logs -f` | View development logs             |

### Useful Docker Commands

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker logs <container-id>

# Follow container logs in real-time
docker logs -f <container-id>

# Execute command in running container
docker exec -it <container-id> /bin/sh

# Remove image
docker rmi vyapar360-frontend:latest

# Stop all containers
docker stop $(docker ps -q)

# Remove all stopped containers
docker container prune
```

## Environment Variables

### Production

- `NODE_ENV=production`

### Development

- `NODE_ENV=development`

Add environment variables to `.env` file and they will be passed to the container.

## Dockerfile Explanation

### Production Dockerfile

- **Multi-stage build:** Reduces final image size by separating build and runtime stages
- **Node 18 Alpine:** Lightweight Linux distribution for smaller image size
- **Serve:** Used to serve the built React application
- **Health check:** Monitors container health every 30 seconds

### Development Dockerfile

- **Single stage:** Simpler setup for development
- **npm start:** Runs the development server with hot reload
- **Volume mounts:** Code changes are reflected immediately

## Networking

The compose files set up a `vyapar-network` for internal service communication if needed in the future (for example, connecting to a backend API container).

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
docker run -p 8080:3000 vyapar360-frontend:latest
# Then access http://localhost:8080
```

### Clear Docker Cache

```bash
docker system prune -a
```

### Rebuild Without Cache

```bash
docker build --no-cache -t vyapar360-frontend:latest .
```

### View Build Process

```bash
docker build -t vyapar360-frontend:latest . --progress=plain
```

## Best Practices

1. **Use .dockerignore:** Reduces build context size and build time
2. **Multi-stage builds:** Keeps final image lean (production)
3. **Specific Node version:** Ensures consistency across environments
4. **Health checks:** Helps Docker Compose manage containers effectively
5. **Alpine Linux:** Provides smaller, more secure base images

## Next Steps

- Push image to Docker Registry (Docker Hub, AWS ECR, etc.)
- Deploy to Kubernetes or Container Orchestration platform
- Set up CI/CD pipeline for automated builds
- Configure environment-specific compose files
