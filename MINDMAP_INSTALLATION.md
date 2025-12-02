# Mind Mapping Feature Installation Guide

## Installation Steps

### 1. Install Dependencies

The required dependencies have already been added to `client/package.json`. To install them, run:

```bash
# If using Docker (recommended):
docker exec -it client npm install

# Or if running locally:
cd client
npm install
```

This will install:
- `reactflow@^11.11.4` - Interactive node-based UI library
- `dagre@^0.8.5` - Graph layout algorithm
- `@types/dagre@^0.7.52` - TypeScript definitions for dagre

### 2. Restart the Client Container

After installing dependencies, restart the client container to apply changes:

```bash
docker-compose restart client
```

Or if you stopped the containers:

```bash
docker-compose up -d client
```

### 3. Access the Mind Maps Feature

1. Navigate to http://localhost:3000
2. Log in to your account
3. Click on "Mind Maps" in the sidebar (Network icon)

## Features Implemented

### ✅ Completed Frontend Features:

1. **Folder-Based Organization**
   - Create folders to organize mind maps (e.g., Academic, Skills Development)
   - Edit folder name, description, and color
   - Delete folders (mind maps move to root)
   - Browse folders with breadcrumb navigation
   - Move mind maps between folders
   - Create folders during mind map creation

2. **Custom Node Components**
   - CourseNode - For academic courses with progress tracking
   - SkillNode - For skills with level indicators
   - MilestoneNode - For skill milestones with status
   - TopicNode - For general topics and notes

3. **Interactive Canvas**
   - Drag-and-drop nodes
   - Connect nodes with animated edges
   - Zoom and pan controls
   - Mini-map for navigation
   - Background grid pattern
   - Dark/Light theme support

4. **Toolbar Features**
   - Add nodes (Course, Skill, Milestone, Topic)
   - Auto-layout algorithms (Horizontal, Vertical, Tree)
   - Zoom controls (Zoom In, Zoom Out, Fit View)
   - Export options (JSON, PNG coming soon)
   - AI Generation placeholder
   - Save functionality

5. **Mind Map Management**
   - Folder grid view with color indicators
   - Uncategorized mind maps section
   - Create new mind maps with title, description, type, and folder
   - Edit nodes by double-clicking
   - Delete mind maps with confirmation
   - Move mind maps to different folders
   - Switch between List and Canvas views
   - Quick folder creation from mind map creation dialog

5. **Design Integration**
   - Seamlessly integrated with existing Momentum design system
   - Uses Radix UI components (Card, Button, Dialog, DropdownMenu, etc.)
   - Tailwind CSS styling with CSS variables
   - Consistent with other pages (Dashboard, Skills, etc.)
   - Responsive layout
   - Color-coded folders using chart-1 to chart-5 theme colors

## File Structure

```
client/src/components/
├── mindmap/
│   ├── CourseNode.tsx          # Course node component
│   ├── SkillNode.tsx           # Skill node component
│   ├── MilestoneNode.tsx       # Milestone node component
│   ├── TopicNode.tsx           # Topic node component
│   ├── MindMapCanvas.tsx       # Main ReactFlow canvas
│   └── MindMapToolbar.tsx      # Toolbar with controls
└── pages/
    └── MindMaps.tsx            # Main mind maps page

client/src/components/
├── Sidebar.tsx                 # Updated with Mind Maps menu item
└── App.tsx                     # Updated with Mind Maps routing
```

## Next Steps (Backend Integration - Future Phase)

When ready to implement backend support:

1. Create Prisma schema for MindMap model
2. Add backend API routes (GET, POST, PUT, DELETE /api/mindmaps)
3. Implement AI auto-generation endpoint
4. Add PNG export using html-to-image library
5. Sync with course/skill data from database

## Sample Data

The feature includes sample mind map data to demonstrate functionality:
- "Software Engineering Roadmap" with skills and milestones
- Interactive nodes that can be edited, moved, and connected

## Usage Instructions

### Creating a Mind Map:
1. Click "Create Mind Map" button
2. Enter title and optional description
3. Select type (General, Course, or Skill)
4. Click "Create"

### Editing the Canvas:
1. Click "Add Node" to insert new nodes
2. Drag nodes to reposition
3. Click and drag from node handles to create connections
4. Double-click nodes to edit properties
5. Use "Layout" to auto-arrange nodes

### Exporting:
1. Click "Export" dropdown
2. Select "Export as JSON" (PNG coming soon)
3. File will be downloaded automatically

## Troubleshooting

### If Mind Maps menu doesn't appear:
- Clear browser cache and reload
- Check browser console for errors
- Ensure dependencies are installed correctly

### If nodes don't render:
- Check that reactflow is installed: `docker exec -it client npm list reactflow`
- Restart the client container

### If layout doesn't work:
- Verify dagre is installed: `docker exec -it client npm list dagre`
- Check console for layout errors

## Design Consistency

The mind mapping feature follows these design patterns from your app:

- **Colors**: Uses `--chart-1` through `--chart-5` for node types
- **Cards**: Same Card component styling as Skills/Academics pages
- **Buttons**: Consistent Button variants and sizes
- **Modals**: Standard Dialog/AlertDialog patterns
- **Spacing**: Matches `space-y-6` and padding patterns
- **Responsiveness**: Grid layouts adapt to mobile/tablet/desktop
- **Animations**: Smooth transitions matching other pages

Enjoy your new Mind Mapping feature! 🚀
