"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Inbox,
  MessageSquare,
  CheckCircle2,
  Clock,
  Plus,
  ClipboardList,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { SHOW_MESSAGES } from "@/lib/features";
import { api } from "@/lib/api";
import { Application, VacancyInput, VacancyStat } from "@/lib/types";
import { StatusBadge, ListSkeleton, StatGridSkeleton, Toast } from "@/components/ui";
import VacancyForm from "@/components/VacancyForm";
import { relativeDay } from "@/lib/format";

interface Stats {
  totalVacancies: number;
  activeVacancies: number;
  totalApplications: number;
  newApplications: number;
  totalMessages: number;
  newMessages: number;
}

// "Vakansiya bo'yicha arizalar" bo'limini vaqtincha yashirish
const SHOW_BREAKDOWN = false;

type Tint = "brand" | "amber" | "emerald" | "violet";

const TINT: Record<Tint, { tile: string; accent: string }> = {
  brand: {
    tile: "bg-brand-500/12 text-brand-600 dark:text-brand-400",
    accent: "text-brand-600 dark:text-brand-400",
  },
  amber: {
    tile: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    accent: "text-amber-600 dark:text-amber-400",
  },
  emerald: {
    tile: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  violet: {
    tile: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
    accent: "text-violet-600 dark:text-violet-400",
  },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [byVacancy, setByVacancy] = useState<VacancyStat[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function refresh() {
    const [s, a] = await Promise.all([
      api.get<{ stats: Stats; byVacancy: VacancyStat[] }>("/api/stats"),
      api.get<{ applications: Application[] }>("/api/applications"),
    ]);
    setStats(s.stats);
    setByVacancy(s.byVacancy);
    setApps(a.applications);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function handleAddVacancy(data: VacancyInput) {
    setSaving(true);
    try {
      await api.post("/api/vacancies", data);
      setFormOpen(false);
      setToast("Vakansiya qo'shildi ✅");
      await refresh();
    } catch {
      setToast("Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="space-y-5 animate-fade-up">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Xush kelibsiz 👋</p>
          <h1 className="text-xl font-extrabold tracking-tight text-content">
            Boshqaruv paneli
          </h1>
        </div>
        <StatGridSkeleton />
        <ListSkeleton rows={3} />
      </div>
    );

  const accepted = apps.filter((a) => a.status === "accepted").length;
  const reviewing = apps.filter((a) => a.status === "reviewing").length;
  const recent = apps.slice(0, 4);
  const maxCount = Math.max(1, ...byVacancy.map((v) => v.count));
  const totalByVac = byVacancy.reduce((s, v) => s + v.count, 0);

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Salomlashish */}
      <div>
        <p className="text-xs text-[var(--text-muted)]">Xush kelibsiz 👋</p>
        <h1 className="text-xl font-extrabold tracking-tight text-content">
          Boshqaruv paneli
        </h1>
      </div>

      {/* Statistika — 2×2 */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          icon={<Briefcase size={18} />}
          tint="brand"
          value={stats?.activeVacancies ?? 0}
          label="Faol vakansiya"
        />
        <StatCard
          icon={<Inbox size={18} />}
          tint="amber"
          value={stats?.totalApplications ?? 0}
          label="Arizalar"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          tint="emerald"
          value={accepted}
          label="Qabul qilingan"
        />
        {SHOW_MESSAGES ? (
          <StatCard
            icon={<MessageSquare size={18} />}
            tint="violet"
            value={stats?.totalMessages ?? 0}
            label="Murojaatlar"
          />
        ) : (
          <StatCard
            icon={<Clock size={18} />}
            tint="violet"
            value={reviewing}
            label="Ko'rilmoqda"
          />
        )}
      </div>

      {/* Tez amallar */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-2.5">
          Tez amallar
        </h2>
        <div className="space-y-2.5">
          <ActionRow
            onClick={() => setFormOpen(true)}
            icon={<Plus size={20} />}
            title="Vakansiya qo'shish"
            subtitle="Yangi ish o'rni e'lon qiling"
            primary
          />
          <ActionRow
            href="/applications"
            icon={<ClipboardList size={20} />}
            title="Arizalarni ko'rish"
            subtitle="Nomzodlar arizalarini boshqaring"
          />
        </div>
      </div>

      {/* Vakansiya bo'yicha arizalar (hozircha yashirilgan) */}
      {SHOW_BREAKDOWN && totalByVac > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-content">
              Vakansiya bo&apos;yicha arizalar
            </h2>
            <span className="text-xs text-[var(--text-muted)]">
              {totalByVac} ta jami
            </span>
          </div>
          <div className="rounded-2xl bg-surface border border-[var(--border)] p-4 space-y-4">
            {byVacancy
              .filter((v) => v.count > 0)
              .map((v) => {
                const pct = Math.round((v.count / totalByVac) * 100);
                return (
                  <div key={v.vacancyId}>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="h-7 w-7 shrink-0 rounded-lg bg-cloud grid place-items-center text-sm">
                        {v.emoji}
                      </span>
                      <span className="flex-1 min-w-0 text-sm font-medium text-content truncate">
                        {v.title}
                      </span>
                      <span className="text-sm font-bold text-content">
                        {v.count}
                      </span>
                      <span className="w-9 text-right text-xs font-medium text-[var(--text-muted)]">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-cloud overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-700"
                        style={{ width: `${(v.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* So'nggi arizalar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-content">So&apos;nggi arizalar</h2>
          <Link
            href="/applications"
            className="inline-flex items-center gap-1 text-sm text-brand-600 font-medium hover:gap-1.5 transition-all"
          >
            Barchasi <ArrowRight size={15} />
          </Link>
        </div>
        <div className="space-y-2.5">
          {recent.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">
              Hozircha arizalar yo&apos;q.
            </p>
          )}
          {recent.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-2xl bg-surface border border-[var(--border)] p-3.5 hover:border-brand-200 hover:shadow-sm transition"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-brand-500/12 grid place-items-center font-semibold text-brand-700 dark:text-brand-300">
                {a.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-content truncate">
                  {a.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {a.vacancyTitle} · {relativeDay(a.createdAt)}
                </p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      </div>

      {formOpen && (
        <VacancyForm
          saving={saving}
          onSubmit={handleAddVacancy}
          onClose={() => setFormOpen(false)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function StatCard({
  icon,
  tint,
  value,
  label,
}: {
  icon: React.ReactNode;
  tint: Tint;
  value: number;
  label: string;
}) {
  const t = TINT[tint];
  return (
    <div className="group rounded-2xl bg-surface border border-[var(--border)] p-4 hover:shadow-md hover:border-brand-200 hover:-translate-y-0.5 transition">
      <span
        className={`grid place-items-center h-10 w-10 rounded-xl ${t.tile} transition-transform group-hover:scale-105`}
      >
        {icon}
      </span>
      <p className="mt-3 text-[26px] font-extrabold text-content leading-none tracking-tight">
        {value}
      </p>
      <p className="mt-1.5 text-[13px] font-medium text-[var(--text-muted)] leading-tight">
        {label}
      </p>
    </div>
  );
}

function ActionRow({
  href,
  onClick,
  icon,
  title,
  subtitle,
  primary,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  primary?: boolean;
}) {
  const className = `w-full text-left flex items-center gap-3.5 rounded-2xl p-3.5 active:scale-[0.99] transition ${
    primary
      ? "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20"
      : "bg-surface border border-[var(--border)] text-content hover:border-brand-300 hover:shadow-sm"
  }`;

  const inner = (
    <>
      <span
        className={`grid place-items-center h-11 w-11 shrink-0 rounded-xl ${
          primary ? "bg-white/15" : "bg-brand-500/12 text-brand-600"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span
          className={`block text-xs ${
            primary ? "text-white/70" : "text-[var(--text-muted)]"
          }`}
        >
          {subtitle}
        </span>
      </span>
      <ChevronRight
        size={18}
        className={primary ? "text-white/70" : "text-[var(--text-muted)]"}
      />
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={href || "#"} className={className}>
      {inner}
    </Link>
  );
}
