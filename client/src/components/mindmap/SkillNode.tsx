import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Lightbulb } from 'lucide-react';

export interface SkillNodeData {
  label: string;
  category?: string;
  level?: string;
  progress?: number;
  timeSpent?: string;
  startDate?: string;
  dueDate?: string;
}

export const SkillNode = memo(({ data, selected }: NodeProps<SkillNodeData>) => {
  return (
    <>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-chart-2" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-chart-2" />
      <div 
        className={`w-[160px] bg-background border rounded-lg shadow-sm p-2 transition-all ${
          selected ? 'ring-2 ring-chart-2 shadow-md' : 'hover:shadow-md'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-chart-2 flex-shrink-0" />
          <span className="text-xs font-medium truncate">{data.label}</span>
        </div>
        {data.level && (
          <div className="mt-1 text-[10px] text-muted-foreground truncate">
            {data.level}
          </div>
        )}
        {data.progress !== undefined && (
          <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-chart-2" style={{ width: `${data.progress}%` }} />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-chart-2" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-chart-2" />
    </>
  );
});

SkillNode.displayName = 'SkillNode';
