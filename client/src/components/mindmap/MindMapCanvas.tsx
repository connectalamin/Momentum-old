import { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Panel,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
  ConnectionMode,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CourseNode } from './CourseNode';
import { SkillNode } from './SkillNode';
import { MilestoneNode } from './MilestoneNode';
import { TopicNode } from './TopicNode';
import { CustomNode } from './CustomNode';

interface MindMapCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  editable?: boolean;
}

export function MindMapCanvas({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeDoubleClick,
  editable = true,
}: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const { setCenter } = useReactFlow();

  // Update nodes and edges when initial values change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Center on root node when nodes load
  useEffect(() => {
    if (initialNodes.length > 0) {
      // Find root node - look for 'center', 'root', or first node
      const rootNode = initialNodes.find(n => 
        n.id === 'center' || 
        n.id === 'root' || 
        n.id.includes('central')
      ) || initialNodes[0];
      
      if (rootNode) {
        // Small delay to ensure ReactFlow is ready
        setTimeout(() => {
          setCenter(
            rootNode.position.x + 80, // offset for node width
            rootNode.position.y + 40, // offset for node height
            { zoom: 0.8, duration: 300 }
          );
        }, 100);
      }
    }
  }, [initialNodes, setCenter]);

  // Custom node types
  const nodeTypes = useMemo(
    () => ({
      course: CourseNode,
      skill: SkillNode,
      milestone: MilestoneNode,
      topic: TopicNode,
      custom: CustomNode,
    }),
    []
  );

  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      if (editable) {
        const newEdges = addEdge({ ...params, type: 'smoothstep', animated: false }, edges);
        setEdges(newEdges);
        onEdgesChange?.(newEdges);
      }
    },
    [editable, edges, setEdges, onEdgesChange]
  );

  // Handle node changes and notify parent
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeInternal(changes);
    },
    [onNodesChangeInternal]
  );

  // Handle edge changes and notify parent
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes);
    },
    [onEdgesChangeInternal]
  );

  // Notify parent of node changes after state update
  useEffect(() => {
    if (onNodesChange) {
      onNodesChange(nodes);
    }
  }, [nodes, onNodesChange]);

  // Notify parent of edge changes after state update
  useEffect(() => {
    if (onEdgesChange) {
      onEdgesChange(edges);
    }
  }, [edges, onEdgesChange]);

  // Node color for minimap
  const nodeColor = (node: Node) => {
    switch (node.type) {
      case 'course':
        return 'hsl(var(--chart-1))';
      case 'skill':
        return 'hsl(var(--chart-2))';
      case 'milestone':
        return 'hsl(var(--chart-3))';
      case 'topic':
        return 'hsl(var(--chart-4))';
      default:
        return 'hsl(var(--primary))';
    }
  };

  return (
    <div className="w-full h-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-background"
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable={editable}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{
          stroke: 'hsl(var(--primary))',
          strokeWidth: 2,
        }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { strokeWidth: 2 },
        }}
      >
        <Background 
          color="hsl(var(--border))" 
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
        />
        <Controls 
          className="bg-card border border-border rounded-lg shadow-lg"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={nodeColor}
          className="bg-card border border-border rounded-lg shadow-lg"
          maskColor="hsl(var(--muted) / 0.3)"
        />
        <Panel position="top-right" className="text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border">
          {editable ? 'Edit Mode' : 'View Only'}
        </Panel>
      </ReactFlow>
    </div>
  );
}
