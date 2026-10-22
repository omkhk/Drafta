import React from 'react';
import { StrokeStyle, FillStyle } from '../types';
import {
  ChevronsDown,
  ChevronDown,
  ChevronUp,
  ChevronsUp,
} from 'lucide-react';

interface PropertiesPanelProps {
  strokeColor: string;
  onChangeStrokeColor: (color: string) => void;
  backgroundColor: string;
  onChangeBackgroundColor: (color: string) => void;
  strokeWidth: number;
  onChangeStrokeWidth: (width: number) => void;
  strokeStyle: StrokeStyle;
  onChangeStrokeStyle: (style: StrokeStyle) => void;
  fillStyle: FillStyle;
  onChangeFillStyle: (style: FillStyle) => void;
  roughness: number;
  onChangeRoughness: (roughness: number) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  isBoxSelected: boolean;
  hasSelection: boolean;
  onBringToFront?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onSendToBack?: () => void;
}

const STROKE_COLORS = [
  '#1e1e1e', // Charcoal / Black
  '#e03131', // Red
  '#2f9e44', // Green
  '#1971c2', // Blue
  '#f08c00', // Orange
  '#495057', // Slate Dark
];

const BG_COLORS = [
  '#ffec99', // Pastel Yellow
  '#ffc9c9', // Pastel Red / Pink
  '#b2f2bb', // Pastel Green
  '#a5d8ff', // Pastel Blue
  '#ffd8a8', // Pastel Peach / Orange
  '#fab005', // Gold
  'transparent',
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  strokeColor,
  onChangeStrokeColor,
  backgroundColor,
  onChangeBackgroundColor,
  strokeWidth,
  onChangeStrokeWidth,
  strokeStyle,
  onChangeStrokeStyle,
  fillStyle,
  onChangeFillStyle,
  roughness,
  onChangeRoughness,
  opacity,
  onChangeOpacity,
  isBoxSelected,
  hasSelection,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
}) => {
  return (
    <div className="absolute top-16 left-3.5 z-20 w-56 max-h-[calc(100vh-80px)] overflow-y-auto bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-gray-200/80 dark:border-zinc-700 shadow-xl rounded-2xl p-3 flex flex-col gap-3 text-xs text-gray-700 dark:text-gray-200 select-none animate-in fade-in slide-in-from-left-3 duration-200">
      
      {/* 1. Stroke / Text Color */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
          {isBoxSelected ? 'Stroke / Text color' : 'Color'}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STROKE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onChangeStrokeColor(c)}
              className={`w-6 h-6 rounded-lg border transition-transform ${
                strokeColor.toLowerCase() === c.toLowerCase()
                  ? 'ring-2 ring-indigo-500 scale-110 border-transparent shadow-sm'
                  : 'border-gray-200 dark:border-zinc-700 hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <label className="w-6 h-6 rounded-lg border border-gray-200 dark:border-zinc-700 cursor-pointer overflow-hidden flex items-center justify-center hover:scale-105 transition-transform" title="Custom color">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => onChangeStrokeColor(e.target.value)}
              className="opacity-0 w-0 h-0"
            />
            <span className="text-[10px] text-gray-400">🎨</span>
          </label>
        </div>
      </div>

      {/* 2. Background Color */}
      {isBoxSelected && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Background</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {BG_COLORS.map((c) => {
              const isSelected = backgroundColor.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  onClick={() => onChangeBackgroundColor(c)}
                  className={`w-6 h-6 rounded-lg border transition-transform relative flex items-center justify-center ${
                    isSelected
                      ? 'ring-2 ring-indigo-500 scale-110 border-transparent shadow-sm'
                      : 'border-gray-200 dark:border-zinc-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c === 'transparent' ? '#ffffff' : c }}
                  title={c === 'transparent' ? 'Transparent' : c}
                >
                  {c === 'transparent' && (
                    <div className="w-4 h-0.5 bg-red-400 rotate-45 rounded-full" />
                  )}
                </button>
              );
            })}
            <label className="w-6 h-6 rounded-lg border border-gray-200 dark:border-zinc-700 cursor-pointer overflow-hidden flex items-center justify-center hover:scale-105 transition-transform" title="Custom color">
              <input
                type="color"
                value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                onChange={(e) => onChangeBackgroundColor(e.target.value)}
                className="opacity-0 w-0 h-0"
              />
              <span className="text-[10px] text-gray-400">🎨</span>
            </label>
          </div>
        </div>
      )}

      {/* 3. Fill Style (Hachure, Solid, None) */}
      {isBoxSelected && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Fill</span>
          <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-zinc-900/60 p-1 rounded-xl">
            {(['transparent', 'hachure', 'solid'] as FillStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => onChangeFillStyle(style)}
                className={`py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                  fillStyle === style
                    ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {style === 'transparent' ? 'None' : style}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Stroke Width */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Stroke width</span>
        <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-zinc-900/60 p-1 rounded-xl">
          {[
            { label: 'Thin', val: 1 },
            { label: 'Medium', val: 2 },
            { label: 'Bold', val: 4 },
          ].map(({ label, val }) => (
            <button
              key={val}
              onClick={() => onChangeStrokeWidth(val)}
              className={`py-1 rounded-lg text-[11px] font-medium transition-all ${
                strokeWidth === val
                  ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Stroke Style */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Stroke style</span>
        <div className="grid grid-cols-2 gap-1 bg-gray-100 dark:bg-zinc-900/60 p-1 rounded-xl">
          {(['solid', 'dashed'] as StrokeStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => onChangeStrokeStyle(style)}
              className={`py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                strokeStyle === style
                  ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Sloppiness (Architect, Artist, Cartoon with SVG wave icons) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Sloppiness</span>
        <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-zinc-900/60 p-1 rounded-xl">
          {[
            {
              val: 0,
              title: 'Architect (Clean)',
              icon: (
                <svg className="w-5 h-4" viewBox="0 0 24 20" fill="none">
                  <path d="M3 10 L21 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              val: 1,
              title: 'Artist (Hand-drawn)',
              icon: (
                <svg className="w-5 h-4" viewBox="0 0 24 20" fill="none">
                  <path d="M3 12 Q12 6 21 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              val: 2,
              title: 'Cartoon (Wavy)',
              icon: (
                <svg className="w-5 h-4" viewBox="0 0 24 20" fill="none">
                  <path d="M3 11 C8 5 11 16 16 8 C18 6 19 12 21 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ),
            },
          ].map(({ val, title, icon }) => (
            <button
              key={val}
              onClick={() => onChangeRoughness(val)}
              title={title}
              className={`py-1.5 flex items-center justify-center rounded-lg transition-all ${
                roughness === val
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* 7. Opacity Slider */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-600 dark:text-gray-400">
          <span>Opacity</span>
          <span className="font-mono text-gray-400">{opacity}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={opacity}
          onChange={(e) => onChangeOpacity(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-[9px] text-gray-400 font-mono px-0.5">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      {/* 8. Layers (Send backward, Send to back, Bring forward, Bring to front) */}
      {hasSelection && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-gray-100 dark:border-zinc-700/60">
          <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Layers</span>
          <div className="grid grid-cols-4 gap-1 bg-gray-100 dark:bg-zinc-900/60 p-1 rounded-xl">
            <button
              onClick={onSendToBack}
              title="Send to back"
              className="py-1 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition-colors shadow-none hover:shadow-sm"
            >
              <ChevronsDown size={15} />
            </button>
            <button
              onClick={onSendBackward}
              title="Send backward"
              className="py-1 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition-colors shadow-none hover:shadow-sm"
            >
              <ChevronDown size={15} />
            </button>
            <button
              onClick={onBringForward}
              title="Bring forward"
              className="py-1 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition-colors shadow-none hover:shadow-sm"
            >
              <ChevronUp size={15} />
            </button>
            <button
              onClick={onBringToFront}
              title="Bring to front"
              className="py-1 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition-colors shadow-none hover:shadow-sm"
            >
              <ChevronsUp size={15} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
