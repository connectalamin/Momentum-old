import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export interface MilestoneNodeData {
  label: string;
  status?: string;
  estimatedHours?: number;
  order?: number;
  startDate?: string;
  dueDate?: string;
}

export const MilestoneNode = memo(({ data, selected }: NodeProps<MilestoneNodeData>) => {
  const isCompleted = data.status === 'completed';
  const isInProgress = data.status === 'in-progress';

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-chart-3" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-chart-3" />
      <div 
        className={`w-[140px] bg-background border rounded-lg shadow-sm p-2 transition-all ${
          selected ? 'ring-2 ring-chart-3 shadow-md' : 'hover:shadow-md'
        } ${isCompleted ? 'bg-primary/5 border-primary/30' : ''}`}
      >
        <div className="flex items-center gap-1.5">
          {isCompleted ? (
            <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
          ) : isInProgress ? (
            <Clock className="w-3 h-3 text-chart-3 flex-shrink-0" />
          ) : (
            <Circle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-[11px] font-medium truncate">{data.label}</span>
        </div>
        {data.status && (
          <div className="mt-0.5 text-[10px] text-muted-foreground truncate">
            {data.status}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-chart-3" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-chart-3" />
    </>
  );
});

MilestoneNode.displayName = 'MilestoneNode';
