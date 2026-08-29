import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/guard";
import { createVacancy, listVacancies } from "@/lib/store";
import { VacancyInput } from "@/lib/types";
import { normalize, validate } from "@/lib/vacancy-validate";

export async function GET(req: NextRequest) {
  const { deny } = guard(req);
  if (deny) return deny;
  return NextResponse.json({ vacancies: await listVacancies() });
}

export async function POST(req: NextRequest) {
  const { deny } = guard(req);
  if (deny) return deny;

  let body: Partial<VacancyInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const vacancy = await createVacancy(normalize(body));
  return NextResponse.json({ vacancy }, { status: 201 });
}
