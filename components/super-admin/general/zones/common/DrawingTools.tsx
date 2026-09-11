'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const tools = [
  { name: 'circle', icon: '/svgs/circle-icon.svg', drawingMode: 'CIRCLE' },
  { name: 'marker', icon: '/svgs/point-icon.svg', drawingMode: 'MARKER' },
  { name: 'polygon', icon: '/svgs/polygon-icon.svg', drawingMode: 'POLYGON' },
  {
    name: 'polyline',
    icon: '/svgs/waypoint-icon.svg',
    drawingMode: 'POLYLINE',
  },
];

type ToolName = 'circle' | 'polygon' | 'polyline' | 'marker';

interface DrawingToolsProps {
  tool?: ToolName | null;
  onToolSelect: (tool: string | null) => void;
}

export default function DrawingTools({
  tool = null,
  onToolSelect,
}: DrawingToolsProps) {
  // Keep local selection for the "pre-draw" state (when `tool` is null).
  // Once a shape exists, always reflect the real drawn shape type via `tool`.
  const [draftTool, setDraftTool] = useState<ToolName>('circle');
  const selectedTool = tool ?? draftTool;

  const handleToolSelect = (
    toolName: ToolName,
    drawingMode: string,
  ) => {
    setDraftTool(toolName);
    onToolSelect(drawingMode);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {tools.map((tool) => (
        <ToolButton
          key={tool.name}
          tool={tool}
          isSelected={selectedTool === tool.name}
          onClick={() =>
            handleToolSelect(
              tool.name as ToolName,
              tool.drawingMode,
            )
          }
        />
      ))}
    </div>
  );
}

interface ToolButtonProps {
  tool: (typeof tools)[0];
  isSelected: boolean;
  onClick: () => void;
}

function ToolButton({ tool, isSelected, onClick }: ToolButtonProps) {
  const t = useTranslations('zones.drawingTools');
  return (
    <div
      className={cn(
        'p-4 rounded-md text-center cursor-pointer',
        isSelected ? 'bg-primary text-white' : 'bg-gray-100',
      )}
      onClick={onClick}
    >
      <Image
        src={tool.icon}
        alt={t(tool.name as ToolName)}
        width={32}
        height={32}
        className={cn('mx-auto', isSelected && 'filter invert')}
      />
      <p className="mt-2 text-sm capitalize">{t(tool.name as ToolName)}</p>
    </div>
  );
}
