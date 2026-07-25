import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

export default function Modal({ open, onClose, children, className = "", labelledBy }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/70 backdrop-blur-sm animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={onClose}
      data-testid="modal-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full sm:max-w-lg card-surface rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto",
          className
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-end p-2 bg-bg-surface/95 backdrop-blur border-b border-line">
          <button
            onClick={onClose}
            data-testid="modal-close-btn"
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/5 text-ink-secondary hover:text-ink-primary transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
