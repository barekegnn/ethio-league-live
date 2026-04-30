# Architecture Change: Separate Repository Approach

## Summary

The public football platform frontend has been redesigned to be a **completely separate repository** from the backend admin system, rather than a monorepo structure.

## What Changed

### Before (Monorepo)
- Single repository with `apps/admin` and `apps/public-platform`
- Shared `packages/` for database, types, and constants
- pnpm workspaces for dependency management
- Frontend had direct access to Prisma schema

### After (Separate Repositories)
- **Backend Repository:** `ethio-league` (admin system + public API)
- **Frontend Repository:** `ethio-league-public` (fan-facing platform)
- No shared code - API is the contract
- Frontend defines its own types based on API responses
- Complete independence for development and deployment

## Benefits

✅ **Independent Development** - Teams work without conflicts  
✅ **Independent Deployments** - Deploy frontend without backend changes  
✅ **Cleaner Codebase** - Each repo has single responsibility  
✅ **Simpler CI/CD** - Separate pipelines, faster builds  
✅ **Better Scalability** - Scale frontend/backend independently  
✅ **Clear Boundaries** - API is the contract between systems

## Updated Documents

### 1. requirements.md
- **Requirement 0** changed from "Monorepo Architecture" to "Separate Repository Architecture"
- Removed acceptance criteria about workspaces, shared packages, and monorepo structure
- Added acceptance criteria about separate repos, API communication, and CORS

### 2. design.md
- Removed monorepo folder structure with `apps/` and `packages/`
- Updated to show single frontend repository structure
- Added "Backend API Integration" section explaining REST API communication
- Removed Prisma from technology stack (frontend doesn't need it)
- Updated deployment architecture diagram to show separate deployments

### 3. tasks.md
- **Task 1** changed from "Set up monorepo structure" to "Initialize Next.js 14 project"
- Removed tasks about creating shared packages
- **Task 2** renumbered and updated (was Task 2.1-2.4, now Task 2.1-2.4)
- Added **Task 2.4**: Define TypeScript types for API responses
- Updated **Task 3.3**: API client now calls backend via environment variable

## How to Use These Specs

### Step 1: Create New Frontend Repository

```bash
# Create new directory
mkdir ethio-league-public
cd ethio-league-public

# Initialize git
git init

# Create remote repository on GitHub/GitLab
# Push to remote
```

### Step 2: Copy Spec Files

Copy these files from the backend repo to the new frontend repo:

```bash
# From backend repo
cp -r .kiro/specs/public-football-platform/* /path/to/ethio-league-public/.kiro/specs/

# Or manually copy:
# - requirements.md
# - design.md
# - tasks.md
# - .config.kiro
```

### Step 3: Follow Implementation Tasks

Start with Task 1 in `tasks.md` to initialize the Next.js project.

## Backend Requirements

The backend (current `ethio-league` repo) needs to:

1. **Expose public API endpoints** at `/api/*`
2. **Configure CORS** to allow requests from frontend domain
3. **Keep existing admin functionality** unchanged

Example CORS configuration:

```typescript
// Backend: middleware.ts
const allowedOrigins = [
  'http://localhost:3001',  // Local development
  'https://efl.et',         // Production
];

export function middleware(request: Request) {
  const origin = request.headers.get('origin');
  
  if (origin && allowedOrigins.includes(origin)) {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}
```

## Development Workflow

### Running Both Apps Locally

**Terminal 1 - Backend:**
```bash
cd ethio-league
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd ethio-league-public
npm run dev
# Runs on http://localhost:3001
```

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**Backend (.env):**
```env
DATABASE_URL=postgresql://...
FRONTEND_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3001,https://efl.et
```

## Deployment

### Frontend
- Deploy to: Vercel / Netlify / Cloudflare Pages
- Domain: `efl.et` or `www.efl.et`
- Environment: `NEXT_PUBLIC_API_URL=https://api.efl.et`

### Backend
- Deploy to: Vercel / Railway / AWS
- Domain: `api.efl.et` or `admin.efl.et`
- Environment: Production database + CORS for frontend domain

## Next Steps

1. ✅ Specs updated (requirements, design, tasks)
2. ⏳ Create new frontend repository
3. ⏳ Copy spec files to new repo
4. ⏳ Start Task 1: Initialize Next.js project
5. ⏳ Configure backend CORS for frontend domain

---

**Note:** The backend repository (`ethio-league`) remains unchanged. Only the frontend is being created as a new separate repository.
