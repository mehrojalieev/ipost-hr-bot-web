"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { Application, STATUS_LABELS } from "@/lib/types";

// ---- Sheet (bottom-sheet / centered modal) — silliq ochilib-yopiladi ----
export function SheetShell({
  onClose,
  children,
}: {
  onClose: () => void;
  children: (close: () => void) => React.ReactNode;
}) {
  const [closing, setClosing] = useState(false);
  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  return (
    <div
      onClick={close}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-950/50 backdrop-blur-sm transition-opacity duration-200 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-surface shadow-2xl transition-all duration-200 ${
          closing
            ? "translate-y-8 opacity-0 sm:translate-y-2 sm:scale-95"
            : "animate-sheet"
        }`}
      >
        {children(close)}
      </div>
    </div>
  );
}

// ---- Status badge ----
const STATUS_STYLES: Record<Application["status"], string> = {
  new: "bg-brand-500/12 text-brand-700 dark:text-brand-300 ring-brand-500/20",
  reviewing: "bg-amber-400/15 text-amber-700 dark:text-amber-300 ring-amber-500/20",
  accepted: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20",
  rejected: "bg-rose-500/12 text-rose-700 dark:text-rose-300 ring-rose-500/20",
};
const STATUS_DOT: Record<Application["status"], string> = {
  new: "bg-brand-500",
  reviewing: "bg-amber-500",
  accepted: "bg-emerald-500",
  rejected: "bg-rose-500",
};

export function StatusBadge({ status }: { status: Application["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

// ---- Toast ----
export function Toast({
  message,
  type = "success",
  action,
  onClose,
}: {
  message: string;
  type?: "success" | "error";
  action?: { label: string; onClick: () => void };
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, action ? 4000 : 2600);
    return () => clearTimeout(t);
  }, [onClose, action]);

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 animate-fade-up">
      <div
        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
          type === "success" ? "bg-ink-900" : "bg-rose-600"
        }`}
      >
        {type === "success" ? (
          <Check size={16} strokeWidth={2.6} />
        ) : (
          <TriangleAlert size={16} strokeWidth={2.4} />
        )}
        {message}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className="ml-1 font-bold text-brand-300 hover:text-brand-200 underline underline-offset-2"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ---- Confirm dialog ----
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Ha, o'chirish",
  onConfirm,
  onCancel,
  danger = true,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center px-6 bg-ink-950/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-content">{title}</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{message}</p>
        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium text-content hover:bg-cloud active:scale-[0.98] transition"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition ${
              danger ? "bg-rose-600 hover:bg-rose-700" : "bg-brand-600 hover:bg-brand-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Empty state ----
export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-surface/50 py-14 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-cloud grid place-items-center text-[var(--text-muted)]">
        {icon}
      </div>
      <p className="mt-3 font-semibold text-content">{title}</p>
      {subtitle && (
        <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
      )}
    </div>
  );
}

// ---- Spinner (inline) ----
export function Spinner() {
  return (
    <div className="grid place-items-center py-16">
      <div className="h-9 w-9 rounded-full border-[3px] border-brand-500/25 border-t-brand-500 spin" />
    </div>
  );
}

// ---- Skeleton (yuklanish paytida) ----
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-cloud ${className}`} />;
}

// Karta-ro'yxat skeleton (arizalar/vakansiyalar)
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl bg-surface border border-[var(--border)] p-3.5"
        >
          <Skeleton className="h-11 w-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

// Dashboard statistika grid skeleton
export function StatGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-surface border border-[var(--border)] p-4"
        >
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="mt-3 h-6 w-12" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}
