export type Tool = 'select' | 'box' | 'arrow' | 'text' | 'hand' | 'eraser';

export type FillStyle = 'hachure' | 'solid' | 'transparent';
export type StrokeStyle = 'solid' | 'dashed';
export type ThemeMode = 'light' | 'dark' | 'system';

export type Point = [number, number];

export interface PointBinding {
  boxId: string;
  gap: number;
}

export interface BaseElement {
  id: string;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roughness: number;
  seed: number;
  opacity?: number;
}

export interface BoxElement extends BaseElement {
  type: 'box';
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  fillStyle: FillStyle;
  text: string;
  fontSize: number;
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  startPoint: Point;
  endPoint: Point;
  startBinding: PointBinding | null;
  endBinding: PointBinding | null;
}

export type DiagramElement = BoxElement | ArrowElement;

export interface AppState {
  selectedId: string | null;
  editingTextId: string | null;
  activeTool: Tool;
  isToolLocked: boolean;
  isMenuOpen: boolean;
  theme: ThemeMode;
  canvasBackground: string;
  camera: {
    x: number;
    y: number;
    zoom: number;
  };
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  fillStyle: FillStyle;
  roughness: number;
  opacity: number;
}

export interface DraftaExportData {
  type: 'drafta' | 'excalidraw-clone';
  version: 1;
  elements: DiagramElement[];
  appState: {
    camera: { x: number; y: number; zoom: number };
    backgroundColor: string;
    theme?: ThemeMode;
  };
}

// Backward compatibility alias for legacy imports
export type ExcalidrawExportData = DraftaExportData;
