import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DiagramElement, BoxElement, AppState, Tool, StrokeStyle, FillStyle, ThemeMode } from './types';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { MainMenu } from './components/MainMenu';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PropertiesPanel } from './components/PropertiesPanel';
import { TextOverlay } from './components/TextOverlay';
import { Undo2, Redo2 } from 'lucide-react';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  downloadJSON,
  readJSONFile,
  exportToPNG,
} from './storage/saveLoad';

// Initial demo elements if localStorage is empty
const INITIAL_DEMO_ELEMENTS: DiagramElement[] = [
  {
    id: 'box_start',
    type: 'box',
    x: 180,
    y: 180,
    width: 200,
    height: 100,
    strokeColor: '#1e1e1e',
    backgroundColor: '#ffc9c9',
    strokeWidth: 2,
    strokeStyle: 'solid',
    fillStyle: 'hachure',
    roughness: 1,
    opacity: 100,
    seed: 12345,
    text: 'Double click me\nto edit text!',
    fontSize: 22,
  },
  {
    id: 'box_end',
    type: 'box',
    x: 520,
    y: 180,
    width: 200,
    height: 100,
    strokeColor: '#1971c2',
    backgroundColor: '#a5d8ff',
    strokeWidth: 2,
    strokeStyle: 'solid',
    fillStyle: 'hachure',
    roughness: 1,
    opacity: 100,
    seed: 67890,
    text: 'Drag me around!\nArrow tracks me',
    fontSize: 22,
  },
  {
    id: 'arrow_demo',
    type: 'arrow',
    strokeColor: '#1e1e1e',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    seed: 45678,
    startPoint: [380, 230],
    endPoint: [520, 230],
    startBinding: { boxId: 'box_start', gap: 4 },
    endBinding: { boxId: 'box_end', gap: 6 },
  },
];

export function App() {
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  // Elements state + Undo/Redo history
  const [history, setHistory] = useState<DiagramElement[][]>(() => {
    const saved = loadFromLocalStorage();
    return [saved ? saved.elements : INITIAL_DEMO_ELEMENTS];
  });
  const [historyIndex, setHistoryIndex] = useState(0);

  const elements = history[historyIndex] || [];

  // Application UI State
  const [appState, setAppState] = useState<AppState>(() => {
    const saved = loadFromLocalStorage();
    return {
      selectedId: null,
      editingTextId: null,
      activeTool: 'select',
      isToolLocked: false,
      isMenuOpen: false,
      theme: saved?.theme || 'light',
      canvasBackground: saved?.canvasBackground || '#ffffff',
      camera: saved?.camera || { x: 0, y: 0, zoom: 1 },
      strokeColor: '#1e1e1e',
      backgroundColor: '#ffec99',
      strokeWidth: 2,
      strokeStyle: 'solid',
      fillStyle: 'hachure',
      roughness: 1,
      opacity: 100,
    };
  });

  // Apply Theme (light / dark / system) to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (appState.theme === 'dark') {
      root.classList.add('dark');
    } else if (appState.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [appState.theme]);

  // Selected element helper
  const selectedElement = useMemo(
    () => elements.find((el) => el.id === appState.selectedId) || null,
    [elements, appState.selectedId]
  );

  const isBoxSelected = selectedElement ? selectedElement.type === 'box' : true;

  // Sync selected element's styles to properties panel
  useEffect(() => {
    if (selectedElement) {
      setAppState((prev) => ({
        ...prev,
        strokeColor: selectedElement.strokeColor,
        strokeWidth: selectedElement.strokeWidth,
        strokeStyle: selectedElement.strokeStyle,
        roughness: selectedElement.roughness,
        opacity: selectedElement.opacity ?? 100,
        ...(selectedElement.type === 'box'
          ? {
              backgroundColor: selectedElement.backgroundColor,
              fillStyle: selectedElement.fillStyle,
            }
          : {}),
      }));
    }
  }, [selectedElement]);

  // Update elements and push to undo history
  const updateElementsWithHistory = useCallback(
    (newElements: DiagramElement[]) => {
      const updatedHistory = history.slice(0, historyIndex + 1);
      updatedHistory.push(newElements);
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
      saveToLocalStorage(newElements, appState.camera, appState.theme, appState.canvasBackground);
    },
    [history, historyIndex, appState.camera, appState.theme, appState.canvasBackground]
  );

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
    }
  }, [historyIndex, history.length]);

  // Delete Selected Element
  const handleDeleteSelected = useCallback(() => {
    if (!appState.selectedId) return;
    const deletedId = appState.selectedId;

    const newElements = elements
      .filter((el) => el.id !== deletedId)
      .map((el) => {
        if (el.type === 'arrow') {
          return {
            ...el,
            startBinding: el.startBinding?.boxId === deletedId ? null : el.startBinding,
            endBinding: el.endBinding?.boxId === deletedId ? null : el.endBinding,
          };
        }
        return el;
      });

    updateElementsWithHistory(newElements);
    setAppState((prev) => ({ ...prev, selectedId: null }));
  }, [appState.selectedId, elements, updateElementsWithHistory]);

  // Save / Load actions
  const handleSaveJSON = useCallback(() => {
    downloadJSON(elements, appState.camera, appState.theme, appState.canvasBackground);
  }, [elements, appState.camera, appState.theme, appState.canvasBackground]);

  const handleLoadJSON = useCallback(
    async (file: File) => {
      try {
        const data = await readJSONFile(file);
        updateElementsWithHistory(data.elements);
        if (data.appState?.camera) {
          setAppState((prev) => ({
            ...prev,
            camera: data.appState.camera,
            canvasBackground: data.appState.backgroundColor || prev.canvasBackground,
            theme: data.appState.theme || prev.theme,
          }));
        }
      } catch (err) {
        alert('Failed to load JSON diagram: ' + (err as Error).message);
      }
    },
    [updateElementsWithHistory]
  );

  const handleExportPNG = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      exportToPNG(canvas);
    }
  }, []);

  const handleResetCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      updateElementsWithHistory([]);
      setAppState((prev) => ({ ...prev, selectedId: null, editingTextId: null }));
    }
  }, [updateElementsWithHistory]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        hiddenFileInputRef.current?.click();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExportPNG();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Escape') {
        setAppState((prev) => ({
          ...prev,
          selectedId: null,
          editingTextId: null,
          isMenuOpen: false,
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteSelected, handleUndo, handleRedo, handleExportPNG]);

  // Layer ordering helpers
  const handleBringToFront = useCallback(() => {
    if (!appState.selectedId) return;
    const index = elements.findIndex((el) => el.id === appState.selectedId);
    if (index === -1 || index === elements.length - 1) return;
    const newElements = [...elements];
    const [item] = newElements.splice(index, 1);
    newElements.push(item);
    updateElementsWithHistory(newElements);
  }, [appState.selectedId, elements, updateElementsWithHistory]);

  const handleBringForward = useCallback(() => {
    if (!appState.selectedId) return;
    const index = elements.findIndex((el) => el.id === appState.selectedId);
    if (index === -1 || index === elements.length - 1) return;
    const newElements = [...elements];
    const [item] = newElements.splice(index, 1);
    newElements.splice(index + 1, 0, item);
    updateElementsWithHistory(newElements);
  }, [appState.selectedId, elements, updateElementsWithHistory]);

  const handleSendBackward = useCallback(() => {
    if (!appState.selectedId) return;
    const index = elements.findIndex((el) => el.id === appState.selectedId);
    if (index <= 0) return;
    const newElements = [...elements];
    const [item] = newElements.splice(index, 1);
    newElements.splice(index - 1, 0, item);
    updateElementsWithHistory(newElements);
  }, [appState.selectedId, elements, updateElementsWithHistory]);

  const handleSendToBack = useCallback(() => {
    if (!appState.selectedId) return;
    const index = elements.findIndex((el) => el.id === appState.selectedId);
    if (index <= 0) return;
    const newElements = [...elements];
    const [item] = newElements.splice(index, 1);
    newElements.unshift(item);
    updateElementsWithHistory(newElements);
  }, [appState.selectedId, elements, updateElementsWithHistory]);

  // Property Change Handlers
  const handleChangeStrokeColor = (color: string) => {
    setAppState((prev) => ({ ...prev, strokeColor: color }));
    if (appState.selectedId) {
      updateElementsWithHistory(
        elements.map((el) => (el.id === appState.selectedId ? { ...el, strokeColor: color } : el))
      );
    }
  };

  const handleChangeBackgroundColor = (color: string) => {
    setAppState((prev) => ({ ...prev, backgroundColor: color }));
    if (appState.selectedId) {
      updateElementsWithHistory(
        elements.map((el) =>
          el.id === appState.selectedId && el.type === 'box'
            ? { ...el, backgroundColor: color }
            : el
        )
      );
    }
  };

  const handleChangeStrokeWidth = (width: number) => {
    setAppState((prev) => ({ ...prev, strokeWidth: width }));
    if (appState.selectedId) {
      updateElementsWithHistory(
        elements.map((el) => (el.id === appState.selectedId ? { ...el, strokeWidth: width } : el))
      );
    }
  };

  const handleChangeStrokeStyle = (style: StrokeStyle) => {
    setAppState((prev) => ({ ...prev, strokeStyle: style }));
    if (appState.selectedId) {
      updateElementsWithHistory(
        elements.map((el) => (el.id === appState.selectedId ? { ...el, strokeStyle: style } : el))
      );
    }
  };

  const handleChangeFillStyle = (style: FillStyle) => {
    setAppState((prev) => ({ ...prev, fillStyle: style }));
    if (appState.selectedId) {
      updateElementsWithHistory(
        elements.map((el) =>
          el.id === appState.selectedId && el.type === 'box' ? { ...el, fillStyle: style } : el
        )
      );
    }
  };

  const handleChangeRoughness = (roughness: number) => {
    setAppState((prev) => ({ ...prev, roughness }));
    if (appState.selectedId) {
      updateElementsWithHistory(
        elements.map((el) => (el.id === appState.selectedId ? { ...el, roughness } : el))
      );
    }
  };

  const handleChangeOpacity = (opacity: number) => {
    setAppState((prev) => ({ ...prev, opacity }));
    if (appState.selectedId) {
      updateElementsWithHistory(
        elements.map((el) => (el.id === appState.selectedId ? { ...el, opacity } : el))
      );
    }
  };

  // Zoom Helpers
  const handleZoomIn = () => {
    setAppState((prev) => ({
      ...prev,
      camera: { ...prev.camera, zoom: Math.min(3.0, prev.camera.zoom + 0.1) },
    }));
  };

  const handleZoomOut = () => {
    setAppState((prev) => ({
      ...prev,
      camera: { ...prev.camera, zoom: Math.max(0.2, prev.camera.zoom - 0.1) },
    }));
  };

  const handleZoomReset = () => {
    setAppState((prev) => ({
      ...prev,
      camera: { ...prev.camera, zoom: 1.0 },
    }));
  };

  // Text Editing
  const editingBox = useMemo(
    () =>
      appState.editingTextId
        ? (elements.find((el) => el.id === appState.editingTextId && el.type === 'box') as BoxElement)
        : null,
    [elements, appState.editingTextId]
  );

  const handleUpdateText = (id: string, text: string) => {
    const updated = elements.map((el) => (el.id === id && el.type === 'box' ? { ...el, text } : el));
    const updatedHistory = [...history];
    updatedHistory[historyIndex] = updated;
    setHistory(updatedHistory);
  };

  const handleFinishTextEditing = () => {
    setAppState((prev) => ({ ...prev, editingTextId: null }));
    saveToLocalStorage(elements, appState.camera, appState.theme, appState.canvasBackground);
  };

  // Contextual Visibility: Only show PropertiesPanel when an element is selected OR a creation tool is active
  const isPropertiesPanelVisible =
    appState.selectedId !== null || ['box', 'arrow', 'text'].includes(appState.activeTool);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white dark:bg-zinc-950 select-none">
      {/* Hidden File Input for Global Ctrl+O shortcut */}
      <input
        type="file"
        ref={hiddenFileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleLoadJSON(file);
            e.target.value = '';
          }
        }}
        accept=".drafta,.json,.excalidraw"
        className="hidden"
      />

      {/* Slide-out Main Menu Drawer & Top-left Hamburger Button */}
      <MainMenu
        isOpen={appState.isMenuOpen}
        onToggle={() => setAppState((prev) => ({ ...prev, isMenuOpen: !prev.isMenuOpen }))}
        onOpenJSON={handleLoadJSON}
        onSaveJSON={handleSaveJSON}
        onExportPNG={handleExportPNG}
        onResetCanvas={handleResetCanvas}
        theme={appState.theme}
        onChangeTheme={(theme: ThemeMode) => setAppState((prev) => ({ ...prev, theme }))}
        canvasBackground={appState.canvasBackground}
        onChangeCanvasBackground={(color: string) =>
          setAppState((prev) => ({ ...prev, canvasBackground: color }))
        }
      />

      {/* Top Floating Pill Toolbar */}
      <Toolbar
        activeTool={appState.activeTool}
        onSelectTool={(tool: Tool) => setAppState((prev) => ({ ...prev, activeTool: tool }))}
        isLocked={appState.isToolLocked}
        onToggleLock={() => setAppState((prev) => ({ ...prev, isToolLocked: !prev.isToolLocked }))}
        onDeleteSelected={handleDeleteSelected}
        hasSelection={!!appState.selectedId}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Contextual Left Properties Panel (Matches Excalidraw screenshot) */}
      {isPropertiesPanelVisible && (
        <PropertiesPanel
          strokeColor={appState.strokeColor}
          onChangeStrokeColor={handleChangeStrokeColor}
          backgroundColor={appState.backgroundColor}
          onChangeBackgroundColor={handleChangeBackgroundColor}
          strokeWidth={appState.strokeWidth}
          onChangeStrokeWidth={handleChangeStrokeWidth}
          strokeStyle={appState.strokeStyle}
          onChangeStrokeStyle={handleChangeStrokeStyle}
          fillStyle={appState.fillStyle}
          onChangeFillStyle={handleChangeFillStyle}
          roughness={appState.roughness}
          onChangeRoughness={handleChangeRoughness}
          opacity={appState.opacity}
          onChangeOpacity={handleChangeOpacity}
          isBoxSelected={isBoxSelected}
          hasSelection={!!appState.selectedId}
          onBringToFront={handleBringToFront}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
          onSendToBack={handleSendToBack}
        />
      )}

      {/* Main Interactive Rough.js Canvas */}
      <Canvas
        elements={elements}
        onElementsChange={updateElementsWithHistory}
        appState={appState}
        onAppStateChange={(partial) => setAppState((prev) => ({ ...prev, ...partial }))}
        onDoubleClickBox={(box) => setAppState((prev) => ({ ...prev, editingTextId: box.id }))}
      />

      {/* Welcome Screen Banner when canvas is empty */}
      {elements.length === 0 && (
        <WelcomeScreen
          onOpenJSON={() => hiddenFileInputRef.current?.click()}
          onSelectBoxTool={() => setAppState((prev) => ({ ...prev, activeTool: 'box' }))}
          onSelectArrowTool={() => setAppState((prev) => ({ ...prev, activeTool: 'arrow' }))}
          onOpenHelp={() => setAppState((prev) => ({ ...prev, isMenuOpen: true }))}
        />
      )}

      {/* Inline Text Editor Overlay */}
      {editingBox && (
        <TextOverlay
          box={editingBox}
          camera={appState.camera}
          onUpdateText={handleUpdateText}
          onFinishEditing={handleFinishTextEditing}
        />
      )}

      {/* Bottom Floating Control Bar (matching Excalidraw screenshot) */}
      <div className="absolute bottom-3.5 left-4 z-20 flex items-center gap-2 select-none pointer-events-none">
        {/* Zoom Controls Pill: [-] 100% [+] */}
        <div className="pointer-events-auto flex items-center bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm border border-gray-200/90 dark:border-zinc-700 shadow-md rounded-xl text-gray-700 dark:text-gray-200 text-xs font-medium overflow-hidden">
          <button
            onClick={handleZoomOut}
            title="Zoom out"
            className="px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            -
          </button>
          <button
            onClick={handleZoomReset}
            title="Click to reset zoom to 100%"
            className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700 font-mono text-[11px] transition-colors border-x border-gray-100 dark:border-zinc-700"
          >
            {Math.round(appState.camera.zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            title="Zoom in"
            className="px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            +
          </button>
        </div>

        {/* Undo / Redo Pill */}
        <div className="pointer-events-auto flex items-center bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm border border-gray-200/90 dark:border-zinc-700 shadow-md rounded-xl text-gray-700 dark:text-gray-200 p-0.5">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-lg transition-colors ${
              historyIndex > 0
                ? 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200'
                : 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded-lg transition-colors ${
              historyIndex < history.length - 1
                ? 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200'
                : 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Redo2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
