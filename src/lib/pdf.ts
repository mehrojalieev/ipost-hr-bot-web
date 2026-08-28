import { Application, STATUS_LABELS, Vacancy, VacancyStat } from "./types";
import { formatDate } from "./format";

// Standart shrift Latin-1 — jingalak tirnoqlarni oddiysiga aylantiramiz
function s(text: string): string {
  return (text || "")
    .replace(/[‘’ʻʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-");
}

// jsPDF hujjatini saqlash — foydalanuvchi joyni tanlaydi (File System Access API) + fallback
async function savePdf(
  doc: import("jspdf").jsPDF,
  filename: string
): Promise<"saved" | "canceled"> {
  const blob = doc.output("blob");
  const picker = (
    window as unknown as {
      showSaveFilePicker?: (opts: unknown) => Promise<{
        createWritable: () => Promise<{
          write: (data: Blob) => Promise<void>;
          close: () => Promise<void>;
        }>;
      }>;
    }
  ).showSaveFilePicker;

  if (typeof picker === "function") {
    try {
      const handle = await picker({
        suggestedName: filename,
        types: [
          { description: "PDF hujjat", accept: { "application/pdf": [".pdf"] } },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return "saved";
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return "canceled";
    }
  }
  doc.save(filename);
  return "saved";
}

// ---------- Barcha vakansiyalar PDF ----------
export async function exportVacanciesPdf(
  vacancies: Vacancy[],
  breakdown?: VacancyStat[]
): Promise<"saved" | "canceled"> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const countFor = (id: string) =>
    breakdown?.find((b) => b.vacancyId === id)?.count ?? "-";

  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(31, 48, 214);
  doc.text("iPOST HR", 14, 20);
  doc.setFontSize(12);
  doc.setTextColor(11, 19, 56);
  doc.text("Vakansiyalar ro'yxati", 14, 28);
  doc.setFontSize(9);
  doc.setTextColor(90, 107, 136);
  doc.text(`Jami: ${vacancies.length} ta lavozim`, 14, 34);

  autoTable(doc, {
    startY: 40,
    head: [
      ["#", "Lavozim", "Bo'lim", "Bandlik", "Maosh", "Manzil", "Arizalar", "Holat"],
    ],
    body: vacancies.map((v, i) => [
      String(i + 1),
      s(v.title),
      s(v.department),
      s(v.employment),
      s(v.salary),
      s(v.location),
      String(countFor(v.id)),
      v.active ? "Faol" : "Nofaol",
    ]),
    styles: { fontSize: 8.5, cellPadding: 2.5, valign: "middle" },
    headStyles: { fillColor: [31, 48, 214], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    columnStyles: { 0: { cellWidth: 8 }, 6: { halign: "center" }, 7: { halign: "center" } },
  });

  return savePdf(doc, "ipost-vakansiyalar.pdf");
}

// ---------- Bitta vakansiya bo'yicha arizachilar (detail) PDF ----------
export async function exportVacancyApplicantsPdf(
  vacancy: Vacancy,
  applicants: Application[]
): Promise<"saved" | "canceled"> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();

  // Sarlavha
  doc.setFontSize(20);
  doc.setTextColor(31, 48, 214);
  doc.text("iPOST HR", 14, 20);
  doc.setFontSize(14);
  doc.setTextColor(11, 19, 56);
  doc.text(s(vacancy.title), 14, 29);
  doc.setFontSize(9);
  doc.setTextColor(90, 107, 136);
  doc.text(
    `${s(vacancy.department)} · ${s(vacancy.salary)} · ${s(vacancy.location)}`,
    14,
    35
  );

  // Holat bo'yicha xulosa
  const c = { new: 0, reviewing: 0, accepted: 0, rejected: 0 };
  applicants.forEach((a) => (c[a.status] += 1));
  doc.setFontSize(9);
  doc.setTextColor(11, 19, 56);
  doc.text(
    `Jami ${applicants.length} ta ariza   |   Yangi: ${c.new}   Ko'rilmoqda: ${c.reviewing}   Qabul: ${c.accepted}   Rad: ${c.rejected}`,
    14,
    42
  );

  if (applicants.length === 0) {
    doc.setTextColor(90, 107, 136);
    doc.text("Bu lavozimga hali ariza topshirilmagan.", 14, 52);
    return savePdf(doc, `ipost-${vacancy.id}-arizalar.pdf`);
  }

  // Arizachilar jadvali
  autoTable(doc, {
    startY: 48,
    head: [["#", "Ism-familiya", "Telefon", "Telegram", "Yosh", "Holat", "Rezyume", "Sana"]],
    body: applicants.map((a, i) => [
      String(i + 1),
      s(a.name),
      s(a.phone),
      s(a.telegramUser),
      s(a.age),
      STATUS_LABELS[a.status],
      a.hasResume ? "Bor" : "Yo'q",
      s(formatDate(a.createdAt)),
    ]),
    styles: { fontSize: 8, cellPadding: 2, valign: "middle" },
    headStyles: { fillColor: [31, 48, 214], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    columnStyles: { 0: { cellWidth: 7 }, 4: { halign: "center" }, 6: { halign: "center" } },
  });

  // Ish tajribalari (jadval ostida)
  let y =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 60;
  y += 10;
  doc.setFontSize(11);
  doc.setTextColor(11, 19, 56);
  doc.text("Ish tajribalari", 14, y);
  y += 6;
  doc.setFontSize(9);
  applicants.forEach((a, i) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(11, 19, 56);
    const lines = doc.splitTextToSize(
      `${i + 1}. ${s(a.name)}: ${s(a.experience) || "—"}`,
      180
    );
    doc.text(lines, 14, y);
    y += lines.length * 5 + 2;
  });

  return savePdf(doc, `ipost-${vacancy.id}-arizalar.pdf`);
}
