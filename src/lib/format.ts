// Sana formatlash (o'zbekcha, qisqa)
const MONTHS = [
  "yan", "fev", "mar", "apr", "may", "iyn",
  "iyl", "avg", "sen", "okt", "noy", "dek",
];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day}-${month}, ${hh}:${mm}`;
}

export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays <= 0) return "Bugun";
  if (diffDays === 1) return "Kecha";
  if (diffDays < 7) return `${diffDays} kun oldin`;
  return formatDate(iso);
}
