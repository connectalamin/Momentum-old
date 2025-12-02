---
applyTo: "**"
---

# 🧠 Project Context for GitHub Copilot

## 🚀 Project: Momentum — AI-Based Student Productivity Assistant

**Momentum** is an intelligent AI-powered productivity platform designed to help students organize academics, skills, and finances.  
It generates personalized daily routines, learns from behavior, and provides actionable insights.

---

## ⚙️ Tech Stack Overview

| Layer               | Tech                                                            |
| ------------------- | --------------------------------------------------------------- |
| **Frontend**        | React + Vite, TailwindCSS, shadcn/ui                            |
| **Backend**         | Node.js (Express) + Prisma ORM + PostgreSQL                     |
| **AI Microservice** | FastAPI (Python) + Gemini API + ChromaDB + LangChain            |
| **ML Layer**        | scikit-learn / LightGBM (for reinforcement learning)            |
| **Infrastructure**  | REST APIs, `.env` configs                      |
| **Hosting**         | Vercel (Frontend), Render/Railway (Backend), Cloud Run/EC2 (AI) |

---

## 🧩 Architecture Summary

```
React Frontend (Vite)
    ↓ REST API
Express Backend (Prisma + PostgreSQL)
    ↓ REST API
Momentum AI Microservice (FastAPI + Gemini + ChromaDB)
    ↓
    ├─ Gemini API → reasoning and generation
    └─ ChromaDB → semantic memory (syllabus, notes, chat, finance summaries)
```

---

## 🧱 Database (PostgreSQL via Prisma)

Core tables include:

| Category           | Tables                                                                          |
| ------------------ | ------------------------------------------------------------------------------- |
| **User**           | `User`, `Lifestyle`, `Journal`                                                  |
| **Academics**      | `Academic`, `Course`, `Assignment`, `Exam`, `ClassSchedule`, `AttendanceRecord` |
| **Skills**         | `Skill`, `Milestone`, `LearningResource`, `AIRecommendation`                    |
| **Finance**        | `Finance`, `SavingsGoal`, `MonthlyBudget`, `FinanceInsight`                     |
| **AI Integration** | `AIPlan`, `AIFeedback`, `AIMemory`, `Task`                                      |
| **System**         | Timestamps, relations, cascading deletes via Prisma                             |

### Key Prisma Models:

- **User**: Central user model with relations to all features
- **Course**: Academic courses with schedules, assignments, exams, and attendance
- **Skill**: Skill tracking with milestones, resources, and AI recommendations
- **Finance**: Income/expense tracking with savings goals and monthly budgets
- **AIMemory**: Stores ChromaDB vector IDs for semantic memory
- **AIPlan**: Stores AI-generated daily plans
- **AIFeedback**: Reinforcement learning feedback for task completion
- **FinanceInsight**: AI-generated financial insights and recommendations
- **Task**: User tasks with type, priority, and estimated time

---

## 💬 Conversational Onboarding

- Users complete onboarding through an **AI chat conversation**.
- AI asks structured and dynamic questions about:
  - Academic load (courses, schedules, assignments)
  - Study hours & preferences
  - Skill-building goals
  - Financial habits
- **Structured outputs** (study preferences, schedule, skill goals, financial baselines) → stored in **PostgreSQL**.
- **Raw chat conversation embeddings** (semantic memory) → stored in **ChromaDB**.
- This lets Gemini recall user context later for personalized reasoning.

**Data Flow:**

- 🗄️ **Postgres** → Facts and structured data (courses, tasks, finances)
- 🧠 **ChromaDB** → Meaning and conversation memory (embeddings)

---

## 🗓️ Daily Planner Flow

1. Frontend requests daily plan from backend
2. Express fetches user data (tasks, classes, preferences) from Postgres
3. Backend sends data to AI service `/plan` endpoint
4. AI retrieves relevant context (syllabus, notes) from ChromaDB
5. Gemini generates optimized daily schedule and recommendations
6. Response (plan JSON) stored in Postgres `AIPlan` table
7. Frontend displays the personalized schedule

---

## 💰 Finance Intelligence Flow

1. User logs income and expenses in Postgres via Express API
2. Express sends summary data to AI service `/finance/analyze`
3. AI uses Gemini to generate financial insights:
   ```json
   {
     "summary": "You saved 20% of income last month.",
     "saving_suggestion": "Reduce dining-out expenses by 15%.",
     "recommendations": ["Use campus meal plan", "Automate savings transfer"]
   }
   ```
4. Result saved in `FinanceInsight` table
5. Frontend displays insights on Finance dashboard

---

## 🔁 Feedback Loop (Reinforcement Learning)

1. User marks task as complete → Express updates Postgres
2. Backend calls AI service `/complete` endpoint
3. AI logs performance data in `AIFeedback` table
4. Weekly script (`train_policy.py`) trains a model to personalize future schedules
5. Model learns user preferences and adjusts recommendations

---

## 🧠 AI Microservice Endpoints

| Endpoint             | Method | Purpose                                                 |
| -------------------- | ------ | ------------------------------------------------------- |
| `/onboarding/start`  | POST   | Starts conversational onboarding                        |
| `/onboarding/answer` | POST   | Receives user answer → AI continues Q&A or saves result |
| `/ingest`            | POST   | Adds syllabus/notes to ChromaDB memory                  |
| `/plan`              | POST   | Generates daily academic + skill plan                   |
| `/rebalance`         | POST   | Reschedules incomplete tasks                            |
| `/complete`          | POST   | Logs task completion feedback                           |
| `/finance/analyze`   | POST   | Analyzes income/expenses for savings advice             |
| `/health`            | GET    | Service health check                                    |

---

## 🧩 Design Rules for Copilot

### Backend (Express + Prisma)

- ✅ **Should orchestrate** communication between Frontend ↔ AI ↔ Postgres
- ✅ Use Prisma for all database operations
- ✅ Validate requests and handle errors gracefully
- ❌ **Never** make direct Gemini or ChromaDB calls here
- ❌ No business logic in routes (use controllers/services)

### AI Service (FastAPI)

- ✅ **Handles all AI reasoning** and context retrieval
- ✅ Always return **structured JSON** responses
- ✅ Use **Gemini API** for reasoning and generation
- ✅ Use **ChromaDB** for semantic memory retrieval
- ✅ Use **LangChain** for document processing and retrieval
- ✅ **ALWAYS check Context7 documentation** before implementing LangChain/ChromaDB features
- ❌ Never directly access Postgres (use backend API)

**Context7 Usage for AI Service**:
- Before implementing LangChain features, check docs via Context7: `resolve-library-id("langchain")` → `get-library-docs(...)`
- Before ChromaDB operations, verify latest API: `resolve-library-id("chromadb")` → `get-library-docs(...)`
- Before Gemini API calls, check SDK docs: `resolve-library-id("google-genai")` → `get-library-docs(...)`

### Frontend (React + Vite)

- ✅ Chat UI for onboarding
- ✅ Dashboards for plans, skills, finances, academics
- ✅ **Consume REST APIs** from Express backend only
- ✅ Use **shadcn/ui** components for consistent design
- ✅ Use **TailwindCSS** for styling
- ❌ Never call AI service directly
- ❌ No business logic in components (use hooks/context)

### PostgreSQL (via Prisma)

- ✅ Stores **structured and factual data**
- ✅ Use Prisma ORM for all queries and relations
- ✅ Always use transactions for related updates
- ✅ Use cascading deletes (`onDelete: Cascade`)
- ❌ Never write raw SQL unless absolutely necessary

### ChromaDB

- ✅ Stores **semantic memory** (vector embeddings)
- ✅ Indexed by `user_id` and context type
- ✅ Use for retrieval-augmented generation (RAG)
- ✅ Store metadata with embeddings for filtering
- ✅ Use LangChain's ChromaDB integration for better document management
- ❌ Never store PII or sensitive data

**ChromaDB Best Practices**:
- Use collections per user or context type for better isolation
- Always include metadata: `user_id`, `type` (onboarding/notes/syllabus), `timestamp`
- Query with filters: `where={"user_id": user_id, "type": "notes"}`
- Use proper embedding dimensions (768 for text-embedding-004)

### AI Response Format

All AI responses **must** include structured JSON:

```json
{
  "summary": "Brief overview",
  "schedule": [...],
  "suggestions": [...],
  "recommendations": [...]
}
```

---

## 🧰 Example Copilot Tasks

Copilot should be able to:

1. ✅ Generate Express routes calling the AI service
2. ✅ Implement FastAPI endpoints using Gemini API
3. ✅ Write Prisma queries for tasks, skills, and finance data
4. ✅ Build React components for chat onboarding and planner dashboards
5. ✅ Suggest LangChain retrieval strategies and Gemini prompts
6. ✅ Create Prisma migrations for schema changes
7. ✅ Generate TypeScript types from Prisma schema
8. ✅ Implement error handling and validation
9. ✅ Create reusable UI components with shadcn/ui
10. ✅ **Use Context7 to verify LangChain/ChromaDB patterns before implementing**
11. ✅ **Explain LangChain components** (text splitters, document loaders, chains) when implementing
12. ✅ **Implement proper RAG patterns** using LangChain + ChromaDB integration

---

## ⚡ Copilot Should Avoid

- ❌ Mixing Gemini API calls inside Express backend
- ❌ Writing business logic directly in React components
- ❌ Duplicating models (always use Prisma schema as source of truth)
- ❌ Hardcoding API URLs or secrets (use environment variables)
- ❌ Making AI service calls from frontend
- ❌ Storing sensitive data in ChromaDB
- ❌ Using raw SQL instead of Prisma queries
- ❌ Creating duplicate API endpoints

---

## 🔐 Data Privacy & Security

- 🔒 Only **summarized context** sent to Gemini API
- 🔒 Raw user text stored **securely in Postgres**
- 🔒 Embeddings (vectorized data) stored **only in ChromaDB**
- 🔒 Use **environment variables** for all secrets
- 🔒 Implement **JWT authentication** for API routes
- 🔒 **Never log** sensitive user data
- 🔒 Use HTTPS for all external API calls

---

## 📁 Project Structure

```
AI-Student-Life-Dashboard/
├── backend/                 # Express + Prisma backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation
│   │   ├── routes/         # API routes
│   │   └── server.ts       # Entry point
│   └── prisma/
│       └── schema.prisma   # Database schema
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── pages/      # Page components
│   │   │   ├── modals/     # Modal dialogs
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── lib/            # Utils, API client
│   │   └── App.tsx         # Main app component
│   └── vite.config.ts
└── momentum-ai/             # FastAPI AI microservice
    ├── ai_service.py       # Main service
    ├── requirements.txt
    └── chroma_db/          # ChromaDB storage
```

---

## 🎯 Development Workflow

1. **Schema Changes**: Update `schema.prisma` → Run `prisma migrate dev` → Run `prisma generate`
2. **Backend Changes**: Update routes/controllers → Test with Postman/Thunder Client
3. **AI Service Changes**: Update endpoints → Test with Python requests
4. **Frontend Changes**: Update components → Test in browser
5. **Integration**: Test full flow Frontend → Backend → AI → Database

---

## 📝 Coding Conventions

- **TypeScript**: Use strict mode, avoid `any` types
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Imports**: Group by external → internal → relative
- **Comments**: Use JSDoc for functions, inline comments for complex logic
- **Error Handling**: Always use try-catch with meaningful error messages
- **API Responses**: Consistent format `{ success, data, error }`

---

## 🚦 Testing Guidelines

- Write unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Mock external services (Gemini API, ChromaDB) in tests
- Use meaningful test descriptions

---

## 🔧 AI Service Configuration & Environment Setup

### Environment Variables Required

**Backend (.env)**:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
AI_SERVICE_URL=http://momentum-ai:8001
DATABASE_URL=postgresql://momentum:momentum@db:5432/momentum
JWT_SECRET=your_jwt_secret
```

**AI Service (momentum-ai/.env)**:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
VECTOR_DIR=./chroma_db
POLICY_MODEL_PATH=./models/policy_model.pkl
TEMPERATURE=0.3
PORT=8001
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:5000/api
```

### Docker Compose Configuration

**IMPORTANT**: The `momentum-ai` service **MUST** load the `.env` file:

```yaml
momentum-ai:
  image: python:3.11-slim
  container_name: momentum-ai
  working_dir: /app
  volumes:
    - ./momentum-ai:/app
    - 'chroma_db:/app/chroma_db'
  dns:
    - 8.8.8.8
    - 1.1.1.1
  env_file:
    - ./momentum-ai/.env  # ← CRITICAL: Loads GEMINI_API_KEY
  environment:
    - PORT=8001
    - MOMENTUM_DB_URL=postgresql://momentum:momentum@db:5432/momentum
  command: sh -c "pip install --no-cache-dir -r requirements.txt && uvicorn ai_service:app --host 0.0.0.0 --port 8001"
  ports:
    - "8001:8001"
```

**Why this matters**:
- Without `env_file`, the AI service won't load `GEMINI_API_KEY`
- The service will fail to start with: `RuntimeError: Set GEMINI_API_KEY in .env`
- All AI features (chat, skills, mind maps) will return 500 errors

---

## 🗺️ Mind Map Feature Implementation

### Architecture

Mind maps are stored as **JSON in PostgreSQL** with the following structure:

```typescript
interface MindMap {
  id: string;
  title: string;
  description?: string;
  type: 'course' | 'skill' | 'general';
  folderId: string | null;
  nodes: Node[];  // ReactFlow nodes
  edges: Edge[];  // ReactFlow edges
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}
```

### Node Types

Five custom node types are supported:

1. **CourseNode**: `courseCode`, `credits`, `progress`, `startDate`, `dueDate`
2. **SkillNode**: `category`, `level`, `progress`, `startDate`, `dueDate`
3. **MilestoneNode**: `status`, `estimatedHours`, `startDate`, `dueDate`
4. **TopicNode**: `description`, `startDate`, `dueDate`
5. **CustomNode**: `description`, `color`, `startDate`, `dueDate`

All nodes support optional `startDate` and `dueDate` fields.

### AI Mind Map Generation

**Backend Controller**: `backend/src/controllers/ai.mindmap.controller.ts`

**Two endpoints**:
1. `POST /api/mindmaps/generate` - Generate from topic/description
2. `POST /api/mindmaps/generate/skill/:skillId` - Generate from existing skill

**IMPORTANT**: Use `axios` for HTTP calls, NOT `fetch()`:

```typescript
// ✅ CORRECT - Uses axios (consistent with other controllers)
import axios from 'axios';

const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const response = await axios.post(`${aiServiceUrl}/api/chat`, {
  message: prompt,
  user_id: userId,
  context_type: 'mindmap_generation',
}, {
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
});

const aiResponse: any = response.data;

// ❌ WRONG - fetch() may cause issues in Node.js
const response = await fetch(`${aiServiceUrl}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({...})
});
```

**Why**: 
- Other controllers use `axios` from `ai.service.ts`
- `fetch()` requires Node.js 18+ and may have compatibility issues
- `axios` provides better error handling and timeout configuration

### Common Issues & Solutions

#### 500 Error on Mind Map Generation

**Symptoms**:
```
POST http://localhost:5000/api/mindmaps/generate 500 (Internal Server Error)
Error: Failed to generate mind map
```

**Common Causes**:
1. ❌ Missing `env_file` in docker-compose.yml for momentum-ai
2. ❌ Missing `GEMINI_API_KEY` in momentum-ai/.env
3. ❌ AI service container not running
4. ❌ Using `fetch()` instead of `axios`

**Solution**:
1. Add `env_file: - ./momentum-ai/.env` to docker-compose.yml
2. Verify `.env` exists with valid `GEMINI_API_KEY`
3. Restart containers: `docker-compose down && docker-compose up -d`
4. Check logs: `docker-compose logs momentum-ai`

#### TypeScript Errors in Controllers

**Common Error**:
```
Parameter 'm' implicitly has an 'any' type. (7006)
Parameter 'value' implicitly has an 'any' type. (7006)
```

**Solution**: Add explicit type annotations:
```typescript
// ✅ CORRECT
skill.milestones.map((m: any, i: number) => ...)
onValueChange={(value: string) => ...}

// ❌ WRONG
skill.milestones.map((m, i) => ...)
onValueChange={(value) => ...)
```

#### React State Update Warnings

**Error**:
```
Cannot update a component while rendering a different component
```

**Solution**: Move state updates to `useEffect`:
```typescript
// ✅ CORRECT
useEffect(() => {
  if (selectedMindMap) {
    onNodesChange?.(selectedMindMap.nodes);
  }
}, [selectedMindMap?.nodes]);

// ❌ WRONG - updating parent state during render
const handleNodesChange = (nodes) => {
  setParentState(nodes);  // Don't call in render
};
```

---

## 🚨 Common Error Patterns & Fixes

### Backend Compilation Errors

**Error**: `tsc: not found`
**Cause**: Missing dependencies in backend/node_modules
**Fix**: Run `./setup.sh` or `cd backend && npm install`

### Docker Network Issues

**Error**: `network momentum-network not found`
**Cause**: Stale Docker networks
**Fix**: 
```bash
docker-compose down
docker network prune -f
docker-compose up -d
```

### Prisma Client Generation

**Error**: `@prisma/client did not initialize yet`
**Cause**: Prisma client not generated after schema changes
**Fix**: 
```bash
cd backend
npx prisma generate
```

### AI Service Not Starting

**Check logs**:
```bash
docker-compose logs momentum-ai
```

**Common issues**:
- Missing `GEMINI_API_KEY` → Add to `.env` and `env_file` in docker-compose.yml
- ChromaDB permission errors → Check volume permissions
- Python dependency errors → Verify `requirements.txt` is up to date

---

## 📊 Service Communication Patterns

### ✅ Correct Pattern

```
Frontend → Backend → AI Service → Gemini API
   ↓          ↓           ↓
   UI    Prisma/DB    ChromaDB
```

**Implementation**:
```typescript
// Frontend (React)
const result = await mindMapAPI.generateWithAI({ topic, description });

// Backend (Express)
import axios from 'axios';
const response = await axios.post(`${AI_SERVICE_URL}/api/chat`, {...});
const aiResponse = response.data;

// AI Service (FastAPI)
response = model.generate_content(prompt)
return {"response": response.text}
```

### ❌ Incorrect Patterns

1. **Frontend → AI Service directly** (bypasses auth)
2. **Backend → Gemini API directly** (should use AI service)
3. **AI Service → Database directly** (should use backend API)
4. **Using fetch() in backend** (use axios for consistency)

---

## 🎨 UI Component Guidelines

### Mind Map Components

**File Structure**:
```
client/src/components/
├── mindmap/
│   ├── MindMapCanvas.tsx      # ReactFlow wrapper
│   ├── MindMapToolbar.tsx     # Toolbar controls
│   ├── CourseNode.tsx         # Custom node type
│   ├── SkillNode.tsx
│   ├── MilestoneNode.tsx
│   ├── TopicNode.tsx
│   └── CustomNode.tsx
└── pages/
    └── MindMaps.tsx           # Main mind maps page
```

**Required Imports for Custom Nodes**:
```typescript
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Calendar } from 'lucide-react';
```

**Node Interface Pattern**:
```typescript
export interface SkillNodeData {
  label: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress?: number;
  startDate?: string;
  dueDate?: string;
}

export default memo(({ data }: NodeProps<SkillNodeData>) => {
  // Component implementation
});
```

---

## 🔄 Database Migration Best Practices

### Making Schema Changes

1. **Update schema.prisma**:
```prisma
model MindMap {
  id          String   @id @default(uuid())
  title       String
  nodes       Json     @default("[]")
  edges       Json     @default("[]")
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

2. **Create migration**:
```bash
cd backend
npx prisma migrate dev --name add_mindmap_tables
```

3. **Generate Prisma Client**:
```bash
npx prisma generate
```

4. **Restart backend**:
```bash
docker-compose restart backend
```

### Migration Naming Convention

- `add_<table>_<fields>` - Adding new fields
- `remove_<table>_<fields>` - Removing fields
- `update_<table>_<description>` - Modifying existing fields
- `create_<table>` - Creating new table

---

**Last Updated**: December 2, 2025
