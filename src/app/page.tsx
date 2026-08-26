"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Inbox,
  Plus,
  ClipboardList,
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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [byVacancy, setByVacancy] = useState<VacancyStat[]>([]);
  const [recent, setRecent] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ stats: Stats; byVacancy: VacancyStat[] }>("/api/stats"),
      api.get<{ applications: Application[] }>("/api/applications"),
    ])
      .then(([s, a]) => {
        setStats(s.stats);
        setByVacancy(s.byVacancy);
        setRecent(a.applications.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  const maxCount = Math.max(1, ...byVacancy.map((v) => v.count));

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-sm text-[var(--text-muted)]">Xush kelibsiz 👋</p>
        <h1 className="text-xl font-bold text-ink-900">Boshqaruv paneli</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          value={stats?.activeVacancies ?? 0}
          total={stats?.totalVacancies ?? 0}
          label="Faol vakansiya"
          icon={<Briefcase size={18} />}
          accent
        />
        <StatCard
          value={stats?.newApplications ?? 0}
          total={stats?.totalApplications ?? 0}
          label="Yangi ariza"
          icon={<Inbox size={18} />}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/vacancies"
          className="rounded-2xl bg-ink-900 text-white p-4 flex flex-col justify-between h-24 hover:bg-ink-800 active:scale-[0.98] transition"
        >
          <Plus size={22} className="text-brand-300" />
          <span className="text-sm font-semibold">Vakansiya qo&apos;shish</span>
        </Link>
        <Link
          href="/applications"
          className="rounded-2xl bg-white border border-[var(--border)] p-4 flex flex-col justify-between h-24 hover:border-brand-300 hover:shadow-sm active:scale-[0.98] transition"
        >
          <ClipboardList size={22} className="text-brand-600" />
          <span className="text-sm font-semibold text-ink-900">
            Arizalarni ko&apos;rish
          </span>
        </Link>
      </div>

      {/* Vakansiya bo'yicha arizalar (kategoriya taqsimoti) */}
      {byVacancy.some((v) => v.count > 0) && (
        <div>
          <h2 className="font-semibold text-ink-900 mb-3">
            Vakansiya bo&apos;yicha arizalar
          </h2>
          <div className="rounded-2xl bg-white border border-[var(--border)] p-4 space-y-3.5">
            {byVacancy
              .filter((v) => v.count > 0)
              .map((v) => (
                <div key={v.vacancyId}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2 text-ink-800 min-w-0">
                      <span className="text-base shrink-0">{v.emoji}</span>
                      <span className="truncate">{v.title}</span>
                    </span>
                    <span className="font-semibold text-ink-900 shrink-0 ml-2">
                      {v.count} ta
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-cloud overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-500"
                      style={{ width: `${(v.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent applications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ink-900">So&apos;nggi arizalar</h2>
          <Link
            href="/applications"
            className="inline-flex items-center gap-1 text-sm text-brand-600 font-medium"
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
              className="flex items-center gap-3 rounded-2xl bg-white border border-[var(--border)] p-3.5 hover:border-brand-200 hover:shadow-sm transition"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-brand-500/12 grid place-items-center font-semibold text-brand-700">
                {a.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900 truncate">
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
  value,
  total,
  label,
  icon,
  accent,
}: {
  value: number;
  total: number;
  label: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        accent
          ? "bg-brand-500/10 border-brand-500/20"
          : "bg-white border-[var(--border)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`grid place-items-center h-9 w-9 rounded-xl ${
            accent ? "bg-brand-600 text-white" : "bg-cloud text-brand-600"
          }`}
        >
          {icon}
        </span>
        <span className="text-xs text-[var(--text-muted)]">/ {total}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
