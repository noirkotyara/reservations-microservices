# Docker Configuration Guide

This project uses a consolidated Docker setup with best practices for both development and production environments.

## 📁 File Structure

```
.
├── Dockerfile                      # Multi-stage Dockerfile (dev + prod)
├── docker-compose.yml              # Base/Production configuration
├── docker-compose.override.yml     # Development overrides (auto-loaded)
└── .dockerignore                   # Files excluded from Docker context
```

## 📊 Technical Details

### Dockerfile Stages

```
┌─────────────────────────────────────────────────┐
│                    base                         │
│  (Node 20 Alpine + pnpm + package files)       │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴─────────┐
        │                    │
┌───────▼────────┐   ┌──────▼────────────┐
│  dependencies  │   │   development     │
│  (all deps)    │   │  (hot reload)     │
└───────┬────────┘   └───────────────────┘
        │
┌───────▼────────┐
│    builder     │
│  (build app)   │
└───────┬────────┘
        │
┌───────▼────────┐
│   production   │
│  (optimized)   │
└────────────────┘
```

### Docker Compose Structure

```
docker-compose.yml               # Base (Production)
    ├── mongodb service
    └── app service

docker-compose.override.yml      # Development (Auto-loaded)
    ├── mongodb overrides
    └── app overrides
        ├── Volume mounts
        ├── Debug port
        └── Development command
```

---

## 🚀 Quick Start

### Development Mode

```bash
# Start all services in development mode (automatically uses override file)
docker compose up

# Or with rebuild
docker compose up --build

# Run in detached mode
docker compose up -d

# View logs
docker compose logs -f app
```

### Production Mode

```bash
# Start in production mode (excludes override file)
docker compose -f docker-compose.yml up

# Or with rebuild
docker compose -f docker-compose.yml up --build

# Run in detached mode
docker compose -f docker-compose.yml up -d
```

## 🏗️ Dockerfile Stages

The multi-stage Dockerfile includes the following build targets:

### 1. **base**

- Common setup for all environments
- Node.js 20 Alpine
- pnpm installation

### 2. **dependencies**

- Installs all dependencies (dev + prod)
- Used as a base for both dev and build stages

### 3. **development** (Target for dev)

- Includes all dev dependencies
- Hot reload support via volume mounts
- Debugger port exposed (9229)
- Command: `pnpm run start:debug`

### 4. **builder**

- Builds the application
- Prunes dev dependencies

### 5. **production** (Target for prod)

- Optimized production image
- Only production dependencies
- Non-root user for security
- Health check configured
- Command: `node dist/apps/reservations/main`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Application
APP_PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_PORT=27017
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password
MONGO_DATABASE=reservations

# Debug (Development only)
DEBUG_PORT=9229
```

### Port Mappings

| Service | Development | Production |
| ------- | ----------- | ---------- |
| App     | 3000        | 3000       |
| MongoDB | 27017       | 27017      |
| Debug   | 9229        | N/A        |

## 🔍 Key Features

### Development Mode

- **Hot Reload**: Source code mounted as volume for instant updates
- **Debugging**: Node.js debugger available on port 9229
- **Separate Volumes**: Dev data doesn't interfere with production
- **Fast Iteration**: No rebuild needed for code changes

### Production Mode

- **Multi-stage Build**: Smaller final image size
- **Security**: Runs as non-root user (nestjs:nodejs)
- **Health Checks**: Automatic container health monitoring
- **Optimized**: Only production dependencies included
- **Immutable**: Built artifacts, no source code mounted

## 📋 Common Commands

### General

```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# View running containers
docker compose ps

# Execute command in running container
docker compose exec app sh

# View logs
docker compose logs -f [service]
```

### Development

```bash
# Rebuild only app service
docker compose build app

# Restart app service
docker compose restart app

# Install new dependencies (requires rebuild)
docker compose up --build app
```

### Production

```bash
# Build production image
docker compose -f docker-compose.yml build

# Push to registry
docker tag reservations-app:latest your-registry/reservations-app:latest
docker push your-registry/reservations-app:latest

# Deploy (on production server)
docker compose -f docker-compose.yml pull
docker compose -f docker-compose.yml up -d
```

### Cleanup

```bash
# Remove all stopped containers
docker compose rm

# Remove unused images
docker image prune -a

# Remove development volumes
docker volume rm reservations_mongodb_data_dev reservations_mongodb_config_dev

# Remove production volumes (⚠️ careful!)
docker volume rm reservations_mongodb_data reservations_mongodb_config
```

## 🐛 Debugging

### Attach Debugger (Development)

1. Start services in development mode:

   ```bash
   docker compose up
   ```

2. Attach your IDE debugger to `localhost:9229`

### VS Code Launch Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Docker: Attach to Node",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app",
      "protocol": "inspector",
      "restart": true
    }
  ]
}
```

## 🔐 Security Best Practices

✅ **Implemented:**

- Multi-stage builds to minimize image size
- Non-root user in production
- Health checks for container monitoring
- Separate networks for dev/prod
- `.dockerignore` to exclude sensitive files
- Minimal base image (Alpine)

## 📊 Performance Tips

1. **Layer Caching**: Dependencies are installed before source code copy
2. **Build Context**: Use `.dockerignore` to exclude unnecessary files
3. **pnpm**: Faster package manager with better disk usage
4. **Alpine Linux**: Smaller base image (~5MB vs ~200MB)

## 📚 Additional Resources

- [Docker Compose Override Documentation](https://docs.docker.com/compose/extends/)
- [Multi-stage Build Best Practices](https://docs.docker.com/build/building/multi-stage/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🆘 Troubleshooting

### Issue: Changes not reflecting in development

**Solution:**

```bash
docker compose down
docker compose up --build
```

### Issue: Permission denied errors

**Solution:** Check volume mounts and file permissions on host

### Issue: Port already in use

**Solution:**

```bash
# Find process using port
lsof -i :3000
# Kill process or change APP_PORT in .env
```

### Issue: MongoDB connection fails

**Solution:**

```bash
# Check MongoDB is healthy
docker compose ps
# View MongoDB logs
docker compose logs mongodb
# Restart MongoDB
docker compose restart mongodb
```

---

**Need help?** Check the main README.md or open an issue.
