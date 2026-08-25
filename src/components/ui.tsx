"use client";

import { useEffect } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { Application, STATUS_LABELS } from "@/lib/types";

// ---- Status badge ----
const STATUS_STYLES: Record<Application["status"], string> = {
  new: "bg-brand-500/12 text-brand-700 ring-brand-500/20",
  reviewing: "bg-amber-400/15 text-amber-700 ring-amber-500/20",
  accepted: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
  rejected: "bg-rose-500/12 text-rose-700 ring-rose-500/20",
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
  onClose,
}: {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);

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
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{message}</p>
        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium text-ink-800 active:scale-[0.98] transition"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition ${
              danger ? "bg-rose-600" : "bg-brand-600"
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
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/50 py-14 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-cloud grid place-items-center text-[var(--text-muted)]">
        {icon}
      </div>
      <p className="mt-3 font-semibold text-ink-900">{title}</p>
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
