# Mind Maps Folder-Based Structure

## Overview

The mind mapping feature now includes a hierarchical folder-based organization system, allowing users to group and categorize their mind maps effectively.

## Key Features

### 1. Folder Management

**Create Folders:**
- Click "New Folder" button in the Grid View
- Or create folders directly from the mind map creation dialog
- Customize folder with:
  - Name (required)
  - Description (optional)
  - Color (5 theme colors to choose from: chart-1 through chart-5)

**Edit Folders:**
- Click the three-dot menu on any folder card
- Select "Edit Folder"
- Update name, description, or color
- Changes are saved immediately

**Delete Folders:**
- Click the three-dot menu on any folder card
- Select "Delete Folder"
- **Important:** All mind maps inside the folder will be moved to the root level (uncategorized)
- Confirms deletion before proceeding

### 2. Navigation

**Breadcrumb Navigation:**
- Home (root level) → Folder Name
- Click "Home" to return to root view showing all folders
- Current location clearly indicated

**Folder Views:**
- **Root View:** Shows all folders as cards + uncategorized mind maps
- **Folder View:** Shows only mind maps within the selected folder

### 3. Mind Map Organization

**Creating Mind Maps:**
1. Click "Create Mind Map" button
2. Fill in title, description, and type
3. Select a folder from the dropdown or choose "No Folder"
4. Optionally create a new folder directly from the dialog

**Moving Mind Maps:**
1. Click the three-dot menu on any mind map card
2. Select "Move to Folder"
3. Choose target folder or "No Folder (Root)"
4. Mind map is instantly moved

### 4. Visual Design

**Folder Cards:**
- Large colored icon representing the folder
- Folder name and description
- Count of mind maps inside
- Three-dot menu for actions (Edit, Delete)
- Hover effect for better UX

**Mind Map Cards:**
- Same design as before
- Additional dropdown menu with "Move to Folder" option
- Shows node count and connection count

**Color Coding:**
- 5 theme colors available: chart-1, chart-2, chart-3, chart-4, chart-5
- Consistent with the app's design system
- Helps visually distinguish folder categories

## User Workflow Examples

### Example 1: Academic Organization
```
📁 Academic (Blue - chart-1)
   ├── CSE 101 Data Structures Mind Map
   ├── CSE 201 Algorithms Mind Map
   └── Math 301 Calculus Mind Map

📁 Skills Development (Green - chart-2)
   ├── Software Engineering Roadmap
   └── Web Development Learning Path

📄 Uncategorized Mind Maps
   └── Random Ideas
```

### Example 2: From Creation to Organization
1. User creates "React Learning Path" mind map without selecting a folder
2. Mind map appears in "Uncategorized Mind Maps"
3. User creates "Frontend Development" folder (color: chart-3)
4. User clicks three-dot menu on "React Learning Path"
5. Selects "Move to Folder" → "Frontend Development"
6. Mind map now organized under the folder

## Implementation Details

### Data Structure

**MindMapFolder Interface:**
```typescript
interface MindMapFolder {
  id: string;
  name: string;
  description?: string;
  color?: string; // hsl(var(--chart-N))
  createdAt: string;
  updatedAt: string;
}
```

**MindMap Interface (updated):**
```typescript
interface MindMap {
  id: string;
  title: string;
  description?: string;
  type: 'course' | 'skill' | 'general';
  folderId: string | null; // ← NEW: null means uncategorized
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}
```

### Sample Data

**Folders:**
- Academic (chart-1, blue)
- Skills Development (chart-2, green)

**Mind Maps:**
- "Software Engineering Roadmap" → Skills Development folder
- (More can be added as needed)

## Benefits

1. **Organization:** Categorize mind maps by subject, project, or purpose
2. **Scalability:** Manage dozens or hundreds of mind maps efficiently
3. **Visual Clarity:** Color-coded folders for quick identification
4. **Flexibility:** Easy to move mind maps between categories
5. **No Lock-in:** Delete folders without losing mind maps

## Next Steps (Phase 2 - Backend Integration)

- Persist folders and mind maps to PostgreSQL via Prisma
- Create API endpoints for folder CRUD operations
- Add folder-based filtering in backend
- Sync folder changes across devices
- Add folder sharing and collaboration features
