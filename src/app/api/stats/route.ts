import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/guard";
import { getStats, getVacancyBreakdown } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { deny } = guard(req);
  if (deny) return deny;
  const [stats, byVacancy] = await Promise.all([
    getStats(),
    getVacancyBreakdown(),
  ]);
  return NextResponse.json({ stats, byVacancy });
}
