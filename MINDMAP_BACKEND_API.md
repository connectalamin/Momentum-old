# Mind Maps Backend API Documentation

## Overview

The Mind Maps backend provides a complete REST API for managing mind maps and folders with full CRUD operations, designed to work seamlessly with Docker and PostgreSQL.

## Database Schema

### Tables

#### `mindmap_folders`
Stores folder information for organizing mind maps.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to users table |
| name | String | Folder name (required) |
| description | Text | Optional folder description |
| color | String | HSL color value for UI (default: chart-1) |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes:**
- `userId` - For fast user queries

**Relations:**
- Belongs to `User`
- Has many `MindMap`

---

#### `mindmaps`
Stores individual mind map data including nodes and edges.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to users table |
| folderId | UUID | Foreign key to mindmap_folders (nullable) |
| title | String | Mind map title (required) |
| description | Text | Optional description |
| type | String | Type: 'course', 'skill', or 'general' (default: general) |
| nodes | JSON | Array of ReactFlow nodes |
| edges | JSON | Array of ReactFlow edges |
| aiGenerated | Boolean | Whether AI created/enhanced (default: false) |
| metadata | JSON | Additional metadata for AI context |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes:**
- `userId` - For fast user queries
- `userId, folderId` - For folder filtering
- `userId, type` - For type filtering

**Relations:**
- Belongs to `User`
- Belongs to `MindMapFolder` (optional)

---

## API Endpoints

### Base URL
```
http://localhost:5000/api/mindmaps
```

All endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Folder Endpoints

### GET /folders
Get all folders for the authenticated user.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Academic",
    "description": "Course-related mind maps",
    "color": "hsl(var(--chart-1))",
    "createdAt": "2025-12-02T07:30:00.000Z",
    "updatedAt": "2025-12-02T07:30:00.000Z",
    "_count": {
      "mindMaps": 3
    }
  }
]
```

---

### GET /folders/:id
Get a single folder by ID with all its mind maps.

**Parameters:**
- `id` (path) - Folder UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Academic",
  "description": "Course-related mind maps",
  "color": "hsl(var(--chart-1))",
  "createdAt": "2025-12-02T07:30:00.000Z",
  "updatedAt": "2025-12-02T07:30:00.000Z",
  "mindMaps": [
    {
      "id": "uuid",
      "title": "Data Structures Course",
      "type": "course",
      ...
    }
  ]
}
```

**Errors:**
- `404` - Folder not found

---

### POST /folders
Create a new folder.

**Request Body:**
```json
{
  "name": "Skills Development",
  "description": "Learning roadmaps and skill trees",
  "color": "hsl(var(--chart-2))"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Skills Development",
  "description": "Learning roadmaps and skill trees",
  "color": "hsl(var(--chart-2))",
  "createdAt": "2025-12-02T07:30:00.000Z",
  "updatedAt": "2025-12-02T07:30:00.000Z",
  "_count": {
    "mindMaps": 0
  }
}
```

**Errors:**
- `400` - Name is required

---

### PUT /folders/:id
Update an existing folder.

**Parameters:**
- `id` (path) - Folder UUID

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "color": "hsl(var(--chart-3))"
}
```

**Response:** `200 OK` (same as POST response)

**Errors:**
- `404` - Folder not found
- `400` - Name is required

---

### DELETE /folders/:id
Delete a folder. All mind maps in the folder are moved to root (folderId = null).

**Parameters:**
- `id` (path) - Folder UUID

**Response:** `200 OK`
```json
{
  "message": "Folder deleted successfully",
  "id": "uuid"
}
```

**Errors:**
- `404` - Folder not found

---

## Mind Map Endpoints

### GET /
Get all mind maps for the authenticated user.

**Query Parameters:**
- `folderId` (optional) - Filter by folder ID ('null' or 'root' for uncategorized)
- `type` (optional) - Filter by type ('course', 'skill', 'general')

**Examples:**
```
GET /api/mindmaps
GET /api/mindmaps?folderId=uuid
GET /api/mindmaps?folderId=null
GET /api/mindmaps?type=skill
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "folderId": "uuid-or-null",
    "title": "Software Engineering Roadmap",
    "description": "Complete learning path",
    "type": "skill",
    "nodes": [...],
    "edges": [...],
    "aiGenerated": false,
    "metadata": null,
    "createdAt": "2025-12-02T07:30:00.000Z",
    "updatedAt": "2025-12-02T07:30:00.000Z",
    "folder": {
      "id": "uuid",
      "name": "Skills Development",
      "color": "hsl(var(--chart-2))"
    }
  }
]
```

---

### GET /:id
Get a single mind map by ID.

**Parameters:**
- `id` (path) - Mind map UUID

**Response:** `200 OK` (same structure as above)

**Errors:**
- `404` - Mind map not found

---

### POST /
Create a new mind map.

**Request Body:**
```json
{
  "title": "React Learning Path",
  "description": "Step by step React mastery",
  "type": "skill",
  "folderId": "uuid-or-null",
  "nodes": [],
  "edges": [],
  "metadata": {}
}
```

**Required Fields:**
- `title` - Mind map title

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "folderId": "uuid-or-null",
  "title": "React Learning Path",
  "description": "Step by step React mastery",
  "type": "skill",
  "nodes": [],
  "edges": [],
  "aiGenerated": false,
  "metadata": {},
  "createdAt": "2025-12-02T07:30:00.000Z",
  "updatedAt": "2025-12-02T07:30:00.000Z",
  "folder": {...}
}
```

**Errors:**
- `400` - Title is required or invalid folder

---

### PUT /:id
Update an existing mind map.

**Parameters:**
- `id` (path) - Mind map UUID

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "type": "course",
  "folderId": "uuid-or-null",
  "nodes": [...],
  "edges": [...],
  "metadata": {}
}
```

**Response:** `200 OK` (same as POST response)

**Errors:**
- `404` - Mind map not found
- `400` - Invalid folder

---

### PATCH /:id/move
Move a mind map to a different folder.

**Parameters:**
- `id` (path) - Mind map UUID

**Request Body:**
```json
{
  "folderId": "uuid-or-null"
}
```

**Response:** `200 OK` (same as POST response)

**Errors:**
- `404` - Mind map not found
- `400` - Invalid folder

---

### DELETE /:id
Delete a mind map.

**Parameters:**
- `id` (path) - Mind map UUID

**Response:** `200 OK`
```json
{
  "message": "Mind map deleted successfully",
  "id": "uuid"
}
```

**Errors:**
- `404` - Mind map not found

---

## Bulk Operations

### POST /bulk-delete
Delete multiple mind maps at once.

**Request Body:**
```json
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `200 OK`
```json
{
  "message": "Mind maps deleted successfully",
  "count": 3
}
```

**Errors:**
- `400` - Invalid IDs array
- `403` - Some mind maps don't belong to user

---

### POST /bulk-move
Move multiple mind maps to a folder.

**Request Body:**
```json
{
  "ids": ["uuid1", "uuid2", "uuid3"],
  "folderId": "uuid-or-null"
}
```

**Response:** `200 OK`
```json
{
  "message": "Mind maps moved successfully",
  "count": 3
}
```

**Errors:**
- `400` - Invalid IDs array or folder
- `403` - Some mind maps don't belong to user

---

## Error Responses

All endpoints follow standard error response format:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (accessing other user's data)
- `404` - Not Found
- `500` - Internal Server Error

---

## Node and Edge Data Structure

### Node Format (ReactFlow)
```json
{
  "id": "node-1",
  "type": "skill|course|milestone|topic",
  "position": { "x": 100, "y": 200 },
  "data": {
    "label": "Node Label",
    "category": "Technology",
    "level": "intermediate",
    "progress": 45,
    ...
  }
}
```

### Edge Format (ReactFlow)
```json
{
  "id": "edge-1",
  "source": "node-1",
  "target": "node-2",
  "type": "smoothstep",
  "animated": true
}
```

---

## Docker Integration

### Environment Variables
Required in `.env`:
```env
DATABASE_URL=postgresql://user:password@db:5432/momentum
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

### Running Migrations
```bash
# Inside Docker container
docker exec -it backend npx prisma migrate dev

# Generate Prisma Client
docker exec -it backend npx prisma generate
```

### Server Startup
The backend automatically:
1. Runs migrations in production
2. Generates Prisma Client
3. Loads mind map routes at `/api/mindmaps`

---

## Future AI Enhancement Scope

The database schema includes fields for AI integration:

### In `mindmaps` table:
- `aiGenerated` (boolean) - Track AI-created content
- `metadata` (JSON) - Store AI context and suggestions

### Potential AI Features:
1. **Auto-generate mind maps** from course syllabi
2. **Suggest connections** between nodes
3. **Recommend optimal layouts** based on content type
4. **Extract entities** from text to create nodes
5. **Generate learning paths** from skills/courses
6. **Smart node creation** from user goals
7. **Content summarization** for node labels
8. **Relationship inference** between concepts

### Example AI Metadata:
```json
{
  "aiSuggestions": {
    "connections": ["node-1 → node-3"],
    "newNodes": ["Advanced TypeScript"],
    "layout": "hierarchical"
  },
  "sourceContext": {
    "extractedFrom": "course-syllabus",
    "confidence": 0.85
  }
}
```

---

## Testing with curl

### Create a Folder:
```bash
curl -X POST http://localhost:5000/api/mindmaps/folders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Academic","color":"hsl(var(--chart-1))"}'
```

### Create a Mind Map:
```bash
curl -X POST http://localhost:5000/api/mindmaps \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"React Roadmap",
    "type":"skill",
    "nodes":[],
    "edges":[]
  }'
```

### Get All Mind Maps:
```bash
curl http://localhost:5000/api/mindmaps \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Implementation Complete ✅

- ✅ Database schema with folder support
- ✅ Full CRUD operations for folders
- ✅ Full CRUD operations for mind maps  
- ✅ Bulk operations support
- ✅ Folder-based filtering
- ✅ PostgreSQL integration via Prisma
- ✅ Docker compatibility
- ✅ JWT authentication
- ✅ Proper error handling
- ✅ Indexes for performance
- ✅ AI-ready metadata fields
