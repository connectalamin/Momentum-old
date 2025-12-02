import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GraduationCap } from 'lucide-react';

export interface CourseNodeData {
  label: string;
  courseCode?: string;
  progress?: number;
  credits?: number;
  status?: string;
  startDate?: string;
  dueDate?: string;
}

export const CourseNode = memo(({ data, selected }: NodeProps<CourseNodeData>) => {
  return (
    <>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-chart-1" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-chart-1" />
      <div 
        className={`w-[150px] bg-background border rounded-lg shadow-sm p-2 transition-all ${
          selected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-chart-1 flex-shrink-0" />
          <span className="text-xs font-medium truncate">{data.label}</span>
        </div>
        {data.courseCode && (
          <div className="mt-0.5 text-[10px] text-muted-foreground truncate">
            {data.courseCode}
          </div>
        )}
        {data.progress !== undefined && (
          <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-chart-1" style={{ width: `${data.progress}%` }} />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-chart-1" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-chart-1" />
    </>
  );
});

CourseNode.displayName = 'CourseNode';
