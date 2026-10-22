import React from 'react';
import {
  Lock,
  Unlock,
  Hand,
  MousePointer2,
  Square,
  ArrowRight,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
} from 'lucide-react';
import { Tool } from '../types';

interface ToolbarProps {
  activeTool: Tool;
  onSelectTool: (tool: Tool) => void;
  isLocked: boolean;
  onToggleLock: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  isLocked,
  onToggleLock,
  onDeleteSelected,
  hasSelection,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const tools: { id: Tool; label: string; icon: React.ReactNode; letter: string }[] = [
    { id: 'hand', label: 'Hand (Pan)', icon: <Hand size={17} />, letter: 'H' },
    { id: 'select', label: 'Selection', icon: <MousePointer2 size={17} />, letter: 'V' },
    { id: 'box', label: 'Rectangle / Box', icon: <Square size={17} />, letter: 'R' },
    { id: 'arrow', label: 'Arrow Connector', icon: <ArrowRight size={17} />, letter: 'A' },
    { id: 'text', label: 'Text', icon: <Type size={17} />, letter: 'T' },
    { id: 'eraser', label: 'Eraser', icon: <Eraser size={17} />, letter: 'E' },
  ];

  return (
    <div className="absolute top-3.5 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 select-none pointer-events-none">
      {/* Top Floating Pill Toolbar */}
      <div className="pointer-events-auto flex items-center gap-1 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm border border-gray-200/90 dark:border-zinc-700 shadow-md rounded-2xl px-2 py-1.5 text-gray-700 dark:text-gray-200">
        {/* Tool Lock Button */}
        <button
          onClick={onToggleLock}
          title={isLocked ? 'Keep selected tool active (Locked)' : 'Auto-switch to selection after drawing'}
          className={`p-2 rounded-xl transition-colors ${
            isLocked
              ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
              : 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>

        <div className="h-5 w-px bg-gray-200 dark:bg-zinc-700 mx-0.5" />

        {/* Tools list */}
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              title={`${t.label} (${t.letter})`}
              className={`relative px-2.5 py-1.5 rounded-xl flex items-center justify-center transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                  : 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {t.icon}
              <span className="absolute bottom-0 right-1 text-[8px] font-mono text-gray-400 dark:text-zinc-500 font-normal">
                {t.letter}
              </span>
            </button>
          );
        })}

        <div className="h-5 w-px bg-gray-200 dark:bg-zinc-700 mx-0.5" />

        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-2 rounded-xl transition-colors ${
            canUndo
              ? 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300'
              : 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={`p-2 rounded-xl transition-colors ${
            canRedo
              ? 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300'
              : 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Redo2 size={16} />
        </button>

        {/* Delete selection if any */}
        {hasSelection && (
          <>
            <div className="h-5 w-px bg-gray-200 dark:bg-zinc-700 mx-0.5" />
            <button
              onClick={onDeleteSelected}
              title="Delete Selected (Del)"
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>

      {/* Contextual Helpful Hint banner below toolbar matching Excalidraw */}
      <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-sans tracking-wide">
        {activeTool === 'box' && 'Click to place a rectangle, or drag to size it'}
        {activeTool === 'arrow' && 'Click inside a box and drag to connect another box'}
        {activeTool === 'text' && 'Click to write text, or double-click any box'}
        {activeTool === 'hand' && 'Drag to move the canvas around'}
        {activeTool === 'eraser' && 'Click on any element to erase it'}
        {activeTool === 'select' && (
          <>
            Hold <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded border border-gray-200 dark:border-zinc-700 text-[10px]">Space</kbd> while dragging to pan canvas
          </>
        )}
      </span>
    </div>
  );
};
