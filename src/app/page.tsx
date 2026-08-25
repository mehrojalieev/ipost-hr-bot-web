"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Application } from "@/lib/types";
import { StatusBadge, Spinner } from "@/components/ui";
import { relativeDay } from "@/lib/format";

interface Stats {
  totalVacancies: number;
  activeVacancies: number;
  totalApplications: number;
  newApplications: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ stats: Stats }>("/api/stats"),
      api.get<{ applications: Application[] }>("/api/applications"),
    ])
      .then(([s, a]) => {
        setStats(s.stats);
        setRecent(a.applications.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

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
          icon="💼"
          accent
        />
        <StatCard
          value={stats?.newApplications ?? 0}
          total={stats?.totalApplications ?? 0}
          label="Yangi ariza"
          icon="📥"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/vacancies"
          className="rounded-2xl bg-ink-900 text-white p-4 flex flex-col justify-between h-24 active:scale-[0.98] transition"
        >
          <span className="text-xl">➕</span>
          <span className="text-sm font-semibold">Vakansiya qo&apos;shish</span>
        </Link>
        <Link
          href="/applications"
          className="rounded-2xl bg-white border border-[var(--border)] p-4 flex flex-col justify-between h-24 active:scale-[0.98] transition"
        >
          <span className="text-xl">📋</span>
          <span className="text-sm font-semibold text-ink-900">
            Arizalarni ko&apos;rish
          </span>
        </Link>
      </div>

      {/* Recent applications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ink-900">So&apos;nggi arizalar</h2>
          <Link href="/applications" className="text-sm text-brand-600 font-medium">
            Barchasi →
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
              className="flex items-center gap-3 rounded-2xl bg-white border border-[var(--border)] p-3.5"
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
  icon: string;
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
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-[var(--text-muted)]">/ {total}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
