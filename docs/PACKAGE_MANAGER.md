# Package Manager Configuration

This project uses **pnpm** as the package manager for better performance and dependency management.

## Installation

### Prerequisites
```bash
# Install pnpm globally
npm install -g pnpm
```

### Setup
```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Testing
pnpm test
pnpm test:run

# Performance Analysis
pnpm build:analyze
pnpm perf:audit
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm build:dev` | Build for development |
| `pnpm build:analyze` | Build and analyze bundle |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm test:ui` | Run tests with UI |
| `pnpm perf:audit` | Run Lighthouse audit |
| `pnpm perf:monitor` | Enable performance monitoring |

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables as needed:
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:8000/api)
- `VITE_APP_NAME`: Application name
- `VITE_APP_ENV`: Environment (development/production)

## Package Manager Benefits

### Why pnpm?
- **Faster installations**: Shared dependency store
- **Disk space efficient**: Hard links instead of copies
- **Strict dependency resolution**: Better security
- **Monorepo support**: Native workspace support

### Migration from npm
If you have `package-lock.json`, remove it and use pnpm:
```bash
rm package-lock.json
pnpm install
```

## Development Workflow

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Run tests (in another terminal)
pnpm test

# 4. Build for production
pnpm build

# 5. Preview production build
pnpm preview
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Frontend runs on 8081 if 8080 is occupied
2. **API connection**: Ensure backend is running on port 8000
3. **Dependencies**: Use `pnpm install` instead of `npm install`

### Performance
- Use `pnpm build:analyze` to check bundle size
- Enable performance monitor in development
- Run `pnpm perf:audit` for Lighthouse analysis