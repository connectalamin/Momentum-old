import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText } from 'lucide-react';

export interface TopicNodeData {
  label: string;
  description?: string;
  color?: string;
  startDate?: string;
  dueDate?: string;
}

export const TopicNode = memo(({ data, selected }: NodeProps<TopicNodeData>) => {
  const borderColor = data.color || 'hsl(var(--chart-4))';
  
  return (
    <>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-chart-4" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-chart-4" />
      <div 
        className={`w-[130px] bg-background border rounded-lg shadow-sm p-2 transition-all ${
          selected ? 'ring-2 ring-chart-4 shadow-md' : 'hover:shadow-md'
        }`}
        style={{ borderLeftWidth: '3px', borderLeftColor: borderColor }}
      >
        <div className="flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-chart-4 flex-shrink-0" />
          <span className="text-[11px] font-medium truncate">{data.label}</span>
        </div>
        {data.description && (
          <div className="mt-0.5 text-[10px] text-muted-foreground truncate">
            {data.description}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-chart-4" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-chart-4" />
    </>
  );
});

TopicNode.displayName = 'TopicNode';
