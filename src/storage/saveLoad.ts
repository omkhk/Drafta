import { DiagramElement, BoxElement, ArrowElement, AppState, DraftaExportData } from '../types';

const PRIMARY_STORAGE_KEY = 'drafta_diagram_elements_v1';
const LEGACY_STORAGE_KEY = 'excalidraw_clone_elements_v1';
const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024; // 15MB max file limit

/**
 * Sanitizes a color string to prevent style injection.
 */
function sanitizeColor(val: unknown, fallback: string): string {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  // Safe hex, rgb, rgba, hsl, hsla, transparent, or basic color name
  if (/^(transparent|#(?:[0-9a-fA-F]{3,8})|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]{3,20})$/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

/**
 * Validates and sanitizes a single diagram element.
 * Defends against prototype pollution, invalid coordinates, and memory exhaustion.
 */
function sanitizeElement(el: unknown): DiagramElement | null {
  if (!el || typeof el !== 'object' || Array.isArray(el)) return null;

  const raw = el as Record<string, unknown>;

  // Basic fields
  if (typeof raw.id !== 'string' || !raw.id.trim()) return null;
  const id = raw.id.slice(0, 100);

  const strokeColor = sanitizeColor(raw.strokeColor, '#1e1e1e');
  const strokeWidth = Number.isFinite(raw.strokeWidth)
    ? Math.max(1, Math.min(20, Number(raw.strokeWidth)))
    : 2;
  const strokeStyle = raw.strokeStyle === 'dashed' ? 'dashed' : 'solid';
  const roughness = Number.isFinite(raw.roughness)
    ? Math.max(0, Math.min(5, Number(raw.roughness)))
    : 1;
  const seed = Number.isFinite(raw.seed)
    ? Math.floor(Number(raw.seed))
    : Math.floor(Math.random() * 2147483647);
  const opacity = Number.isFinite(raw.opacity)
    ? Math.max(0, Math.min(100, Number(raw.opacity)))
    : 100;

  if (raw.type === 'box') {
    const x = Number.isFinite(raw.x) ? Number(raw.x) : 0;
    const y = Number.isFinite(raw.y) ? Number(raw.y) : 0;
    const width = Number.isFinite(raw.width) ? Math.max(1, Number(raw.width)) : 100;
    const height = Number.isFinite(raw.height) ? Math.max(1, Number(raw.height)) : 100;
    const backgroundColor = sanitizeColor(raw.backgroundColor, '#ffffff');
    const fillStyle =
      raw.fillStyle === 'solid' || raw.fillStyle === 'transparent' ? raw.fillStyle : 'hachure';
    const text = typeof raw.text === 'string' ? raw.text.slice(0, 10000) : '';
    const fontSize = Number.isFinite(raw.fontSize)
      ? Math.max(10, Math.min(120, Number(raw.fontSize)))
      : 20;

    const box: BoxElement = {
      id,
      type: 'box',
      x,
      y,
      width,
      height,
      strokeColor,
      backgroundColor,
      strokeWidth,
      strokeStyle,
      fillStyle,
      roughness,
      seed,
      opacity,
      text,
      fontSize,
    };
    return box;
  }

  if (raw.type === 'arrow') {
    const startPoint =
      Array.isArray(raw.startPoint) &&
      raw.startPoint.length === 2 &&
      Number.isFinite(raw.startPoint[0]) &&
      Number.isFinite(raw.startPoint[1])
        ? ([Number(raw.startPoint[0]), Number(raw.startPoint[1])] as [number, number])
        : ([0, 0] as [number, number]);

    const endPoint =
      Array.isArray(raw.endPoint) &&
      raw.endPoint.length === 2 &&
      Number.isFinite(raw.endPoint[0]) &&
      Number.isFinite(raw.endPoint[1])
        ? ([Number(raw.endPoint[0]), Number(raw.endPoint[1])] as [number, number])
        : ([100, 100] as [number, number]);

    const startBinding =
      raw.startBinding && typeof raw.startBinding === 'object' && typeof (raw.startBinding as Record<string, unknown>).boxId === 'string'
        ? {
            boxId: String((raw.startBinding as Record<string, unknown>).boxId).slice(0, 100),
            gap: Number.isFinite((raw.startBinding as Record<string, unknown>).gap)
              ? Number((raw.startBinding as Record<string, unknown>).gap)
              : 4,
          }
        : null;

    const endBinding =
      raw.endBinding && typeof raw.endBinding === 'object' && typeof (raw.endBinding as Record<string, unknown>).boxId === 'string'
        ? {
            boxId: String((raw.endBinding as Record<string, unknown>).boxId).slice(0, 100),
            gap: Number.isFinite((raw.endBinding as Record<string, unknown>).gap)
              ? Number((raw.endBinding as Record<string, unknown>).gap)
              : 6,
          }
        : null;

    const arrow: ArrowElement = {
      id,
      type: 'arrow',
      strokeColor,
      strokeWidth,
      strokeStyle,
      roughness,
      seed,
      opacity,
      startPoint,
      endPoint,
      startBinding,
      endBinding,
    };
    return arrow;
  }

  return null;
}

/**
 * Safe JSON parser with prototype pollution protection.
 */
function safeJSONParse<T>(jsonString: string): T {
  return JSON.parse(jsonString, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  }) as T;
}

/**
 * Saves diagram elements to browser local storage safely.
 */
export function saveToLocalStorage(
  elements: DiagramElement[],
  camera: AppState['camera'],
  theme?: AppState['theme'],
  canvasBackground?: string
) {
  try {
    const data: DraftaExportData = {
      type: 'drafta',
      version: 1,
      elements,
      appState: {
        camera: {
          x: Number.isFinite(camera?.x) ? camera.x : 0,
          y: Number.isFinite(camera?.y) ? camera.y : 0,
          zoom: Number.isFinite(camera?.zoom) ? camera.zoom : 1,
        },
        backgroundColor: sanitizeColor(canvasBackground, '#ffffff'),
        theme: theme === 'dark' || theme === 'system' ? theme : 'light',
      },
    };
    localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.warn('Drafta: Browser local storage quota exceeded. Consider exporting to file.');
    } else {
      console.error('Drafta: Failed to save to local storage', err);
    }
  }
}

/**
 * Loads diagram elements from browser local storage with automatic legacy migration.
 */
export function loadFromLocalStorage(): {
  elements: DiagramElement[];
  camera?: AppState['camera'];
  theme?: AppState['theme'];
  canvasBackground?: string;
} | null {
  try {
    let raw = localStorage.getItem(PRIMARY_STORAGE_KEY);
    let isLegacy = false;

    // Migrate from legacy storage key if primary is not found
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      isLegacy = !!raw;
    }

    if (!raw) return null;

    const parsed = safeJSONParse<DraftaExportData>(raw);
    if (parsed && Array.isArray(parsed.elements)) {
      const sanitizedElements: DiagramElement[] = [];
      for (const el of parsed.elements) {
        const clean = sanitizeElement(el);
        if (clean) sanitizedElements.push(clean);
      }

      // If migrated from legacy, store into new key and delete old key
      if (isLegacy) {
        saveToLocalStorage(
          sanitizedElements,
          parsed.appState?.camera || { x: 0, y: 0, zoom: 1 },
          parsed.appState?.theme,
          parsed.appState?.backgroundColor
        );
        try {
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch (_) {}
      }

      return {
        elements: sanitizedElements,
        camera: parsed.appState?.camera,
        theme: parsed.appState?.theme,
        canvasBackground: parsed.appState?.backgroundColor,
      };
    }
  } catch (err) {
    console.error('Drafta: Failed to load diagram from localStorage', err);
  }
  return null;
}

/**
 * Exports the diagram as a downloadable JSON file (.drafta.json).
 */
export function downloadJSON(
  elements: DiagramElement[],
  camera: AppState['camera'],
  theme?: AppState['theme'],
  canvasBackground?: string,
  filename = 'drawing.drafta.json'
) {
  const data: DraftaExportData = {
    type: 'drafta',
    version: 1,
    elements,
    appState: {
      camera: {
        x: Number.isFinite(camera?.x) ? camera.x : 0,
        y: Number.isFinite(camera?.y) ? camera.y : 0,
        zoom: Number.isFinite(camera?.zoom) ? camera.zoom : 1,
      },
      backgroundColor: sanitizeColor(canvasBackground, '#ffffff'),
      theme: theme || 'light',
    },
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  try {
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    // Revoke object URL after delay to allow browser download initiation
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

/**
 * Securely reads and validates a diagram file uploaded by the user.
 */
export function readJSONFile(file: File): Promise<DraftaExportData> {
  return new Promise((resolve, reject) => {
    // 1. Guard against oversized payloads (DoS protection)
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return reject(new Error('File size exceeds the 15MB limit. Please upload a smaller diagram file.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content || typeof content !== 'string') {
          throw new Error('File content is empty or unreadable.');
        }

        // 2. Safe parse with prototype pollution prevention
        const parsed = safeJSONParse<DraftaExportData>(content);
        if (!parsed || !Array.isArray(parsed.elements)) {
          throw new Error('Invalid diagram file format. Expected an array of elements.');
        }

        // 3. Schema sanitization
        const sanitizedElements: DiagramElement[] = [];
        for (const el of parsed.elements) {
          const clean = sanitizeElement(el);
          if (clean) sanitizedElements.push(clean);
        }

        const sanitizedData: DraftaExportData = {
          type: 'drafta',
          version: 1,
          elements: sanitizedElements,
          appState: {
            camera: {
              x: Number.isFinite(parsed.appState?.camera?.x) ? Number(parsed.appState?.camera?.x) : 0,
              y: Number.isFinite(parsed.appState?.camera?.y) ? Number(parsed.appState?.camera?.y) : 0,
              zoom: Number.isFinite(parsed.appState?.camera?.zoom) ? Number(parsed.appState?.camera?.zoom) : 1,
            },
            backgroundColor: sanitizeColor(parsed.appState?.backgroundColor, '#ffffff'),
            theme: parsed.appState?.theme === 'dark' ? 'dark' : 'light',
          },
        };

        resolve(sanitizedData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the diagram file from disk.'));
    reader.readAsText(file);
  });
}

/**
 * Securely exports the visible canvas drawing to a high-resolution PNG image.
 */
export function exportToPNG(canvas: HTMLCanvasElement, filename = 'drafta-drawing.png') {
  canvas.toBlob((blob) => {
    if (!blob) {
      console.error('Drafta: Canvas export failed.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    try {
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
  }, 'image/png');
}
