"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  moreLabel: string;
  lessLabel: string;
  className?: string;
}

/** Clamps long text to two lines and only offers the toggle when text is actually cut off. */
export function ExpandableText({ text, moreLabel, lessLabel, className = "" }: Props) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element || isExpanded) return undefined;

    const measure = () => setIsClamped(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, isExpanded]);

  return (
    <>
      <p
        ref={textRef}
        className={`whitespace-pre-wrap [overflow-wrap:anywhere] ${isExpanded ? "" : "line-clamp-2"} ${className}`}
      >
        {text}
      </p>
      {isClamped || isExpanded ? (
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((value) => !value)}
          className="mt-1 rounded text-xs font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isExpanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </>
  );
}
