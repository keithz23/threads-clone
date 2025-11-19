import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ReadmoreProps = {
  children: React.ReactNode;
  lines?: number;
  moreLabel?: string;
  lessLabel?: string;
  className?: string;
  allowHtml?: boolean;
};

export default function Readmore({
  children,
  lines = 3,
  moreLabel = "Read more",
  lessLabel = "Show less",
  className,
  allowHtml = false,
}: ReadmoreProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const checkOverflow = () => {
      setShowToggle(el.scrollHeight > el.clientHeight + 1);
    };

    checkOverflow();

    const ResizeObserverCtor = (window as any).ResizeObserver;
    const ro = ResizeObserverCtor
      ? new ResizeObserverCtor(checkOverflow)
      : null;
    if (ro && el) ro.observe(el);

    window.addEventListener("resize", checkOverflow);

    const t = window.setTimeout(checkOverflow, 50);

    return () => {
      if (ro && el) ro.disconnect();
      window.removeEventListener("resize", checkOverflow);
      clearTimeout(t);
    };
  }, [children, lines]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((s) => !s);
  };

  const contentProps =
    allowHtml && typeof children === "string"
      ? { dangerouslySetInnerHTML: { __html: children } }
      : undefined;

  return (
    <div className={cn("readmore-root", className)}>
      <div
        ref={ref}
        className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap break-words text-left overflow-hidden",
          !expanded ? "-webkit-box" : "block"
        )}
        style={
          !expanded
            ? {
                WebkitLineClamp: lines,
                WebkitBoxOrient: "vertical" as any,
                display: "-webkit-box",
              }
            : undefined
        }
        aria-expanded={expanded}
        {...(contentProps as any)}
      >
        {!contentProps && children}
      </div>

      {showToggle && (
        <button
          onClick={handleToggle}
          aria-expanded={expanded}
          aria-label={expanded ? lessLabel : moreLabel}
          className="mt-2 text-sm text-blue-500 hover:underline bg-none border-none p-0 cursor-pointer"
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
}
