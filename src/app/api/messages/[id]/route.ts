import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/guard";
import { updateMessageStatus } from "@/lib/store";
import { Message } from "@/lib/types";

const VALID: Message["status"][] = ["new", "answered"];

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
  const status = body?.status as Message["status"];
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "bad_status" }, { status: 400 });
  }
  const msg = updateMessageStatus(id, status);
  if (!msg) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ message: msg });
}
