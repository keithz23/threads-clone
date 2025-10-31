import React, {
  useState,
  useMemo,
  useRef,
  useContext,
  createContext,
  useCallback,
} from "react";
import { X, Check, AlertCircle, Info } from "lucide-react";

// ---------- Types ----------
type ToastType = "default" | "success" | "error" | "info";
type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type ToastRecord = {
  id: number;
  message?: string;
  type: ToastType;
  duration: number; // ms; 0 = persistent
  createdAt: number;
  render?: (id: number) => React.ReactNode; // for custom toasts
};

type ToastAPI = {
  success: (message: string, duration?: number) => number;
  error: (message: string, duration?: number) => number;
  info: (message: string, duration?: number) => number;
  default: (message: string, duration?: number) => number;
  custom: (
    render: (id: number) => React.ReactNode,
    duration?: number
  ) => number;
  dismiss: (id: number) => void;
  clear: () => void;
  config: (opts: Partial<ToastConfig>) => void;
};

type ToastConfig = {
  maxToasts: number;
  position: Position;
  dedupe: boolean; // prevent identical message+type in list
};

// ---------- Context ----------
const ToastContext = createContext<ToastAPI | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

// ---------- Provider ----------
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [config, setConfig] = useState<ToastConfig>({
    maxToasts: 4,
    position: "bottom-center",
    dedupe: true,
  });

  // track individual toast timers
  const timersRef = useRef<
    Map<number, { remaining: number; started: number; id?: any }>
  >(new Map());

  const genId = () =>
    typeof performance !== "undefined" ? performance.now() : Date.now();

  const startTimer = useCallback((toast: ToastRecord) => {
    if (toast.duration <= 0) return;
    const existing = timersRef.current.get(toast.id);
    const remaining = existing?.remaining ?? toast.duration;
    const started = Date.now();
    const id = setTimeout(() => dismiss(toast.id), remaining);
    timersRef.current.set(toast.id, { remaining, started, id });
  }, []);

  const pauseTimer = useCallback((id: number) => {
    const t = timersRef.current.get(id);
    if (!t?.id) return;
    clearTimeout(t.id);
    const elapsed = Date.now() - t.started;
    timersRef.current.set(id, {
      remaining: Math.max(0, t.remaining - elapsed),
      started: 0,
    });
  }, []);

  const resumeTimer = useCallback(
    (id: number) => {
      const rec = toasts.find((t) => t.id === id);
      if (!rec) return;
      startTimer(rec);
    },
    [toasts, startTimer]
  );

  const addBase = useCallback(
    (partial: Omit<ToastRecord, "id" | "createdAt">) => {
      const id = Math.floor(genId() * 1000);
      setToasts((prev) => {
        const candidate: ToastRecord = {
          id,
          createdAt: Date.now(),
          ...partial,
        };

        let list = prev;

        if (config.dedupe && candidate.message) {
          const dup = prev.some(
            (t) => t.message === candidate.message && t.type === candidate.type
          );
          if (dup) return prev; // skip duplicate
        }

        // respect maxToasts (drop oldest first)
        if (prev.length >= config.maxToasts) {
          const [, ...rest] = prev; // drop oldest (index 0)
          list = rest;
        }

        const next = [...list, candidate];

        // kick timer on next tick (so `toasts` has the item)
        queueMicrotask(() => startTimer(candidate));
        return next;
      });
      return id;
    },
    [config.dedupe, config.maxToasts, startTimer]
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timersRef.current.get(id);
    if (t?.id) clearTimeout(t.id);
    timersRef.current.delete(id);
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
    timersRef.current.forEach((t) => t.id && clearTimeout(t.id));
    timersRef.current.clear();
  }, []);

  const api = useMemo<ToastAPI>(
    () => ({
      success: (message, duration = 3000) =>
        addBase({ message, type: "success", duration }),
      error: (message, duration = 3500) =>
        addBase({ message, type: "error", duration }),
      info: (message, duration = 3000) =>
        addBase({ message, type: "info", duration }),
      default: (message, duration = 2500) =>
        addBase({ message, type: "default", duration }),
      custom: (render, duration = 3000) =>
        addBase({ type: "default", duration, render }),
      dismiss,
      clear,
      config: (opts) => setConfig((c) => ({ ...c, ...opts })),
    }),
    [addBase, dismiss, clear]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer
        toasts={toasts}
        position={config.position}
        onPause={pauseTimer}
        onResume={resumeTimer}
        onDismiss={dismiss}
      />
    </ToastContext.Provider>
  );
};

// ---------- Container ----------
const posToClass: Record<Position, string> = {
  "top-left": "top-6 left-6",
  "top-center": "top-6 left-1/2 -translate-x-1/2",
  "top-right": "top-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-6 right-6",
};

const ToastContainer: React.FC<{
  toasts: ToastRecord[];
  position: Position;
  onPause: (id: number) => void;
  onResume: (id: number) => void;
  onDismiss: (id: number) => void;
}> = ({ toasts, position, onPause, onResume, onDismiss }) => {
  return (
    <div
      className={`fixed z-[1000] ${posToClass[position]} flex flex-col gap-2 pointer-events-none`}
      aria-live="polite"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          toast={t}
          onPause={() => onPause(t.id)}
          onResume={() => onResume(t.id)}
          onDismiss={() => onDismiss(t.id)}
        />
      ))}
    </div>
  );
};

// ---------- Item ----------
const ToastItem: React.FC<{
  toast: ToastRecord;
  onDismiss: () => void;
  onPause: () => void;
  onResume: () => void;
}> = ({ toast, onDismiss, onPause, onResume }) => {
  const [exiting, setExiting] = useState(false);

  const handleDismiss = () => {
    setExiting(true);
    // keep in sync with transition duration-200
    setTimeout(onDismiss, 180);
  };

  const icon =
    toast.type === "success"
      ? Check
      : toast.type === "error"
      ? AlertCircle
      : toast.type === "info"
      ? Info
      : null;

  const base =
    "flex items-center gap-3 px-4 py-3 rounded-full shadow-lg backdrop-blur-md pointer-events-auto transition-all duration-200";
  const styles =
    toast.type === "success"
      ? `${base} bg-black/90 text-white border border-white/10`
      : toast.type === "error"
      ? `${base} bg-red-500/95 text-white border border-red-400/20`
      : toast.type === "info"
      ? `${base} bg-blue-500/95 text-white border border-blue-400/20`
      : `${base} bg-black/90 text-white border border-white/10`;

  // reduced-motion: avoid scale/translate
  const motionClasses = exiting
    ? "opacity-0 translate-y-2 scale-95 motion-reduce:translate-y-0 motion-reduce:scale-100"
    : "opacity-100 translate-y-0 scale-100";

  const role = toast.type === "error" ? "alert" : "status";
  const LabelIcon = icon;

  return (
    <div
      role={role}
      className={`${styles} ${motionClasses}`}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      style={{ animation: exiting ? "none" : "slideUp 0.18s ease-out" }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes slideUp { from { opacity: 0 } to { opacity: 1 } }
        }
      `}</style>

      {toast.render ? (
        // Custom render path
        <div className="flex items-center gap-3">
          {toast.render(toast.id)}
          <button
            aria-label="Dismiss notification"
            onClick={handleDismiss}
            className="ml-1 flex-shrink-0 hover:bg-white/10 rounded-full p-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          {LabelIcon && (
            <div className="flex-shrink-0">
              <LabelIcon className="w-4 h-4" />
            </div>
          )}
          <span className="text-sm font-medium whitespace-nowrap">
            {toast.message}
          </span>
        </>
      )}
    </div>
  );
};
