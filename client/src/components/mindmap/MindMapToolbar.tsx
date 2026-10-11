import { Plus, Download, Layout, ZoomIn, ZoomOut, Maximize2, Sparkles, Save } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';

interface MindMapToolbarProps {
  onAddNode?: (type: 'course' | 'skill' | 'milestone' | 'topic' | 'custom') => void;
  onLayout?: (direction: 'horizontal' | 'vertical' | 'tree') => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onExport?: (format: 'png' | 'json') => void;
  onAIGenerate?: () => void;
  onSave?: () => void;
  canSave?: boolean;
  isLoading?: boolean;
}

export function MindMapToolbar({
  onAddNode,
  onLayout,
  onZoomIn,
  onZoomOut,
  onFitView,
  onExport,
  onAIGenerate,
  onSave,
  canSave = false,
  isLoading = false,
}: MindMapToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-card border-b border-border">
      {/* Add Node Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Node
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onAddNode?.('course')}>
            <span className="text-chart-1 mr-2">●</span> Course
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode?.('skill')}>
            <span className="text-chart-2 mr-2">●</span> Skill
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode?.('milestone')}>
            <span className="text-chart-3 mr-2">●</span> Milestone
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode?.('topic')}>
            <span className="text-chart-4 mr-2">●</span> Topic
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onAddNode?.('custom')}>
            <span className="text-chart-5 mr-2">●</span> Custom
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-8" />

      {/* Layout Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Layout className="w-4 h-4" />
            Layout
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onLayout?.('horizontal')}>
            Horizontal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onLayout?.('vertical')}>
            Vertical
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onLayout?.('tree')}>
            Tree
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-8" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onFitView}
          title="Fit View"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* AI Generate */}
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={onAIGenerate}
        disabled={isLoading}
      >
        <Sparkles className="w-4 h-4" />
        AI Generate
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onExport?.('png')}>
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onExport?.('json')}>
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save Button */}
      {canSave && (
        <Button
          variant="default"
          size="sm"
          className="gap-2"
          onClick={onSave}
          disabled={isLoading}
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
      )}
    </div>
  );
}
