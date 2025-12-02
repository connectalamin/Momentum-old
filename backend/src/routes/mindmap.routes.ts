import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { generateMindMap, generateMindMapFromSkill } from '../controllers/ai.mindmap.controller';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authenticate);

// ===========================
// MINDMAP FOLDER ENDPOINTS
// ===========================

// Get all folders for user
router.get('/folders', async (req: AuthRequest, res: Response) => {
  try {
    const folders = await prisma.mindMapFolder.findMany({
      where: { userId: req.userId! },
      include: {
        _count: {
          select: { mindMaps: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(folders);
  } catch (error) {
    console.error('Error fetching mind map folders:', error);
    res.status(500).json({ error: 'Error fetching mind map folders' });
  }
});

// Get single folder by ID
router.get('/folders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const folder = await prisma.mindMapFolder.findUnique({
      where: { id },
      include: {
        mindMaps: {
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    if (!folder || folder.userId !== req.userId) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json(folder);
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({ error: 'Error fetching folder' });
  }
});

// Create new folder
router.post('/folders', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const folder = await prisma.mindMapFolder.create({
      data: {
        userId: req.userId!,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || 'hsl(var(--chart-1))'
      },
      include: {
        _count: {
          select: { mindMaps: true }
        }
      }
    });

    res.status(201).json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Error creating folder' });
  }
});

// Update folder
router.put('/folders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    // Check if folder exists and belongs to user
    const existingFolder = await prisma.mindMapFolder.findUnique({
      where: { id }
    });

    if (!existingFolder || existingFolder.userId !== req.userId) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const folder = await prisma.mindMapFolder.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || existingFolder.color
      },
      include: {
        _count: {
          select: { mindMaps: true }
        }
      }
    });

    res.json(folder);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: 'Error updating folder' });
  }
});

// Delete folder (mind maps move to root)
router.delete('/folders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if folder exists and belongs to user
    const folder = await prisma.mindMapFolder.findUnique({
      where: { id }
    });

    if (!folder || folder.userId !== req.userId) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Move all mind maps to root (set folderId to null)
    await prisma.mindMap.updateMany({
      where: { folderId: id },
      data: { folderId: null }
    });

    // Delete the folder
    await prisma.mindMapFolder.delete({
      where: { id }
    });

    res.json({ message: 'Folder deleted successfully', id });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Error deleting folder' });
  }
});

// ===========================
// MINDMAP ENDPOINTS
// ===========================

// Get all mind maps for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { folderId, type } = req.query;

    const where: any = { userId: req.userId! };
    
    if (folderId === 'null' || folderId === 'root') {
      where.folderId = null;
    } else if (folderId) {
      where.folderId = folderId as string;
    }

    if (type) {
      where.type = type as string;
    }

    const mindMaps = await prisma.mindMap.findMany({
      where,
      include: {
        folder: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(mindMaps);
  } catch (error) {
    console.error('Error fetching mind maps:', error);
    res.status(500).json({ error: 'Error fetching mind maps' });
  }
});

// Get single mind map by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const mindMap = await prisma.mindMap.findUnique({
      where: { id },
      include: {
        folder: true
      }
    });

    if (!mindMap || mindMap.userId !== req.userId) {
      return res.status(404).json({ error: 'Mind map not found' });
    }

    res.json(mindMap);
  } catch (error) {
    console.error('Error fetching mind map:', error);
    res.status(500).json({ error: 'Error fetching mind map' });
  }
});

// Create new mind map
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, folderId, nodes, edges, metadata } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Mind map title is required' });
    }

    // Validate folder if provided
    if (folderId) {
      const folder = await prisma.mindMapFolder.findUnique({
        where: { id: folderId }
      });

      if (!folder || folder.userId !== req.userId) {
        return res.status(400).json({ error: 'Invalid folder' });
      }
    }

    const mindMap = await prisma.mindMap.create({
      data: {
        userId: req.userId!,
        title: title.trim(),
        description: description?.trim() || null,
        type: type || 'general',
        folderId: folderId || null,
        nodes: nodes || [],
        edges: edges || [],
        metadata: metadata || null,
        aiGenerated: false
      },
      include: {
        folder: true
      }
    });

    res.status(201).json(mindMap);
  } catch (error) {
    console.error('Error creating mind map:', error);
    res.status(500).json({ error: 'Error creating mind map' });
  }
});

// Update mind map
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, folderId, nodes, edges, metadata } = req.body;

    // Check if mind map exists and belongs to user
    const existingMindMap = await prisma.mindMap.findUnique({
      where: { id }
    });

    if (!existingMindMap || existingMindMap.userId !== req.userId) {
      return res.status(404).json({ error: 'Mind map not found' });
    }

    // Validate folder if provided
    if (folderId) {
      const folder = await prisma.mindMapFolder.findUnique({
        where: { id: folderId }
      });

      if (!folder || folder.userId !== req.userId) {
        return res.status(400).json({ error: 'Invalid folder' });
      }
    }

    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (type !== undefined) updateData.type = type;
    if (folderId !== undefined) updateData.folderId = folderId || null;
    if (nodes !== undefined) updateData.nodes = nodes;
    if (edges !== undefined) updateData.edges = edges;
    if (metadata !== undefined) updateData.metadata = metadata;

    const mindMap = await prisma.mindMap.update({
      where: { id },
      data: updateData,
      include: {
        folder: true
      }
    });

    res.json(mindMap);
  } catch (error) {
    console.error('Error updating mind map:', error);
    res.status(500).json({ error: 'Error updating mind map' });
  }
});

// Move mind map to folder
router.patch('/:id/move', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { folderId } = req.body;

    // Check if mind map exists and belongs to user
    const mindMap = await prisma.mindMap.findUnique({
      where: { id }
    });

    if (!mindMap || mindMap.userId !== req.userId) {
      return res.status(404).json({ error: 'Mind map not found' });
    }

    // Validate folder if provided
    if (folderId) {
      const folder = await prisma.mindMapFolder.findUnique({
        where: { id: folderId }
      });

      if (!folder || folder.userId !== req.userId) {
        return res.status(400).json({ error: 'Invalid folder' });
      }
    }

    const updatedMindMap = await prisma.mindMap.update({
      where: { id },
      data: { folderId: folderId || null },
      include: {
        folder: true
      }
    });

    res.json(updatedMindMap);
  } catch (error) {
    console.error('Error moving mind map:', error);
    res.status(500).json({ error: 'Error moving mind map' });
  }
});

// Delete mind map
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if mind map exists and belongs to user
    const mindMap = await prisma.mindMap.findUnique({
      where: { id }
    });

    if (!mindMap || mindMap.userId !== req.userId) {
      return res.status(404).json({ error: 'Mind map not found' });
    }

    await prisma.mindMap.delete({
      where: { id }
    });

    res.json({ message: 'Mind map deleted successfully', id });
  } catch (error) {
    console.error('Error deleting mind map:', error);
    res.status(500).json({ error: 'Error deleting mind map' });
  }
});

// ===========================
// BULK OPERATIONS
// ===========================

// Bulk delete mind maps
router.post('/bulk-delete', async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid mind map IDs' });
    }

    // Verify all mind maps belong to user
    const mindMaps = await prisma.mindMap.findMany({
      where: {
        id: { in: ids },
        userId: req.userId!
      }
    });

    if (mindMaps.length !== ids.length) {
      return res.status(403).json({ error: 'Some mind maps do not belong to you' });
    }

    const result = await prisma.mindMap.deleteMany({
      where: {
        id: { in: ids },
        userId: req.userId!
      }
    });

    res.json({ message: 'Mind maps deleted successfully', count: result.count });
  } catch (error) {
    console.error('Error bulk deleting mind maps:', error);
    res.status(500).json({ error: 'Error bulk deleting mind maps' });
  }
});

// Bulk move mind maps to folder
router.post('/bulk-move', async (req: AuthRequest, res: Response) => {
  try {
    const { ids, folderId } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid mind map IDs' });
    }

    // Validate folder if provided
    if (folderId) {
      const folder = await prisma.mindMapFolder.findUnique({
        where: { id: folderId }
      });

      if (!folder || folder.userId !== req.userId) {
        return res.status(400).json({ error: 'Invalid folder' });
      }
    }

    // Verify all mind maps belong to user
    const mindMaps = await prisma.mindMap.findMany({
      where: {
        id: { in: ids },
        userId: req.userId!
      }
    });

    if (mindMaps.length !== ids.length) {
      return res.status(403).json({ error: 'Some mind maps do not belong to you' });
    }

    const result = await prisma.mindMap.updateMany({
      where: {
        id: { in: ids },
        userId: req.userId!
      },
      data: {
        folderId: folderId || null
      }
    });

    res.json({ message: 'Mind maps moved successfully', count: result.count });
  } catch (error) {
    console.error('Error bulk moving mind maps:', error);
    res.status(500).json({ error: 'Error bulk moving mind maps' });
  }
});

// ===========================
// AI GENERATION ENDPOINTS
// ===========================

// Generate mind map with AI
router.post('/generate', generateMindMap);

// Generate mind map from skill
router.post('/generate/skill/:skillId', generateMindMapFromSkill);

export default router;
