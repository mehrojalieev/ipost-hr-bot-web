import { Vacancy, VacancyStat } from "./types";

// Standart shrift Latin-1 — jingalak tirnoqlarni oddiysiga aylantiramiz
function s(text: string): string {
  return (text || "")
    .replace(/[‘’ʻʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-");
}

// jsPDF faqat bosilganda yuklanadi (route bundle'ini yengil saqlaydi)
export async function exportVacanciesPdf(
  vacancies: Vacancy[],
  breakdown?: VacancyStat[]
) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const countFor = (id: string) =>
    breakdown?.find((b) => b.vacancyId === id)?.count ?? "-";

  // Sarlavha
  doc.setFontSize(20);
  doc.setTextColor(31, 60, 230);
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
    headStyles: { fillColor: [31, 60, 230], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    columnStyles: {
      0: { cellWidth: 8 },
      6: { halign: "center" },
      7: { halign: "center" },
    },
  });

  doc.save("ipost-vakansiyalar.pdf");
}
