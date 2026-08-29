import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/guard";
import { deleteVacancy, getVacancy, updateVacancy } from "@/lib/store";
import { normalize, validate } from "@/lib/vacancy-validate";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { deny } = guard(req);
  if (deny) return deny;
  const { id } = await params;
  const vacancy = await getVacancy(id);
  if (!vacancy) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ vacancy });
}

export async function PUT(
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
  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const vacancy = await updateVacancy(id, normalize(body));
  if (!vacancy) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ vacancy });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { deny } = guard(req);
  if (deny) return deny;
  const { id } = await params;
  const ok = await deleteVacancy(id);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
