import React, { useEffect, useRef } from 'react';
import { BoxElement } from '../types';

interface TextOverlayProps {
  box: BoxElement;
  camera: { x: number; y: number; zoom: number };
  onUpdateText: (id: string, text: string) => void;
  onFinishEditing: () => void;
}

export const TextOverlay: React.FC<TextOverlayProps> = ({
  box,
  camera,
  onUpdateText,
  onFinishEditing,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Screen coordinates
  const screenX = (box.x + camera.x) * camera.zoom;
  const screenY = (box.y + camera.y) * camera.zoom;
  const screenWidth = box.width * camera.zoom;
  const screenHeight = box.height * camera.zoom;
  const fontSize = (box.fontSize || 20) * camera.zoom;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      onFinishEditing();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onFinishEditing();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${screenWidth}px`,
        height: `${screenHeight}px`,
        pointerEvents: 'auto',
      }}
      className="flex items-center justify-center p-2 z-30"
    >
      <textarea
        ref={textareaRef}
        defaultValue={box.text || ''}
        onChange={(e) => onUpdateText(box.id, e.target.value)}
        onBlur={onFinishEditing}
        onKeyDown={handleKeyDown}
        placeholder="Type text..."
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1.25,
          color: box.strokeColor,
        }}
        className="w-full h-full bg-transparent resize-none outline-none border-none text-center font-handwriting overflow-hidden focus:ring-1 focus:ring-blue-400 rounded-lg p-1 placeholder-gray-400"
      />
    </div>
  );
};
