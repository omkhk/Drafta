import React, { useRef, useState } from 'react';
import {
  Menu,
  X,
  FolderOpen,
  Save,
  ImageDown,
  Users,
  Command,
  Search,
  HelpCircle,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  ChevronRight,
  ChevronDown,
  UserPlus
} from 'lucide-react';
import { ThemeMode } from '../types';

interface MainMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenJSON: (file: File) => void;
  onSaveJSON: () => void;
  onExportPNG: () => void;
  onResetCanvas: () => void;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  canvasBackground: string;
  onChangeCanvasBackground: (color: string) => void;
}

const CANVAS_BG_SWATCHES = [
  '#ffffff', // Clean White
  '#fbf7ee', // Warm Cream
  '#f8f9fa', // Soft Gray
  '#fff5f5', // Soft Pink
  '#f0f8ff', // Soft Blue
  '#121212', // Dark Slate
];

export const MainMenu: React.FC<MainMenuProps> = ({
  isOpen,
  onToggle,
  onOpenJSON,
  onSaveJSON,
  onExportPNG,
  onResetCanvas,
  theme,
  onChangeTheme,
  canvasBackground,
  onChangeCanvasBackground,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenJSON(file);
      e.target.value = '';
      onToggle();
    }
  };

  return (
    <>
      {/* Top Left Hamburger Button */}
      <button
        onClick={onToggle}
        title="Main menu"
        className="absolute top-3.5 left-3.5 z-40 p-2.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 shadow-md border border-gray-200/80 dark:border-zinc-700 transition-all duration-150 backdrop-blur-sm"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 backdrop-blur-[1px] animate-in fade-in duration-150"
        />
      )}

      {/* Slide-out Menu Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-zinc-900 border-r border-gray-200/90 dark:border-zinc-800 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-out text-gray-700 dark:text-gray-200 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with Close Button */}
        <div className="p-3.5 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              ✏️
            </div>
            <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">
              Drafta
            </span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-2 flex-1 flex flex-col gap-0.5 text-xs">
          {/* Open */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FolderOpen size={16} className="text-gray-500" />
              <span>Open</span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">Ctrl+O</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".drafta,.json,.excalidraw"
            className="hidden"
          />

          {/* Save to */}
          <button
            onClick={() => {
              onSaveJSON();
              onToggle();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Save size={16} className="text-gray-500" />
              <span>Save to...</span>
            </div>
          </button>

          {/* Export image */}
          <button
            onClick={() => {
              onExportPNG();
              onToggle();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ImageDown size={16} className="text-gray-500" />
              <span>Export image...</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Ctrl+Shift+E</span>
          </button>

          {/* Live collaboration */}
          <button
            onClick={() => alert('Live collaboration is connected to your local instance!')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Users size={16} className="text-gray-500" />
              <span>Live collaboration...</span>
            </div>
          </button>

          {/* Command palette */}
          <button
            onClick={() => alert('Press 1, 2, 3, 4, or E to quickly switch tools!')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 transition-colors text-indigo-600 dark:text-indigo-400 font-medium"
          >
            <div className="flex items-center gap-2.5">
              <Command size={16} />
              <span>Command palette</span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">Ctrl+/</span>
          </button>

          {/* Find on canvas */}
          <button
            onClick={() => alert('Double click any box to search or edit text!')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Search size={16} className="text-gray-500" />
              <span>Find on canvas</span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">Ctrl+F</span>
          </button>

          {/* Help */}
          <button
            onClick={() => setShowHelp(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle size={16} className="text-gray-500" />
              <span>Help</span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">?</span>
          </button>

          {/* Reset canvas */}
          <button
            onClick={() => {
              onResetCanvas();
              onToggle();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 size={16} />
              <span>Reset the canvas</span>
            </div>
          </button>

          <div className="h-px bg-gray-200/80 dark:bg-zinc-800 my-2" />

          <button
            onClick={() => alert('Drafta Pro features: Infinite boards, encrypted cloud sync, and AI generation coming soon!')}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition-colors text-left"
          >
            <Sparkles size={16} className="text-amber-500" />
            <span>Drafta Pro</span>
          </button>

          <a
            href="https://github.com/omkhk/Drafta"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4 fill-current text-gray-500" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>

          <div className="flex items-center gap-2.5 px-3 py-1.5 text-gray-400">
            <UserPlus size={16} />
            <span>Sign up</span>
          </div>

          <div className="h-px bg-gray-200/80 dark:bg-zinc-800 my-2" />

          {/* Preferences */}
          <button
            onClick={() => setPreferencesOpen(!preferencesOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 transition-colors"
          >
            <span className="font-medium">Preferences</span>
            {preferencesOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>

          {/* Preferences Drawer */}
          {preferencesOpen && (
            <div className="pl-3 pr-1 py-1 flex flex-col gap-2 text-[11px] text-gray-500 animate-in fade-in duration-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                <span>Show grid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                <span>Auto-save to browser</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer: Theme, Language & Canvas Background */}
        <div className="p-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex flex-col gap-2.5 text-xs">
          {/* Theme Selector */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-600 dark:text-gray-400">Theme</span>
            <div className="flex items-center bg-gray-200/70 dark:bg-zinc-800 p-0.5 rounded-lg">
              <button
                onClick={() => onChangeTheme('light')}
                title="Light theme"
                className={`p-1.5 rounded-md transition-colors ${
                  theme === 'light'
                    ? 'bg-white dark:bg-zinc-700 text-amber-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Sun size={15} />
              </button>
              <button
                onClick={() => onChangeTheme('dark')}
                title="Dark theme"
                className={`p-1.5 rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Moon size={15} />
              </button>
              <button
                onClick={() => onChangeTheme('system')}
                title="System theme"
                className={`p-1.5 rounded-md transition-colors ${
                  theme === 'system'
                    ? 'bg-white dark:bg-zinc-700 text-blue-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Monitor size={15} />
              </button>
            </div>
          </div>

          {/* Canvas Background Swatches */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="font-medium text-gray-600 dark:text-gray-400 text-[11px]">
              Canvas background
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {CANVAS_BG_SWATCHES.map((color) => (
                <button
                  key={color}
                  onClick={() => onChangeCanvasBackground(color)}
                  className={`w-5 h-5 rounded-md border transition-transform ${
                    canvasBackground.toLowerCase() === color.toLowerCase()
                      ? 'ring-2 ring-indigo-500 scale-110 border-transparent'
                      : 'border-gray-300 dark:border-zinc-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-gray-800 dark:text-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Selection Tool</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono">1 or V</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Box Tool</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono">2 or R</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Connector Arrow</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono">3 or A</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hand / Pan</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono">4 or Space</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Eraser</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono">E</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delete Element</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono">Del</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Undo / Redo</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono">Ctrl+Z / Y</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Open File</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono">Ctrl+O</kbd>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
