import { BoxElement, ArrowElement, Point, DiagramElement } from '../types';

/**
 * Returns the geometric center point of a box.
 */
export function getBoxCenter(box: BoxElement): Point {
  return [box.x + box.width / 2, box.y + box.height / 2];
}

/**
 * Checks if a point (px, py) is inside or very close to a box (with optional padding).
 */
export function isPointInsideBox(px: number, py: number, box: BoxElement, padding = 0): boolean {
  return (
    px >= box.x - padding &&
    px <= box.x + box.width + padding &&
    py >= box.y - padding &&
    py <= box.y + box.height + padding
  );
}

/**
 * Finds the top-most box under a given point.
 */
export function findBoxAtPoint(px: number, py: number, elements: DiagramElement[], padding = 8): BoxElement | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.type === 'box' && isPointInsideBox(px, py, el, padding)) {
      return el;
    }
  }
  return null;
}

/**
 * Helper to compute intersection between two 2D line segments (p1 -> p2) and (p3 -> p4).
 */
function lineIntersection(
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  x4: number, y4: number
): Point | null {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-9) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
  }
  return null;
}

/**
 * Calculates the exact point where a line from `fromPoint` towards `box` center
 * intersects the perimeter of `box`, backed off by `gap` pixels.
 */
export function intersectBoxWithRay(box: BoxElement, fromPoint: Point, gap = 4): Point {
  const center = getBoxCenter(box);
  const [fx, fy] = fromPoint;
  const [cx, cy] = center;

  // If fromPoint is essentially at the center, default to top edge
  if (Math.hypot(fx - cx, fy - cy) < 1e-5) {
    return [box.x + box.width / 2, box.y - gap];
  }

  // 4 edges of the box
  const edges: [number, number, number, number][] = [
    [box.x, box.y, box.x + box.width, box.y], // Top
    [box.x + box.width, box.y, box.x + box.width, box.y + box.height], // Right
    [box.x, box.y + box.height, box.x + box.width, box.y + box.height], // Bottom
    [box.x, box.y, box.x, box.y + box.height], // Left
  ];

  let closestIntersection: Point | null = null;
  let minDistance = Infinity;

  for (const [x1, y1, x2, y2] of edges) {
    const pt = lineIntersection(fx, fy, cx, cy, x1, y1, x2, y2);
    if (pt) {
      const dist = Math.hypot(pt[0] - fx, pt[1] - fy);
      if (dist < minDistance) {
        minDistance = dist;
        closestIntersection = pt;
      }
    }
  }

  if (!closestIntersection) {
    // Fallback: clamp ray to box boundary
    return center;
  }

  // Apply gap offset along the ray vector towards fromPoint
  const dx = fx - cx;
  const dy = fy - cy;
  const length = Math.hypot(dx, dy);
  if (length > 0) {
    const nx = dx / length;
    const ny = dy / length;
    return [
      closestIntersection[0] + nx * gap,
      closestIntersection[1] + ny * gap,
    ];
  }

  return closestIntersection;
}

/**
 * Recalculates both start and end points of an arrow if it is bound to boxes.
 */
export function resolveArrowEndpoints(
  arrow: ArrowElement,
  boxesMap: Map<string, BoxElement>
): { startPoint: Point; endPoint: Point } {
  let startPoint = arrow.startPoint;
  let endPoint = arrow.endPoint;

  const startBox = arrow.startBinding ? boxesMap.get(arrow.startBinding.boxId) : null;
  const endBox = arrow.endBinding ? boxesMap.get(arrow.endBinding.boxId) : null;

  if (startBox && endBox) {
    // Both ends bound to boxes
    const startCenter = getBoxCenter(startBox);
    const endCenter = getBoxCenter(endBox);
    startPoint = intersectBoxWithRay(startBox, endCenter, arrow.startBinding?.gap ?? 4);
    endPoint = intersectBoxWithRay(endBox, startCenter, arrow.endBinding?.gap ?? 6);
  } else if (startBox) {
    // Start bound, end free
    startPoint = intersectBoxWithRay(startBox, endPoint, arrow.startBinding?.gap ?? 4);
  } else if (endBox) {
    // Start free, end bound
    endPoint = intersectBoxWithRay(endBox, startPoint, arrow.endBinding?.gap ?? 6);
  }

  return { startPoint, endPoint };
}

/**
 * Calculates perpendicular distance from point to line segment.
 */
export function distanceToLineSegment(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) return Math.hypot(px - x1, py - y1);

  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

/**
 * Hit testing for selecting elements.
 */
export function hitTestElement(px: number, py: number, element: DiagramElement): boolean {
  if (element.type === 'box') {
    return isPointInsideBox(px, py, element, 6);
  }
  if (element.type === 'arrow') {
    const [x1, y1] = element.startPoint;
    const [x2, y2] = element.endPoint;
    return distanceToLineSegment(px, py, x1, y1, x2, y2) <= 10;
  }
  return false;
}
