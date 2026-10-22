import React, { useRef, useEffect, useState, useCallback } from 'react';
import rough from 'roughjs';
import { DiagramElement, BoxElement, ArrowElement, AppState, Point } from '../types';
import {
  renderBox,
  renderArrow,
  renderSelectionOverlay,
  renderSnapHighlight,
} from '../renderer/rough-renderer';
import {
  hitTestElement,
  findBoxAtPoint,
  resolveArrowEndpoints,
  getBoxCenter,
} from '../geometry/binding';

interface CanvasProps {
  elements: DiagramElement[];
  onElementsChange: (elements: DiagramElement[]) => void;
  appState: AppState;
  onAppStateChange: (partial: Partial<AppState>) => void;
  onDoubleClickBox: (box: BoxElement) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  elements,
  onElementsChange,
  appState,
  onAppStateChange,
  onDoubleClickBox,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction State
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [dragStart, setDragStart] = useState<Point>([0, 0]);
  const [initialElementPos, setInitialElementPos] = useState<Point>([0, 0]);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Active Draft Element (currently being drawn)
  const [draftElement, setDraftElement] = useState<DiagramElement | null>(null);
  const [snapTargetBox, setSnapTargetBox] = useState<BoxElement | null>(null);

  // Scene coordinate conversion helpers
  const screenToScene = useCallback(
    (clientX: number, clientY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return [0, 0];
      const rect = canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      return [
        sx / appState.camera.zoom - appState.camera.x,
        sy / appState.camera.zoom - appState.camera.y,
      ];
    },
    [appState.camera]
  );

  // Main Render Cycle
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Paint Canvas Background Color
    ctx.save();
    ctx.fillStyle = appState.canvasBackground || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply Camera Transform
    ctx.scale(dpr * appState.camera.zoom, dpr * appState.camera.zoom);
    ctx.translate(appState.camera.x, appState.camera.y);

    const rc = rough.canvas(canvas);

    // Build box lookup map for resolved arrow endpoints
    const boxesMap = new Map<string, BoxElement>();
    for (const el of elements) {
      if (el.type === 'box') {
        boxesMap.set(el.id, el);
      }
    }

    // 1. Render all committed elements
    for (const el of elements) {
      if (el.type === 'box') {
        renderBox(rc, ctx, el);
      } else if (el.type === 'arrow') {
        const resolved = resolveArrowEndpoints(el, boxesMap);
        const resolvedArrow: ArrowElement = {
          ...el,
          startPoint: resolved.startPoint,
          endPoint: resolved.endPoint,
        };
        renderArrow(rc, ctx, resolvedArrow);
      }
    }

    // 2. Render Draft element being drawn
    if (draftElement) {
      if (draftElement.type === 'box') {
        renderBox(rc, ctx, draftElement);
      } else if (draftElement.type === 'arrow') {
        renderArrow(rc, ctx, draftElement);
      }
    }

    // 3. Render Snap Highlight on target box if snapping
    if (snapTargetBox) {
      renderSnapHighlight(ctx, snapTargetBox);
    }

    // 4. Render Selection Overlay
    if (appState.selectedId) {
      const selected = elements.find((el) => el.id === appState.selectedId);
      if (selected) {
        if (selected.type === 'arrow') {
          const resolved = resolveArrowEndpoints(selected, boxesMap);
          renderSelectionOverlay(ctx, { ...selected, ...resolved }, appState.camera);
        } else {
          renderSelectionOverlay(ctx, selected, appState.camera);
        }
      }
    }

    ctx.restore();
  }, [elements, draftElement, snapTargetBox, appState.selectedId, appState.camera, appState.canvasBackground]);

  // Adjust canvas resolution on resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      render();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      } else if (e.key === '1' || e.key.toLowerCase() === 'v') {
        onAppStateChange({ activeTool: 'select' });
      } else if (e.key === '2' || e.key.toLowerCase() === 'r') {
        onAppStateChange({ activeTool: 'box' });
      } else if (e.key === '3' || e.key.toLowerCase() === 'a') {
        onAppStateChange({ activeTool: 'arrow' });
      } else if (e.key === '4' || e.key.toLowerCase() === 'h') {
        onAppStateChange({ activeTool: 'hand' });
      } else if (e.key.toLowerCase() === 't') {
        onAppStateChange({ activeTool: 'text' });
      } else if (e.key.toLowerCase() === 'e') {
        onAppStateChange({ activeTool: 'eraser' });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onAppStateChange]);

  // Eraser Helper
  const eraseAtPoint = (sceneX: number, sceneY: number) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      if (hitTestElement(sceneX, sceneY, elements[i])) {
        const targetId = elements[i].id;
        const remaining = elements
          .filter((el) => el.id !== targetId)
          .map((el) => {
            if (el.type === 'arrow') {
              return {
                ...el,
                startBinding: el.startBinding?.boxId === targetId ? null : el.startBinding,
                endBinding: el.endBinding?.boxId === targetId ? null : el.endBinding,
              };
            }
            return el;
          });
        onElementsChange(remaining);
        if (appState.selectedId === targetId) {
          onAppStateChange({ selectedId: null });
        }
        break;
      }
    }
  };

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const [sceneX, sceneY] = screenToScene(e.clientX, e.clientY);
    setIsPointerDown(true);
    setDragStart([sceneX, sceneY]);

    // Handle Pan
    if (appState.activeTool === 'hand' || isSpacePressed || e.button === 1) {
      setIsPanning(true);
      return;
    }

    // Handle Eraser
    if (appState.activeTool === 'eraser') {
      eraseAtPoint(sceneX, sceneY);
      return;
    }

    if (appState.activeTool === 'select') {
      let clickedElement: DiagramElement | null = null;
      for (let i = elements.length - 1; i >= 0; i--) {
        if (hitTestElement(sceneX, sceneY, elements[i])) {
          clickedElement = elements[i];
          break;
        }
      }

      if (clickedElement) {
        onAppStateChange({ selectedId: clickedElement.id });
        if (clickedElement.type === 'box') {
          setInitialElementPos([clickedElement.x, clickedElement.y]);
        }
      } else {
        onAppStateChange({ selectedId: null });
      }
    } else if (appState.activeTool === 'text') {
      // If clicked on an existing box, edit it; otherwise create standard box and edit immediately
      const box = findBoxAtPoint(sceneX, sceneY, elements);
      if (box) {
        onDoubleClickBox(box);
      } else {
        const newBox: BoxElement = {
          id: `box_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          type: 'box',
          x: sceneX - 80,
          y: sceneY - 45,
          width: 160,
          height: 90,
          strokeColor: appState.strokeColor,
          backgroundColor: appState.backgroundColor,
          strokeWidth: appState.strokeWidth,
          strokeStyle: appState.strokeStyle,
          fillStyle: appState.fillStyle,
          roughness: appState.roughness,
          seed: Math.floor(Math.random() * 2147483647),
          text: '',
          fontSize: 20,
        };
        onElementsChange([...elements, newBox]);
        onAppStateChange({
          selectedId: newBox.id,
          editingTextId: newBox.id,
          activeTool: 'select',
        });
      }
    } else if (appState.activeTool === 'box') {
      const newBox: BoxElement = {
        id: `box_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'box',
        x: sceneX,
        y: sceneY,
        width: 1,
        height: 1,
        strokeColor: appState.strokeColor,
        backgroundColor: appState.backgroundColor,
        strokeWidth: appState.strokeWidth,
        strokeStyle: appState.strokeStyle,
        fillStyle: appState.fillStyle,
        roughness: appState.roughness,
        seed: Math.floor(Math.random() * 2147483647),
        text: '',
        fontSize: 20,
      };
      setDraftElement(newBox);
    } else if (appState.activeTool === 'arrow') {
      const startBox = findBoxAtPoint(sceneX, sceneY, elements);
      const startBinding = startBox ? { boxId: startBox.id, gap: 4 } : null;
      const startPoint: Point = startBox ? getBoxCenter(startBox) : [sceneX, sceneY];

      const newArrow: ArrowElement = {
        id: `arrow_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'arrow',
        strokeColor: appState.strokeColor,
        strokeWidth: appState.strokeWidth,
        strokeStyle: appState.strokeStyle,
        roughness: appState.roughness,
        seed: Math.floor(Math.random() * 2147483647),
        startPoint,
        endPoint: [sceneX, sceneY],
        startBinding,
        endBinding: null,
      };
      setDraftElement(newArrow);
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const [sceneX, sceneY] = screenToScene(e.clientX, e.clientY);

    // Panning
    if (isPanning) {
      const dx = (e.movementX || 0) / appState.camera.zoom;
      const dy = (e.movementY || 0) / appState.camera.zoom;
      onAppStateChange({
        camera: {
          ...appState.camera,
          x: appState.camera.x + dx,
          y: appState.camera.y + dy,
        },
      });
      return;
    }

    if (appState.activeTool === 'eraser' && isPointerDown) {
      eraseAtPoint(sceneX, sceneY);
      return;
    }

    if (!isPointerDown) {
      // Hover feedback when arrow tool is active
      if (appState.activeTool === 'arrow') {
        const hoverBox = findBoxAtPoint(sceneX, sceneY, elements);
        setSnapTargetBox(hoverBox);
      } else {
        setSnapTargetBox(null);
      }
      return;
    }

    // Dragging an existing element in 'select' mode
    if (appState.activeTool === 'select' && appState.selectedId) {
      const dx = sceneX - dragStart[0];
      const dy = sceneY - dragStart[1];

      onElementsChange(
        elements.map((el) => {
          if (el.id === appState.selectedId && el.type === 'box') {
            return {
              ...el,
              x: initialElementPos[0] + dx,
              y: initialElementPos[1] + dy,
            };
          }
          return el;
        })
      );
      return;
    }

    // Creating new Box
    if (draftElement && draftElement.type === 'box') {
      const x = Math.min(dragStart[0], sceneX);
      const y = Math.min(dragStart[1], sceneY);
      const width = Math.max(1, Math.abs(sceneX - dragStart[0]));
      const height = Math.max(1, Math.abs(sceneY - dragStart[1]));

      setDraftElement({
        ...draftElement,
        x,
        y,
        width,
        height,
      });
    }

    // Creating new Arrow
    if (draftElement && draftElement.type === 'arrow') {
      const targetBox = findBoxAtPoint(sceneX, sceneY, elements);
      setSnapTargetBox(targetBox);

      setDraftElement({
        ...draftElement,
        endPoint: [sceneX, sceneY],
      });
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsPointerDown(false);
    setIsPanning(false);

    if (draftElement) {
      const [sceneX, sceneY] = screenToScene(e.clientX, e.clientY);

      if (draftElement.type === 'box') {
        let finalBox = draftElement;
        if (draftElement.width < 10 && draftElement.height < 10) {
          finalBox = {
            ...draftElement,
            x: sceneX - 80,
            y: sceneY - 45,
            width: 160,
            height: 90,
          };
        }

        onElementsChange([...elements, finalBox]);
        onAppStateChange({
          selectedId: finalBox.id,
          activeTool: appState.isToolLocked ? 'box' : 'select',
        });
      } else if (draftElement.type === 'arrow') {
        const targetBox = findBoxAtPoint(sceneX, sceneY, elements);
        const endBinding = targetBox ? { boxId: targetBox.id, gap: 6 } : null;

        const finalArrow: ArrowElement = {
          ...draftElement,
          endBinding,
        };

        onElementsChange([...elements, finalArrow]);
        onAppStateChange({
          selectedId: finalArrow.id,
          activeTool: appState.isToolLocked ? 'arrow' : 'select',
        });
      }

      setDraftElement(null);
      setSnapTargetBox(null);
    }
  };

  // Double Click for Text Editing
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const [sceneX, sceneY] = screenToScene(e.clientX, e.clientY);
    const box = findBoxAtPoint(sceneX, sceneY, elements);
    if (box) {
      onDoubleClickBox(box);
    }
  };

  // Mouse Wheel (Zoom & Pan)
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = 1 - e.deltaY * 0.0015;
      const newZoom = Math.min(3.0, Math.max(0.2, appState.camera.zoom * zoomFactor));

      onAppStateChange({
        camera: {
          ...appState.camera,
          zoom: newZoom,
        },
      });
    } else {
      onAppStateChange({
        camera: {
          ...appState.camera,
          x: appState.camera.x - e.deltaX / appState.camera.zoom,
          y: appState.camera.y - e.deltaY / appState.camera.zoom,
        },
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      className={`absolute inset-0 w-full h-full touch-none ${
        isPanning || isSpacePressed
          ? 'cursor-grab active:cursor-grabbing'
          : appState.activeTool === 'select'
          ? 'cursor-default'
          : appState.activeTool === 'hand'
          ? 'cursor-grab'
          : appState.activeTool === 'eraser'
          ? 'cursor-pointer'
          : 'cursor-crosshair'
      }`}
    />
  );
};
