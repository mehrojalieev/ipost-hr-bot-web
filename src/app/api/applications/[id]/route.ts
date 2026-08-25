import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/guard";
import { updateApplicationStatus } from "@/lib/store";
import { Application } from "@/lib/types";

const VALID: Application["status"][] = [
  "new",
  "reviewing",
  "accepted",
  "rejected",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { deny } = guard(req);
  if (deny) return deny;
  const { id } = await params;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const status = body?.status as Application["status"];
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "bad_status" }, { status: 400 });
  }
  const app = updateApplicationStatus(id, status);
  if (!app) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ application: app });
}
