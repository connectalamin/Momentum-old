import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Boxes } from 'lucide-react';

export interface CustomNodeData {
  label: string;
  description?: string;
  color?: string;
  startDate?: string;
  dueDate?: string;
}

export const CustomNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => {
  const color = data.color || 'hsl(var(--chart-5))';

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-2 h-2" style={{ background: color }} />
      <Handle type="target" position={Position.Left} className="w-2 h-2" style={{ background: color }} />
      <div 
        className={`w-[140px] bg-background border rounded-lg shadow-sm p-2 transition-all ${
          selected ? 'ring-2 shadow-md' : 'hover:shadow-md'
        }`}
        style={{ borderColor: selected ? color : undefined }}
      >
        <div className="flex items-center gap-1.5">
          <Boxes className="w-3 h-3 flex-shrink-0" style={{ color }} />
          <span className="text-[11px] font-medium truncate">{data.label}</span>
        </div>
        {data.description && (
          <div className="mt-0.5 text-[10px] text-muted-foreground truncate">
            {data.description}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2" style={{ background: color }} />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" style={{ background: color }} />
    </>
  );
});

CustomNode.displayName = 'CustomNode';
