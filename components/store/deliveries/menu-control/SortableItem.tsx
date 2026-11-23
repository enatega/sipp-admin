'use client';

import type { PointerEvent, ReactNode } from 'react';
import { Reorder, useDragControls } from 'framer-motion';

interface Props {
  value: string;
  as?: 'li' | 'article';
  id?: string;
  className?: string;
  isDisabled?: boolean;
  onDragEnd: () => void;
  children: (startDrag: (event: PointerEvent) => void) => ReactNode;
}

// Reorder item that only starts dragging from its handle, so clicks, selects and buttons inside keep working.
export function SortableItem({ value, as = 'li', id, className, isDisabled, onDragEnd, children }: Props) {
  const controls = useDragControls();
  function startDrag(event: PointerEvent) {
    if (isDisabled) return;
    event.preventDefault();
    controls.start(event);
  }
  return <Reorder.Item value={value} as={as} id={id} dragListener={false} dragControls={controls} onDragEnd={onDragEnd} whileDrag={{ scale: 1.02, boxShadow: '0 20px 40px -16px rgb(3 105 161 / 0.45)', cursor: 'grabbing' }} className={className}>
    {children(startDrag)}
  </Reorder.Item>;
}
