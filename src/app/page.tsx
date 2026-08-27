"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Inbox,
  MessageSquare,
  CheckCircle2,
  Plus,
  ClipboardList,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { Application, VacancyStat } from "@/lib/types";
import { StatusBadge, Spinner } from "@/components/ui";
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

const TINT: Record<Tint, { tile: string; sub: string; bar: string }> = {
  brand: {
    tile: "bg-brand-500/12 text-brand-600",
    sub: "bg-brand-500/12 text-brand-700",
    bar: "bg-brand-500",
  },
  amber: {
    tile: "bg-amber-500/15 text-amber-600",
    sub: "bg-amber-500/15 text-amber-700",
    bar: "bg-amber-500",
  },
  emerald: {
    tile: "bg-emerald-500/12 text-emerald-600",
    sub: "bg-emerald-500/12 text-emerald-700",
    bar: "bg-emerald-500",
  },
  violet: {
    tile: "bg-violet-500/12 text-violet-600",
    sub: "bg-violet-500/12 text-violet-700",
    bar: "bg-violet-500",
  },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [byVacancy, setByVacancy] = useState<VacancyStat[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ stats: Stats; byVacancy: VacancyStat[] }>("/api/stats"),
      api.get<{ applications: Application[] }>("/api/applications"),
    ])
      .then(([s, a]) => {
        setStats(s.stats);
        setByVacancy(s.byVacancy);
        setApps(a.applications);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const accepted = apps.filter((a) => a.status === "accepted").length;
  const recent = apps.slice(0, 4);
  const maxCount = Math.max(1, ...byVacancy.map((v) => v.count));
  const totalByVac = byVacancy.reduce((s, v) => s + v.count, 0);

  return (
    <div className="space-y-7 animate-fade-up">
      {/* Salomlashish */}
      <div>
        <p className="text-sm text-[var(--text-muted)]">Xush kelibsiz 👋</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-content">
          Boshqaruv paneli
        </h1>
      </div>

      {/* Statistika — 2×2 */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          icon={<Briefcase size={18} />}
          tint="brand"
          value={stats?.activeVacancies ?? 0}
          sub={`${stats?.totalVacancies ?? 0} jami`}
          label="Faol vakansiya"
        />
        <StatCard
          icon={<Inbox size={18} />}
          tint="amber"
          value={stats?.totalApplications ?? 0}
          sub={
            (stats?.newApplications ?? 0) > 0
              ? `${stats?.newApplications} yangi`
              : undefined
          }
          label="Arizalar"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          tint="emerald"
          value={accepted}
          label="Qabul qilingan"
        />
        <StatCard
          icon={<MessageSquare size={18} />}
          tint="violet"
          value={stats?.totalMessages ?? 0}
          sub={
            (stats?.newMessages ?? 0) > 0
              ? `${stats?.newMessages} yangi`
              : undefined
          }
          label="Murojaatlar"
        />
      </div>

      {/* Tez amallar */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-2.5">
          Tez amallar
        </h2>
        <div className="space-y-2.5">
          <ActionRow
            href="/vacancies"
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
              <div className="h-10 w-10 shrink-0 rounded-full bg-brand-500/12 grid place-items-center font-semibold text-brand-700">
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
    </div>
  );
}

function StatCard({
  icon,
  tint,
  value,
  sub,
  label,
}: {
  icon: React.ReactNode;
  tint: Tint;
  value: number;
  sub?: string;
  label: string;
}) {
  const t = TINT[tint];
  return (
    <div className="rounded-2xl bg-surface border border-[var(--border)] p-3.5 hover:shadow-sm hover:-translate-y-0.5 transition">
      <div className="flex items-center justify-between gap-2">
        <span className={`grid place-items-center h-9 w-9 rounded-xl ${t.tile}`}>
          {icon}
        </span>
        {sub && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.sub}`}
          >
            {sub}
          </span>
        )}
      </div>
      <p className="mt-2.5 text-[26px] font-extrabold text-content leading-none">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function ActionRow({
  href,
  icon,
  title,
  subtitle,
  primary,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3.5 rounded-2xl p-3.5 active:scale-[0.99] transition ${
        primary
          ? "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20"
          : "bg-surface border border-[var(--border)] text-content hover:border-brand-300 hover:shadow-sm"
      }`}
    >
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
    </Link>
  );
}
