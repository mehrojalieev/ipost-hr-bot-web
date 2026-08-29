"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Wallet,
  MapPin,
  Pencil,
  Trash2,
  Briefcase,
  FileDown,
  Users,
  X,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  Application,
  STATUS_LABELS,
  Vacancy,
  VacancyInput,
  VacancyStat,
} from "@/lib/types";
import { exportVacanciesPdf, exportVacancyApplicantsPdf } from "@/lib/pdf";
import { formatDate } from "@/lib/format";
import VacancyForm from "@/components/VacancyForm";
import { ApplicationDetail } from "@/components/ApplicationDetail";
import {
  ConfirmDialog,
  EmptyState,
  ListSkeleton,
  SheetShell,
  StatusBadge,
  Toast,
} from "@/components/ui";

export default function VacanciesPage() {
  const [items, setItems] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vacancy | undefined>();
  const [toDelete, setToDelete] = useState<Vacancy | undefined>();
  const [toToggle, setToToggle] = useState<Vacancy | undefined>();
  const [breakdown, setBreakdown] = useState<VacancyStat[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicantsOf, setApplicantsOf] = useState<Vacancy | undefined>();
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [pending, setPending] = useState<{
    app: Application;
    status: Application["status"];
  } | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
    action?: { label: string; onClick: () => void };
  } | null>(null);

  function load() {
    api
      .get<{ vacancies: Vacancy[] }>("/api/vacancies")
      .then((r) => setItems(r.vacancies))
      .catch(() => setToast({ msg: "Yuklashda xatolik", type: "error" }))
      .finally(() => setLoading(false));
    api
      .get<{ byVacancy: VacancyStat[] }>("/api/stats")
      .then((r) => setBreakdown(r.byVacancy))
      .catch(() => {});
    api
      .get<{ applications: Application[] }>("/api/applications")
      .then((r) => setApplications(r.applications))
      .catch(() => {});
  }

  useEffect(load, []);

  const applicantsFor = (id: string) =>
    applications.filter((a) => a.vacancyId === id);

  async function setAppStatus(app: Application, status: Application["status"]) {
    const prev = app.status;
    setApplications((list) =>
      list.map((a) => (a.id === app.id ? { ...a, status } : a))
    );
    let notified = false;
    try {
      const r = await api.patch<{ notified?: boolean }>(
        `/api/applications/${app.id}`,
        { status }
      );
      notified = !!r.notified;
    } catch {
      setApplications((list) =>
        list.map((a) => (a.id === app.id ? { ...a, status: prev } : a))
      );
      setToast({ msg: "Xatolik yuz berdi", type: "error" });
      return;
    }
    setToast({
      msg: notified
        ? `Holat: ${STATUS_LABELS[status]} · nomzodga xabar yuborildi`
        : `Holat: ${STATUS_LABELS[status]}`,
      type: "success",
    });
  }

  async function downloadPdf() {
    if (items.length === 0) {
      setToast({ msg: "Vakansiyalar yo'q", type: "error" });
      return;
    }
    try {
      const result = await exportVacanciesPdf(items, breakdown);
      if (result === "saved") {
        setToast({ msg: "PDF saqlandi", type: "success" });
      }
    } catch {
      setToast({ msg: "PDF yaratishda xatolik", type: "error" });
    }
  }

  async function downloadApplicantsPdf(v: Vacancy) {
    try {
      const result = await exportVacancyApplicantsPdf(v, applicantsFor(v.id));
      if (result === "saved") {
        setToast({ msg: "PDF saqlandi", type: "success" });
      }
    } catch {
      setToast({ msg: "PDF yaratishda xatolik", type: "error" });
    }
  }

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(v: Vacancy) {
    setEditing(v);
    setFormOpen(true);
  }

  async function handleSubmit(data: VacancyInput) {
    setSaving(true);
    try {
      if (editing) {
        const r = await api.put<{ vacancy: Vacancy }>(
          `/api/vacancies/${editing.id}`,
          data
        );
        setItems((list) =>
          list.map((v) => (v.id === editing.id ? r.vacancy : v))
        );
        setToast({ msg: "Vakansiya yangilandi", type: "success" });
      } else {
        const r = await api.post<{ vacancy: Vacancy }>("/api/vacancies", data);
        setItems((list) => [r.vacancy, ...list]);
        setToast({ msg: "Vakansiya qo'shildi", type: "success" });
      }
      setFormOpen(false);
      setEditing(undefined);
    } catch {
      setToast({ msg: "Saqlashda xatolik", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const id = toDelete.id;
    setToDelete(undefined);
    try {
      await api.del(`/api/vacancies/${id}`);
      setItems((list) => list.filter((v) => v.id !== id));
      setToast({ msg: "Vakansiya o'chirildi", type: "success" });
    } catch {
      setToast({ msg: "O'chirishda xatolik", type: "error" });
    }
  }

  async function toggleActive(v: Vacancy) {
    try {
      const r = await api.put<{ vacancy: Vacancy }>(`/api/vacancies/${v.id}`, {
        ...v,
        active: !v.active,
      });
      setItems((list) => list.map((x) => (x.id === v.id ? r.vacancy : x)));
    } catch {
      setToast({ msg: "Xatolik", type: "error" });
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="sticky top-0 z-10 -mx-4 -mt-5 px-4 pt-4 pb-3 bg-[var(--bg)] border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-content">Vakansiyalar</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {items.length} ta lavozim
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadPdf}
            aria-label="PDF yuklab olish"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-surface text-content px-3 py-2.5 text-sm font-semibold hover:bg-cloud hover:border-brand-300 active:scale-[0.97] transition"
          >
            <FileDown size={16} /> PDF
          </button>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-brand-700 active:scale-[0.97] transition"
          >
            <Plus size={17} strokeWidth={2.5} /> Qo&apos;shish
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-3">
          <ListSkeleton rows={4} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={24} />}
          title="Vakansiyalar yo'q"
          subtitle="“+ Qo'shish” tugmasi bilan birinchi vakansiyani yarating."
        />
      ) : (
        <div className="space-y-3 mt-3">
          {items.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl bg-surface border border-[var(--border)] p-4 hover:border-brand-200 hover:shadow-sm transition"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-cloud grid place-items-center text-xl">
                  {v.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-content truncate">
                    {v.uz.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {v.uz.department} · {v.uz.employment}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-content">
                    <span className="inline-flex items-center gap-1">
                      <Wallet size={13} className="text-brand-600" /> {v.uz.salary}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} className="text-[var(--text-muted)]" />{" "}
                      {v.uz.location}
                    </span>
                  </div>
                </div>

                {/* Faol/Nofaol switch */}
                <button
                  onClick={() => setToToggle(v)}
                  title={v.active ? "Nofaol qilish" : "Faollashtirish"}
                  className="shrink-0 flex flex-col items-center gap-1"
                >
                  <span
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      v.active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        v.active ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      v.active
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {v.active ? "Faol" : "Nofaol"}
                  </span>
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2">
                <button
                  onClick={() => setApplicantsOf(v)}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-brand-700 dark:text-brand-300 rounded-lg px-3 py-2 bg-brand-500/10 hover:bg-brand-500/20 transition-colors"
                >
                  <Users size={14} /> Arizalar ({applicantsFor(v.id).length})
                </button>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(v)}
                    aria-label="Tahrirlash"
                    title="Tahrirlash"
                    className="h-8 w-8 grid place-items-center rounded-lg bg-brand-500/10 text-brand-700 dark:text-brand-300 hover:bg-brand-500/20 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setToDelete(v)}
                    aria-label="O'chirish"
                    title="O'chirish"
                    className="h-8 w-8 grid place-items-center rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <VacancyForm
          initial={editing}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => {
            setFormOpen(false);
            setEditing(undefined);
          }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Vakansiyani o'chirish"
        message={`“${toDelete?.uz.title}” butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(undefined)}
      />

      <ConfirmDialog
        open={!!toToggle}
        danger={!!toToggle?.active}
        title={toToggle?.active ? "Nofaol qilish" : "Faollashtirish"}
        message={
          toToggle?.active
            ? `“${toToggle?.uz.title}” foydalanuvchilarga ko'rinmaydi. Nofaol qilasizmi?`
            : `“${toToggle?.uz.title}” foydalanuvchilarga ko'rinadi. Faollashtirasizmi?`
        }
        confirmLabel={
          toToggle?.active ? "Ha, nofaol qilish" : "Ha, faollashtirish"
        }
        onConfirm={() => {
          if (toToggle) toggleActive(toToggle);
          setToToggle(undefined);
        }}
        onCancel={() => setToToggle(undefined)}
      />

      {applicantsOf && (
        <ApplicantsSheet
          vacancy={applicantsOf}
          applicants={applicantsFor(applicantsOf.id)}
          onClose={() => {
            setApplicantsOf(undefined);
            setDetailIndex(null);
          }}
          onPdf={() => downloadApplicantsPdf(applicantsOf)}
          onOpenDetail={(i) => setDetailIndex(i)}
        />
      )}

      {applicantsOf &&
        detailIndex !== null &&
        (() => {
          const list = applicantsFor(applicantsOf.id);
          const app = list[detailIndex];
          if (!app) return null;
          return (
            <ApplicationDetail
              app={app}
              pos={{ index: detailIndex, total: list.length }}
              onPrev={
                detailIndex > 0 ? () => setDetailIndex(detailIndex - 1) : undefined
              }
              onNext={
                detailIndex < list.length - 1
                  ? () => setDetailIndex(detailIndex + 1)
                  : undefined
              }
              onStatus={(s) => {
                if (app.status !== s) setPending({ app, status: s });
              }}
              onClose={() => setDetailIndex(null)}
            />
          );
        })()}

      <ConfirmDialog
        open={!!pending}
        danger={pending?.status === "rejected"}
        title="Holatni o'zgartirish"
        message={
          pending
            ? `“${pending.app.name}” arizasini “${STATUS_LABELS[pending.status]}” holatiga o'tkazasizmi?`
            : ""
        }
        confirmLabel="Ha, o'zgartirish"
        onConfirm={() => {
          if (pending) setAppStatus(pending.app, pending.status);
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          action={toast.action}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function ApplicantsSheet({
  vacancy,
  applicants,
  onClose,
  onPdf,
  onOpenDetail,
}: {
  vacancy: Vacancy;
  applicants: Application[];
  onClose: () => void;
  onPdf: () => void;
  onOpenDetail: (index: number) => void;
}) {
  return (
    <SheetShell onClose={onClose}>
      {(close) => (
        <>
          <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur px-5 py-4 border-b border-[var(--border)] flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-semibold text-content truncate">
                {vacancy.emoji} {vacancy.uz.title}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {applicants.length} ta ariza topshirgan
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onPdf}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-content hover:bg-cloud hover:border-brand-300 transition-colors"
              >
                <FileDown size={14} /> PDF
              </button>
              <button
                onClick={close}
                aria-label="Yopish"
                className="h-8 w-8 grid place-items-center rounded-full text-[var(--text-muted)] hover:bg-cloud"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-2.5">
            {applicants.length === 0 ? (
              <EmptyState
                icon={<Users size={24} />}
                title="Hali ariza yo'q"
                subtitle="Bu lavozimga hozircha hech kim topshirmagan."
              />
            ) : (
              applicants.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => onOpenDetail(i)}
                  className="w-full text-left flex items-center gap-3 rounded-2xl border border-[var(--border)] p-3.5 hover:border-brand-200 hover:shadow-sm active:scale-[0.99] transition"
                >
                  <div className="h-10 w-10 shrink-0 rounded-full bg-brand-500/12 grid place-items-center font-semibold text-brand-700 dark:text-brand-300">
                    {a.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-content truncate">
                      {a.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {a.telegramUser} · {formatDate(a.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                  <ChevronRight
                    size={18}
                    className="text-[var(--text-muted)] shrink-0"
                  />
                </button>
              ))
            )}
          </div>
        </>
      )}
    </SheetShell>
  );
}
