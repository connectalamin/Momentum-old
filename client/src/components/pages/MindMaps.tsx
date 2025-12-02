import { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge, ReactFlowProvider } from 'reactflow';
import { Plus, Network, Grid3x3, Trash2, Edit, Eye, Folder, FolderOpen, FolderPlus, ChevronRight, Home, MoreVertical, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { MindMapCanvas } from '../mindmap/MindMapCanvas';
import { MindMapToolbar } from '../mindmap/MindMapToolbar';
import { toast } from 'sonner';
import dagre from 'dagre';
import { mindMapAPI, mindMapFolderAPI } from '../../lib/mindmap.api';

interface MindMapFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

interface MindMap {
  id: string;
  title: string;
  description?: string;
  type: 'course' | 'skill' | 'general';
  folderId: string | null;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

export function MindMaps() {
  const [view, setView] = useState<'list' | 'canvas'>('list');
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [folders, setFolders] = useState<MindMapFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedMindMap, setSelectedMindMap] = useState<MindMap | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);
  const [isMoveToFolderModalOpen, setIsMoveToFolderModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false);
  const [mindMapToDelete, setMindMapToDelete] = useState<string | null>(null);
  const [mindMapToMove, setMindMapToMove] = useState<string | null>(null);
  const [folderToEdit, setFolderToEdit] = useState<MindMapFolder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [isNodeEditModalOpen, setIsNodeEditModalOpen] = useState(false);
  const [isCustomNodeModalOpen, setIsCustomNodeModalOpen] = useState(false);
  const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newMindMap, setNewMindMap] = useState({
    title: '',
    description: '',
    type: 'general' as 'course' | 'skill' | 'general',
    folderId: null as string | null,
  });

  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    color: 'hsl(var(--chart-1))',
  });

  const [newCustomNode, setNewCustomNode] = useState({
    label: '',
    description: '',
    color: 'hsl(var(--chart-5))',
    startDate: '',
    dueDate: '',
  });

  const [aiGenerateForm, setAiGenerateForm] = useState({
    topic: '',
    description: '',
    type: 'general' as 'course' | 'skill' | 'general',
    context: '',
    folderId: null as string | null,
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Fetch folders and mind maps on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedFolders, fetchedMindMaps] = await Promise.all([
        mindMapFolderAPI.getFolders(),
        mindMapAPI.getMindMaps()
      ]);
      setFolders(fetchedFolders);
      setMindMaps(fetchedMindMaps);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load mind maps');
    } finally {
      setLoading(false);
    }
  };

  // Get filtered mind maps based on selected folder
  const filteredMindMaps = selectedFolder
    ? mindMaps.filter((m) => m.folderId === selectedFolder)
    : mindMaps.filter((m) => !m.folderId);

  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolder.name.trim()) {
      toast.error('Please enter folder name');
      return;
    }

    try {
      const folder = await mindMapFolderAPI.createFolder({
        name: newFolder.name,
        description: newFolder.description,
        color: newFolder.color
      });
      setFolders([...folders, folder]);
      setNewFolder({ name: '', description: '', color: 'hsl(var(--chart-1))' });
      setIsCreateFolderModalOpen(false);
      toast.success('Folder created successfully!');
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  // Edit folder
  const handleEditFolder = async () => {
    if (!folderToEdit || !folderToEdit.name.trim()) {
      toast.error('Please enter folder name');
      return;
    }

    try {
      const updated = await mindMapFolderAPI.updateFolder(folderToEdit.id, {
        name: folderToEdit.name,
        description: folderToEdit.description,
        color: folderToEdit.color
      });
      const updatedFolders = folders.map((f) => f.id === folderToEdit.id ? updated : f);
      setFolders(updatedFolders);
      setFolderToEdit(null);
      setIsEditFolderModalOpen(false);
      toast.success('Folder updated successfully!');
    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error('Failed to update folder');
    }
  };

  // Delete folder
  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      await mindMapFolderAPI.deleteFolder(folderToDelete);
      const updatedMindMaps = mindMaps.map((m) =>
        m.folderId === folderToDelete ? { ...m, folderId: null } : m
      );
      setMindMaps(updatedMindMaps);
      setFolders(folders.filter((f) => f.id !== folderToDelete));
      
      if (selectedFolder === folderToDelete) {
        setSelectedFolder(null);
      }

      setFolderToDelete(null);
      setIsDeleteFolderDialogOpen(false);
      toast.success('Folder deleted and mind maps moved to root');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  // Move mind map to folder
  const handleMoveMindMap = async (targetFolderId: string | null) => {
    if (!mindMapToMove) return;

    try {
      const updated = await mindMapAPI.moveMindMap(mindMapToMove, targetFolderId);
      const updatedMindMaps = mindMaps.map((m) => m.id === mindMapToMove ? updated : m);
      setMindMaps(updatedMindMaps);
      setMindMapToMove(null);
      setIsMoveToFolderModalOpen(false);
      toast.success('Mind map moved successfully!');
    } catch (error) {
      console.error('Error moving mind map:', error);
      toast.error('Failed to move mind map');
    }
  };

  // Create new mind map
  const handleCreateMindMap = async () => {
    if (!newMindMap.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      const mindMap = await mindMapAPI.createMindMap({
        title: newMindMap.title,
        description: newMindMap.description,
        type: newMindMap.type,
        folderId: newMindMap.folderId,
        nodes: [],
        edges: []
      });
      setMindMaps([...mindMaps, mindMap]);
      setSelectedMindMap(mindMap);
      setView('canvas');
      setIsCreateModalOpen(false);
      setNewMindMap({ title: '', description: '', type: 'general', folderId: null });
      toast.success('Mind map created successfully!');
    } catch (error) {
      console.error('Error creating mind map:', error);
      toast.error('Failed to create mind map');
    }
  };

  // Open mind map in canvas
  const handleOpenMindMap = (mindMap: MindMap) => {
    setSelectedMindMap(mindMap);
    setView('canvas');
  };

  // Delete mind map
  const handleDeleteMindMap = async () => {
    if (!mindMapToDelete) return;

    try {
      await mindMapAPI.deleteMindMap(mindMapToDelete);
      setMindMaps(mindMaps.filter((m) => m.id !== mindMapToDelete));
      if (selectedMindMap?.id === mindMapToDelete) {
        setSelectedMindMap(null);
        setView('list');
      }
      toast.success('Mind map deleted successfully');
      setIsDeleteDialogOpen(false);
      setMindMapToDelete(null);
    } catch (error) {
      console.error('Error deleting mind map:', error);
      toast.error('Failed to delete mind map');
    }
  };

  // Add node to canvas
  const handleAddNode = useCallback(
    (type: 'course' | 'skill' | 'milestone' | 'topic' | 'custom') => {
      if (!selectedMindMap) return;

      // If custom node, open dialog
      if (type === 'custom') {
        setIsCustomNodeModalOpen(true);
        return;
      }

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type,
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          ...(type === 'course' && { courseCode: 'CODE', progress: 0, credits: 3 }),
          ...(type === 'skill' && { category: 'General', level: 'beginner', progress: 0 }),
          ...(type === 'milestone' && { status: 'pending', estimatedHours: 10 }),
          ...(type === 'topic' && { description: 'New topic' }),
          startDate: undefined,
          dueDate: undefined,
        },
      };

      setSelectedMindMap({
        ...selectedMindMap,
        nodes: [...selectedMindMap.nodes, newNode],
        updatedAt: new Date().toISOString(),
      });

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} node added`);
    },
    [selectedMindMap]
  );

  // Auto-layout algorithm using dagre
  const getLayoutedElements = (
    nodes: Node[],
    edges: Edge[],
    direction: 'TB' | 'LR' = 'TB'
  ) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 250, height: 150 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 125,
          y: nodeWithPosition.y - 75,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  };

  // Handle layout
  const handleLayout = (direction: 'horizontal' | 'vertical' | 'tree') => {
    if (!selectedMindMap) return;

    const layoutDirection = direction === 'horizontal' ? 'LR' : 'TB';
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      selectedMindMap.nodes,
      selectedMindMap.edges,
      layoutDirection
    );

    setSelectedMindMap({
      ...selectedMindMap,
      nodes: layoutedNodes,
      edges: layoutedEdges,
      updatedAt: new Date().toISOString(),
    });

    toast.success('Layout applied');
  };

  // Create custom node
  const handleCreateCustomNode = async () => {
    if (!selectedMindMap || !newCustomNode.label.trim()) {
      toast.error('Please provide a label for the custom node');
      return;
    }

    const customNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label: newCustomNode.label,
        description: newCustomNode.description || undefined,
        color: newCustomNode.color,
        startDate: newCustomNode.startDate || undefined,
        dueDate: newCustomNode.dueDate || undefined,
      },
    };

    setSelectedMindMap({
      ...selectedMindMap,
      nodes: [...selectedMindMap.nodes, customNode],
      updatedAt: new Date().toISOString(),
    });

    // Reset form and close dialog
    setNewCustomNode({
      label: '',
      description: '',
      color: 'hsl(var(--chart-5))',
      startDate: '',
      dueDate: '',
    });
    setIsCustomNodeModalOpen(false);
    toast.success('Custom node added');
  };

  // Handle node changes
  const handleNodesChange = useCallback(
    (updatedNodes: Node[]) => {
      if (selectedMindMap) {
        setSelectedMindMap({
          ...selectedMindMap,
          nodes: updatedNodes,
          updatedAt: new Date().toISOString(),
        });
      }
    },
    [selectedMindMap]
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (updatedEdges: Edge[]) => {
      if (selectedMindMap) {
        setSelectedMindMap({
          ...selectedMindMap,
          edges: updatedEdges,
          updatedAt: new Date().toISOString(),
        });
      }
    },
    [selectedMindMap]
  );

  // Handle node double click for editing
  const handleNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setEditingNode(node);
    setIsNodeEditModalOpen(true);
  }, []);

  // Save node edit
  const handleSaveNodeEdit = () => {
    if (!editingNode || !selectedMindMap) return;

    const updatedNodes = selectedMindMap.nodes.map((node) =>
      node.id === editingNode.id ? editingNode : node
    );

    setSelectedMindMap({
      ...selectedMindMap,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString(),
    });

    setIsNodeEditModalOpen(false);
    setEditingNode(null);
    toast.success('Node updated');
  };

  // Save mind map
  const handleSaveMindMap = async () => {
    if (!selectedMindMap) return;

    try {
      const updated = await mindMapAPI.updateMindMap(selectedMindMap.id, {
        nodes: selectedMindMap.nodes,
        edges: selectedMindMap.edges
      });
      const updatedMindMaps = mindMaps.map((m) => m.id === selectedMindMap.id ? updated : m);
      setMindMaps(updatedMindMaps);
      setSelectedMindMap(updated);
      toast.success('Mind map saved successfully!');
    } catch (error) {
      console.error('Error saving mind map:', error);
      toast.error('Failed to save mind map');
    }
  };

  // Export
  const handleExport = (format: 'png' | 'json') => {
    if (!selectedMindMap) return;

    if (format === 'json') {
      const dataStr = JSON.stringify(selectedMindMap, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `${selectedMindMap.title.replace(/\s+/g, '_')}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast.success('Exported as JSON');
    } else {
      toast.info('PNG export coming soon!');
    }
  };

  // AI Generate
  const handleAIGenerate = () => {
    setIsAIGenerateModalOpen(true);
  };

  const handleGenerateWithAI = async () => {
    if (!aiGenerateForm.topic.trim()) {
      toast.error('Please provide a topic for the mind map');
      return;
    }

    setAiGenerating(true);
    try {
      const generatedData = await mindMapAPI.generateWithAI({
        topic: aiGenerateForm.topic,
        description: aiGenerateForm.description || undefined,
        type: aiGenerateForm.type,
        context: aiGenerateForm.context || undefined,
      });

      // Create the mind map with generated data
      const mindMap = await mindMapAPI.createMindMap({
        title: generatedData.title,
        description: generatedData.description,
        type: aiGenerateForm.type,
        folderId: aiGenerateForm.folderId,
        nodes: generatedData.nodes,
        edges: generatedData.edges,
        metadata: { aiGenerated: true, topic: aiGenerateForm.topic },
      });

      setMindMaps([...mindMaps, mindMap]);
      setSelectedMindMap(mindMap);
      setView('canvas');
      
      // Reset form
      setAiGenerateForm({
        topic: '',
        description: '',
        type: 'general',
        context: '',
        folderId: null,
      });
      setIsAIGenerateModalOpen(false);
      toast.success('Mind map generated successfully with AI!');
    } catch (error) {
      console.error('Error generating mind map:', error);
      toast.error('Failed to generate mind map with AI');
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Network className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading mind maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={view === 'canvas' ? '' : 'space-y-6'}>
      {/* Header - hidden in canvas view */}
      {view !== 'canvas' && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Mind Maps</h1>
            <p className="text-muted-foreground">
              Visualize your learning journey and organize your thoughts
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsAIGenerateModalOpen(true)} 
              variant="outline"
              className="gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Mind Map
            </Button>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <Tabs value={view} onValueChange={(v: string) => setView(v as 'list' | 'canvas')}>
        {view === 'canvas' ? (
          /* Canvas View Header */
          <div className="flex items-center gap-4 pb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setView('list')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </Button>
            {selectedMindMap && (
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{selectedMindMap.title}</h2>
              </div>
            )}
          </div>
        ) : (
          /* List View Tabs */
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <Grid3x3 className="w-4 h-4" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="canvas" className="gap-2" disabled={!selectedMindMap}>
              <Network className="w-4 h-4" />
              Canvas View
            </TabsTrigger>
          </TabsList>
        )}

        {/* List View */}
        <TabsContent value="list" className="mt-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setSelectedFolder(null)}
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            {selectedFolder && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-foreground">
                  {folders.find((f) => f.id === selectedFolder)?.name}
                </span>
              </>
            )}
          </div>

          {/* Show folders if not inside a folder */}
          {!selectedFolder && folders.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Folders</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateFolderModalOpen(true)}
                  className="gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  New Folder
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {folders.map((folder) => {
                  const folderMindMaps = mindMaps.filter((m) => m.folderId === folder.id);
                  return (
                    <div
                      key={folder.id}
                      className="group relative"
                    >
                      <div
                        className="aspect-square rounded-lg border-2 border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all cursor-pointer p-4 flex flex-col items-center justify-center"
                        onClick={() => setSelectedFolder(folder.id)}
                      >
                        <Folder 
                          className="w-16 h-16 mb-2" 
                          style={{ color: folder.color }}
                          strokeWidth={1.5}
                        />
                        <p className="font-medium text-sm text-center line-clamp-1 w-full">
                          {folder.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {folderMindMaps.length} {folderMindMaps.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e: any) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e: any) => {
                              e.stopPropagation();
                              setFolderToEdit(folder);
                              setIsEditFolderModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e: any) => {
                              e.stopPropagation();
                              setFolderToDelete(folder.id);
                              setIsDeleteFolderDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mind Maps Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {selectedFolder ? 'Mind Maps' : 'Uncategorized Mind Maps'}
            </h3>
          </div>

          {filteredMindMaps.length === 0 ? (
            <Card className="p-8 text-center">
              <Network className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <CardTitle className="text-base mb-2">
                {selectedFolder ? 'No mind maps in this folder' : 'No mind maps yet'}
              </CardTitle>
              <CardDescription className="text-sm mb-4">
                {selectedFolder
                  ? 'Create a new mind map to add to this folder'
                  : 'Create your first mind map to start organizing your thoughts'}
              </CardDescription>
              <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Mind Map
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredMindMaps.map((mindMap) => (
                <div
                  key={mindMap.id}
                  className="group relative"
                >
                  <div
                    className="aspect-square rounded-lg border-2 border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all cursor-pointer p-4 flex flex-col items-center justify-center"
                    onClick={() => handleOpenMindMap(mindMap)}
                  >
                    <Network 
                      className="w-12 h-12 mb-2 text-muted-foreground" 
                      strokeWidth={1.5}
                    />
                    <p className="font-medium text-sm text-center line-clamp-2 w-full mb-1">
                      {mindMap.title}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {mindMap.type}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e: any) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e: any) => {
                          e.stopPropagation();
                          handleOpenMindMap(mindMap);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e: any) => {
                          e.stopPropagation();
                          setMindMapToMove(mindMap.id);
                          setIsMoveToFolderModalOpen(true);
                        }}
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Move
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e: any) => {
                          e.stopPropagation();
                          setMindMapToDelete(mindMap.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Canvas View */}
        <TabsContent value="canvas" className="mt-0 -mx-6 -mb-6">
          {selectedMindMap && (
            <ReactFlowProvider>
              <div className="h-[calc(100vh-120px)] border-t border-border overflow-hidden bg-background">
                <MindMapToolbar
                  onAddNode={handleAddNode}
                  onLayout={handleLayout}
                  onExport={handleExport}
                  onAIGenerate={handleAIGenerate}
                  onSave={handleSaveMindMap}
                  canSave={true}
                />
                <div ref={canvasRef} className="h-[calc(100%-48px)]">
                  <MindMapCanvas
                    initialNodes={selectedMindMap.nodes}
                    initialEdges={selectedMindMap.edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onNodeDoubleClick={handleNodeDoubleClick}
                    editable={true}
                  />
                </div>
              </div>
            </ReactFlowProvider>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Mind Map Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Mind Map</DialogTitle>
            <DialogDescription>
              Start organizing your thoughts with a new mind map
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Software Engineering Roadmap"
                value={newMindMap.title}
                onChange={(e) => setNewMindMap({ ...newMindMap, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this mind map about?"
                value={newMindMap.description}
                onChange={(e) => setNewMindMap({ ...newMindMap, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={newMindMap.type}
                onValueChange={(value: 'course' | 'skill' | 'general') =>
                  setNewMindMap({ ...newMindMap, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="skill">Skill</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="folder">Folder (Optional)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsCreateFolderModalOpen(true);
                  }}
                  className="gap-1 h-auto p-0 text-xs"
                >
                  <FolderPlus className="w-3 h-3" />
                  Create Folder
                </Button>
              </div>
              <Select
                value={newMindMap.folderId || 'none'}
                onValueChange={(value: string) =>
                  setNewMindMap({ ...newMindMap, folderId: value === 'none' ? null : value })
                }
              >
                <SelectTrigger id="folder">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: folder.color }}
                        />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMindMap}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Node Edit Modal */}
      <Dialog open={isNodeEditModalOpen} onOpenChange={setIsNodeEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
            <DialogDescription>
              Update node details and dates
            </DialogDescription>
          </DialogHeader>
          {editingNode && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-label">Label</Label>
                <Input
                  id="edit-label"
                  value={editingNode.data.label || ''}
                  onChange={(e) =>
                    setEditingNode({
                      ...editingNode,
                      data: { ...editingNode.data, label: e.target.value },
                    })
                  }
                />
              </div>
              
              {/* Description for topic and custom nodes */}
              {(editingNode.type === 'topic' || editingNode.type === 'custom') && (
                <div>
                  <Label htmlFor="edit-description">Description (Optional)</Label>
                  <Textarea
                    id="edit-description"
                    value={editingNode.data.description || ''}
                    onChange={(e) =>
                      setEditingNode({
                        ...editingNode,
                        data: { ...editingNode.data, description: e.target.value },
                      })
                    }
                    rows={2}
                  />
                </div>
              )}

              {/* Course-specific fields */}
              {editingNode.type === 'course' && (
                <>
                  <div>
                    <Label htmlFor="edit-course-code">Course Code</Label>
                    <Input
                      id="edit-course-code"
                      value={editingNode.data.courseCode || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, courseCode: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-credits">Credits</Label>
                      <Input
                        id="edit-credits"
                        type="number"
                        min="0"
                        value={editingNode.data.credits || ''}
                        onChange={(e) =>
                          setEditingNode({
                            ...editingNode,
                            data: { ...editingNode.data, credits: parseInt(e.target.value) || 0 },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-progress">Progress (%)</Label>
                      <Input
                        id="edit-progress"
                        type="number"
                        min="0"
                        max="100"
                        value={editingNode.data.progress || ''}
                        onChange={(e) =>
                          setEditingNode({
                            ...editingNode,
                            data: { ...editingNode.data, progress: parseInt(e.target.value) || 0 },
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Skill-specific fields */}
              {editingNode.type === 'skill' && (
                <>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Input
                      id="edit-category"
                      value={editingNode.data.category || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, category: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-level">Level</Label>
                      <Select
                        value={editingNode.data.level || 'beginner'}
                        onValueChange={(value: string) =>
                          setEditingNode({
                            ...editingNode,
                            data: { ...editingNode.data, level: value },
                          })
                        }
                      >
                        <SelectTrigger id="edit-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-skill-progress">Progress (%)</Label>
                      <Input
                        id="edit-skill-progress"
                        type="number"
                        min="0"
                        max="100"
                        value={editingNode.data.progress || ''}
                        onChange={(e) =>
                          setEditingNode({
                            ...editingNode,
                            data: { ...editingNode.data, progress: parseInt(e.target.value) || 0 },
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Milestone-specific fields */}
              {editingNode.type === 'milestone' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={editingNode.data.status || 'pending'}
                      onValueChange={(value: string) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, status: value },
                        })
                      }
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-hours">Estimated Hours</Label>
                    <Input
                      id="edit-hours"
                      type="number"
                      min="0"
                      value={editingNode.data.estimatedHours || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, estimatedHours: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Dates for all node types */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start-date">Start Date (Optional)</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={editingNode.data.startDate || ''}
                    onChange={(e) =>
                      setEditingNode({
                        ...editingNode,
                        data: { ...editingNode.data, startDate: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-due-date">Due Date (Optional)</Label>
                  <Input
                    id="edit-due-date"
                    type="date"
                    value={editingNode.data.dueDate || ''}
                    onChange={(e) =>
                      setEditingNode({
                        ...editingNode,
                        data: { ...editingNode.data, dueDate: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNodeEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNodeEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Custom Node Modal */}
      <Dialog open={isCustomNodeModalOpen} onOpenChange={setIsCustomNodeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Node</DialogTitle>
            <DialogDescription>
              Create a custom node with your own label and styling
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-label">Label *</Label>
              <Input
                id="custom-label"
                placeholder="e.g., Research Phase"
                value={newCustomNode.label}
                onChange={(e) => setNewCustomNode({ ...newCustomNode, label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="custom-description">Description (Optional)</Label>
              <Textarea
                id="custom-description"
                placeholder="Additional details about this node"
                value={newCustomNode.description}
                onChange={(e) => setNewCustomNode({ ...newCustomNode, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="custom-color">Color</Label>
              <Select
                value={newCustomNode.color}
                onValueChange={(value: string) => setNewCustomNode({ ...newCustomNode, color: value })}
              >
                <SelectTrigger id="custom-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hsl(var(--chart-1))">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                      Chart 1
                    </div>
                  </SelectItem>
                  <SelectItem value="hsl(var(--chart-2))">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                      Chart 2
                    </div>
                  </SelectItem>
                  <SelectItem value="hsl(var(--chart-3))">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
                      Chart 3
                    </div>
                  </SelectItem>
                  <SelectItem value="hsl(var(--chart-4))">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-4))' }} />
                      Chart 4
                    </div>
                  </SelectItem>
                  <SelectItem value="hsl(var(--chart-5))">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-5))' }} />
                      Chart 5
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custom-start-date">Start Date (Optional)</Label>
                <Input
                  id="custom-start-date"
                  type="date"
                  value={newCustomNode.startDate}
                  onChange={(e) => setNewCustomNode({ ...newCustomNode, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="custom-due-date">Due Date (Optional)</Label>
                <Input
                  id="custom-due-date"
                  type="date"
                  value={newCustomNode.dueDate}
                  onChange={(e) => setNewCustomNode({ ...newCustomNode, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomNodeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomNode}>Create Node</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generate Mind Map Modal */}
      <Dialog open={isAIGenerateModalOpen} onOpenChange={setIsAIGenerateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate Mind Map with AI
            </DialogTitle>
            <DialogDescription>
              Let AI create a comprehensive mind map based on your topic
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-topic">Topic *</Label>
              <Input
                id="ai-topic"
                placeholder="e.g., Machine Learning, Web Development, etc."
                value={aiGenerateForm.topic}
                onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, topic: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ai-description">Description (Optional)</Label>
              <Textarea
                id="ai-description"
                placeholder="Provide more context about what you want to learn or explore..."
                value={aiGenerateForm.description}
                onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="ai-type">Type</Label>
              <Select
                value={aiGenerateForm.type}
                onValueChange={(value: 'course' | 'skill' | 'general') =>
                  setAiGenerateForm({ ...aiGenerateForm, type: value })
                }
              >
                <SelectTrigger id="ai-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="skill">Skill</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ai-context">Additional Context (Optional)</Label>
              <Textarea
                id="ai-context"
                placeholder="Any specific requirements, goals, or focus areas..."
                value={aiGenerateForm.context}
                onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, context: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="ai-folder">Folder (Optional)</Label>
              <Select
                value={aiGenerateForm.folderId || 'none'}
                onValueChange={(value: string) =>
                  setAiGenerateForm({ ...aiGenerateForm, folderId: value === 'none' ? null : value })
                }
              >
                <SelectTrigger id="ai-folder">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: folder.color }}
                        />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAIGenerateModalOpen(false)}
              disabled={aiGenerating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateWithAI}
              disabled={aiGenerating}
              className="gap-2"
            >
              {aiGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
              {aiGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mind Map?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this mind map.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMindMap}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Folder Modal */}
      <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Organize your mind maps by creating a new folder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="e.g., Academic, Skills"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="folder-description">Description (Optional)</Label>
              <Textarea
                id="folder-description"
                placeholder="What is this folder for?"
                value={newFolder.description}
                onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="folder-color">Color</Label>
              <div className="flex gap-2 mt-2">
                {[
                  'hsl(var(--chart-1))',
                  'hsl(var(--chart-2))',
                  'hsl(var(--chart-3))',
                  'hsl(var(--chart-4))',
                  'hsl(var(--chart-5))',
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newFolder.color === color ? 'border-foreground scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewFolder({ ...newFolder, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateFolderModalOpen(false);
                setNewFolder({ name: '', description: '', color: 'hsl(var(--chart-1))' });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Modal */}
      <Dialog open={isEditFolderModalOpen} onOpenChange={setIsEditFolderModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          {folderToEdit && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-folder-name">Folder Name</Label>
                <Input
                  id="edit-folder-name"
                  value={folderToEdit.name}
                  onChange={(e) =>
                    setFolderToEdit({ ...folderToEdit, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-folder-description">Description (Optional)</Label>
                <Textarea
                  id="edit-folder-description"
                  value={folderToEdit.description || ''}
                  onChange={(e) =>
                    setFolderToEdit({ ...folderToEdit, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {[
                    'hsl(var(--chart-1))',
                    'hsl(var(--chart-2))',
                    'hsl(var(--chart-3))',
                    'hsl(var(--chart-4))',
                    'hsl(var(--chart-5))',
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        folderToEdit.color === color ? 'border-foreground scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFolderToEdit({ ...folderToEdit, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFolder}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Folder Modal */}
      <Dialog open={isMoveToFolderModalOpen} onOpenChange={setIsMoveToFolderModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
            <DialogDescription>
              Select a folder to move this mind map to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleMoveMindMap(null)}
            >
              <Home className="w-4 h-4 mr-2" />
              No Folder (Root)
            </Button>
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleMoveMindMap(folder.id)}
              >
                <Folder className="w-4 h-4 mr-2" style={{ color: folder.color }} />
                {folder.name}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveToFolderModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation */}
      <AlertDialog open={isDeleteFolderDialogOpen} onOpenChange={setIsDeleteFolderDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the folder and move all mind maps inside to the root level.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder}>Delete Folder</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
