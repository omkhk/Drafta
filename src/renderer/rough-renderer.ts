import rough from 'roughjs';
import { BoxElement, ArrowElement, DiagramElement, Point } from '../types';

/**
 * Draws an arrowhead on the end of a line.
 */
function drawArrowhead(
  rc: ReturnType<typeof rough.canvas>,
  from: Point,
  to: Point,
  strokeColor: string,
  strokeWidth: number,
  roughness: number,
  seed: number
) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = Math.max(12, strokeWidth * 6);
  const headAngle = Math.PI / 6; // 30 degrees

  const leftX = x2 - headLength * Math.cos(angle - headAngle);
  const leftY = y2 - headLength * Math.sin(angle - headAngle);
  const rightX = x2 - headLength * Math.cos(angle + headAngle);
  const rightY = y2 - headLength * Math.sin(angle + headAngle);

  rc.line(x2, y2, leftX, leftY, {
    stroke: strokeColor,
    strokeWidth,
    roughness,
    seed: seed + 101,
  });

  rc.line(x2, y2, rightX, rightY, {
    stroke: strokeColor,
    strokeWidth,
    roughness,
    seed: seed + 202,
  });
}

/**
 * Wraps text into lines that fit within max width.
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (!para) {
      lines.push('');
      continue;
    }
    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

/**
 * Renders a box element including its background, sketchy outline, and centered text.
 */
export function renderBox(
  rc: ReturnType<typeof rough.canvas>,
  ctx: CanvasRenderingContext2D,
  box: BoxElement
) {
  ctx.save();
  if (box.opacity !== undefined) {
    ctx.globalAlpha = box.opacity / 100;
  }

  const options: Record<string, unknown> = {
    seed: box.seed,
    stroke: box.strokeColor,
    strokeWidth: box.strokeWidth,
    roughness: box.roughness,
    strokeLineDash: box.strokeStyle === 'dashed' ? [8, 8] : undefined,
  };

  if (box.fillStyle !== 'transparent' && box.backgroundColor !== 'transparent') {
    options.fill = box.backgroundColor;
    options.fillStyle = box.fillStyle; // 'hachure' | 'solid'
    options.hachureAngle = -41;
    options.hachureGap = Math.max(4, box.strokeWidth * 3);
  }

  rc.rectangle(box.x, box.y, box.width, box.height, options);

  // Render centered text if present
  if (box.text && box.text.trim().length > 0) {
    const fontSize = box.fontSize || 20;
    ctx.font = `${fontSize}px 'Caveat', 'Segoe Print', cursive, sans-serif`;
    ctx.fillStyle = box.strokeColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxTextWidth = Math.max(10, box.width - 24);
    const lines = wrapText(ctx, box.text, maxTextWidth);
    const lineHeight = fontSize * 1.25;
    const totalHeight = lines.length * lineHeight;
    let startY = box.y + (box.height - totalHeight) / 2 + lineHeight / 2;

    const centerX = box.x + box.width / 2;
    for (const line of lines) {
      ctx.fillText(line, centerX, startY);
      startY += lineHeight;
    }
  }
  ctx.restore();
}

/**
 * Renders an arrow element with an arrowhead.
 */
export function renderArrow(
  rc: ReturnType<typeof rough.canvas>,
  ctx: CanvasRenderingContext2D,
  arrow: ArrowElement
) {
  ctx.save();
  if (arrow.opacity !== undefined) {
    ctx.globalAlpha = arrow.opacity / 100;
  }

  const [x1, y1] = arrow.startPoint;
  const [x2, y2] = arrow.endPoint;

  rc.line(x1, y1, x2, y2, {
    seed: arrow.seed,
    stroke: arrow.strokeColor,
    strokeWidth: arrow.strokeWidth,
    roughness: arrow.roughness,
    strokeLineDash: arrow.strokeStyle === 'dashed' ? [8, 8] : undefined,
  });

  drawArrowhead(
    rc,
    arrow.startPoint,
    arrow.endPoint,
    arrow.strokeColor,
    arrow.strokeWidth,
    arrow.roughness,
    arrow.seed
  );
  ctx.restore();
}

/**
 * Renders selection outlines, resize handles, or snap indicators.
 */
export function renderSelectionOverlay(
  ctx: CanvasRenderingContext2D,
  element: DiagramElement,
  camera: { x: number; y: number; zoom: number }
) {
  ctx.save();
  ctx.strokeStyle = '#3b82f6'; // Bright blue
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 1.5 / camera.zoom;
  ctx.setLineDash([4 / camera.zoom, 4 / camera.zoom]);

  if (element.type === 'box') {
    const p = 6;
    ctx.strokeRect(element.x - p, element.y - p, element.width + p * 2, element.height + p * 2);

    // Render corner resize handles
    const handleSize = 8 / camera.zoom;
    const corners = [
      [element.x - p, element.y - p],
      [element.x + element.width + p, element.y - p],
      [element.x + element.width + p, element.y + element.height + p],
      [element.x - p, element.y + element.height + p],
    ];

    ctx.setLineDash([]);
    for (const [hx, hy] of corners) {
      ctx.beginPath();
      ctx.rect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
      ctx.fill();
      ctx.stroke();
    }
  } else if (element.type === 'arrow') {
    const handleSize = 8 / camera.zoom;
    ctx.setLineDash([]);
    for (const [px, py] of [element.startPoint, element.endPoint]) {
      ctx.beginPath();
      ctx.arc(px, py, handleSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Highlights a box when an arrow endpoint is hovering near it (ready to snap).
 */
export function renderSnapHighlight(
  ctx: CanvasRenderingContext2D,
  box: BoxElement
) {
  ctx.save();
  ctx.strokeStyle = '#06b6d4'; // Cyan
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 6]);
  ctx.strokeRect(box.x - 4, box.y - 4, box.width + 8, box.height + 8);
  ctx.restore();
}
