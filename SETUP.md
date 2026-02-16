# PIEE Platform Setup Guide

This guide will help you set up and run the PIEE platform with the new internal database system.

## 🚀 Quick Start

### Option 1: Local Development (Zero Config with SQLite)

**Prerequisites:**
- Node.js 20+ and Bun installed
- Python 3.12+ installed

**Steps:**

1. **Install dependencies:**
   ```bash
   # Frontend
   bun install
   
   # Backend
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

2. **Run backend API:**
   ```bash
   make dev-backend
   # Or manually: cd backend && uvicorn app.main:app --reload
   ```

3. **Run frontend (in a new terminal):**
   ```bash
  make dev-frontend
   # Or: bun dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

The backend will automatically create a SQLite database at `backend/data/piee.db` - no configuration needed!

---

### Option 2: Docker (with SQLite)

**Prerequisites:**
- Docker and Docker Compose installed

**Steps:**

```bash
# Start all services
make docker-up

# Or manually
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000  
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

### Option 3: Docker with PostgreSQL

**Prerequisites:**
- Docker and Docker Compose installed

**Steps:**

```bash
# Start with PostgreSQL
make docker-up-pg

# Or manually
docker-compose --profile postgres up -d
```

This starts:
- Frontend (Next.js) on port 3000
- Backend (FastAPI) on port 8000
- PostgreSQL database on port 5432

---

## 📊 Database Configuration

The system supports three databases with automatic detection:

### SQLite (Default)
```bash
# No configuration needed!
# Or in backend/.env:
DATABASE_URL=sqlite:///./data/piee.db
```

### PostgreSQL (Production)
```bash
# In backend/.env:
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/piee
```

### MySQL (Optional)
```bash
# In backend/.env:
DATABASE_URL=mysql+pymysql://user:password@localhost/piee
```

**Switch databases by changing `DATABASE_URL` - no code changes required!**

---

## 🔐 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (backend/.env)
```env
DATABASE_URL=sqlite:///./data/piee.db
JWT_SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=./data/uploads
MAX_UPLOAD_SIZE=10485760
FRONTEND_URL=http://localhost:3000
```

**Note:** See `.env.example` files for full configuration options.

---

## 📝 Available Commands

We've created a `Makefile` for convenience:

```bash
make help                 # Show all available commands
make install              # Install all dependencies
make dev-backend          # Run backend server
make dev-frontend         # Run frontend server
make docker-up            # Start with Docker (SQLite)
make docker-up-pg         # Start with Docker (PostgreSQL)
make docker-down          # Stop Docker services
make docker-logs          # View logs
make db-init              # Initialize database
make clean                # Clean up
```

---

## 🗃️ Database Schema

The internal database includes these tables:

- **users** - User accounts with email/password
- **sessions** - JWT authentication sessions
- **workspaces** - User workspace organization
- **files** - File metadata (actual files stored on disk)
- **prompts** - AI generation prompt templates

Files are stored in `backend/data/uploads/{user_id}/` directory.

---

## 🔄 Migrating from Supabase

If you have existing Supabase data:

1. **Export data from Supabase** (use their export tools)
2. **Update frontend code** - Replace Supabase imports with new API:
   ```typescript
   // Old
   import { supabase } from '@/lib/supabase';
   
   // New
   import { auth, files, prompts } from '@/lib/api';
   ```
3. **Update authentication** - Use new auth methods:
   ```typescript
   // Register
   await auth.register(email, password);
   
   // Login
   await auth.login(email, password);
   
   // Get current user
   const user = await auth.getCurrentUser();
   ```

---

## 🧪 Testing the API

The backend includes interactive API documentation:

1. Start the backend: `make dev-backend`
2. Open http://localhost:8000/docs
3. Try the endpoints:
   - POST `/api/v1/auth/register` - Create account
   - POST `/api/v1/auth/login` - Get JWT token
   - Click "Authorize" button, paste token
   - Try authenticated endpoints

---

## 🐛 Troubleshooting

### Backend won't start
- **Check Python version:** `python3 --version` (need 3.12+)
- **Install dependencies:** `cd backend && pip install -r requirements.txt`
- **Check port 8000:** Make sure nothing else is using it

### Frontend can't connect to backend
- **Check NEXT_PUBLIC_API_URL** in `.env.local`
- **Verify backend is running** at http://localhost:8000/health
- **Check CORS settings** in `backend/app/main.py`

### Database errors
- **SQLite:** Ensure `backend/data/` directory permissions
- **PostgreSQL:** Check connection string and server is running
- **Reset database:** `make clean-db` then restart

### Docker issues
- **Port conflicts:** Check if 3000 or 8000 are in use
- **View logs:** `make docker-logs`
- **Restart:** `make docker-down && make docker-up`

---

## 📚 API Client Usage

### Authentication
```typescript
import { auth } from '@/lib/api';

// Register
await auth.register('user@example.com', 'password123');

// Login
const { access_token } = await auth.login('user@example.com', 'password123');

// Get current user
const user = await auth.getCurrentUser();

// Logout
await auth.logout();
```

### File Upload
```typescript
import { files } from '@/lib/api';

// Upload
const metadata = await files.uploadFile(fileObject, workspaceId);

// List files
const allFiles = await files.listFiles();

// Download
await files.downloadFile(fileId);

// Delete
await files.deleteFile(fileId);
```

### Prompts
```typescript
import { prompts } from '@/lib/api';

// Create
const prompt = await prompts.createPrompt({
  title: 'My Prompt',
  content: 'Prompt text',
  type: 'image'
});

// List
const allPrompts = await prompts.listPrompts();

// Update
await prompts.updatePrompt(promptId, { title: 'New Title' });

// Delete
await prompts.deletePrompt(promptId);
```

---

## 🏗️ Project Structure

```
piee-docker/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── auth/           # Authentication logic
│   │   ├── core/           # Configuration
│   │   ├── db/             # Database models & setup
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   └── main.py         # Application entry point
│   ├── data/               # SQLite DB & uploads (auto-created)
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── lib/
│   └── api/                # Frontend API clients
│       ├── client.ts       # Axios client
│       ├── auth.ts         # Auth API
│       ├── files.ts        # File API
│       ├── prompts.ts      # Prompts API
│       └── workspaces.ts   # Workspaces API
├── docker-compose.yml      # Docker services
├── Makefile                # Convenience commands
└── README.md               # This file
```

---

## 🎯 Key Features

✅ **Zero-config SQLite** - Works instantly without setup  
✅ **Multi-database support** - Switch between SQLite/PostgreSQL/MySQL  
✅ **Docker & non-Docker** - Works both ways  
✅ **JWT authentication** - Secure token-based auth  
✅ **File storage** - Local disk storage with metadata  
✅ **Interactive API docs** - Built-in Swagger UI  
✅ **Type-safe frontend** - TypeScript API clients  
✅ **Open source friendly** - No cloud dependencies  

---

## 🤝 Contributing

New contributors can get started in 2 commands:

```bash
make install
make dev-backend   # Terminal 1
make dev-frontend  # Terminal 2
```

No database installation required - SQLite works out of the box!

---

## 📄 License

See the main project LICENSE file for details.
