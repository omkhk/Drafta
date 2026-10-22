import React from 'react';
import { FolderOpen, HelpCircle, Square, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onOpenJSON: () => void;
  onSelectBoxTool: () => void;
  onSelectArrowTool: () => void;
  onOpenHelp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onOpenJSON,
  onSelectBoxTool,
  onSelectArrowTool,
  onOpenHelp,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center select-none z-10 px-4">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-4 animate-in fade-in duration-300">
        {/* Drafta Vector Sketchy Logo */}
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
            <rect x="10" y="10" width="80" height="80" rx="22" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <path
              d="M32,28 L50,28 C68,28 68,72 50,72 L32,72 Z"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="72" cy="28" r="5" fill="#f59e0b" />
          </svg>
          <span className="text-3xl font-extrabold tracking-wider font-handwriting">
            DRAFTA
          </span>
        </div>

        {/* Hand-drawn Advice Note */}
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-handwriting max-w-sm">
          Your diagrams are stored securely in your browser.
          <br />
          Export to a <span className="font-mono text-xs px-1 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded">.drafta</span> file anytime to save backups.
        </p>

        {/* Quick Action Buttons */}
        <div className="pointer-events-auto flex flex-col gap-2 w-56 mt-2">
          <button
            onClick={onOpenJSON}
            className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm hover:shadow transition-all text-xs font-medium"
          >
            <div className="flex items-center gap-2">
              <FolderOpen size={16} className="text-gray-500" />
              <span>Open diagram</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Ctrl+O</span>
          </button>

          <button
            onClick={onSelectBoxTool}
            className="flex items-center justify-between px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 rounded-xl shadow-sm hover:shadow transition-all text-xs font-medium"
          >
            <div className="flex items-center gap-2">
              <Square size={16} />
              <span>Create a box</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono">2</span>
          </button>

          <button
            onClick={onSelectArrowTool}
            className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm hover:shadow transition-all text-xs font-medium"
          >
            <div className="flex items-center gap-2">
              <ArrowRight size={16} className="text-gray-500" />
              <span>Draw an arrow</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">3</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="flex items-center justify-between px-4 py-2 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800/60 text-gray-500 dark:text-gray-400 rounded-xl transition-colors text-xs"
          >
            <div className="flex items-center gap-2">
              <HelpCircle size={15} />
              <span>Shortcuts</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">?</span>
          </button>
        </div>
      </div>
    </div>
  );
};
