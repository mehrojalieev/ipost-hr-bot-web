import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/guard";
import { listApplications } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { deny } = guard(req);
  if (deny) return deny;
  return NextResponse.json({ applications: await listApplications() });
}
