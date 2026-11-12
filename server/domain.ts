export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function ensure(condition: unknown, message: string, status = 400): asserts condition { if (!condition) throw new HttpError(status, message); }
export function averageWait(samples: { entered_at: Date | string; started_at: Date | string | null; reconstructed?: boolean }[]) {
  const valid = samples.filter(s => s.started_at && !s.reconstructed).map(s => (new Date(s.started_at!).getTime() - new Date(s.entered_at).getTime()) / 60000).filter(n => n >= 0);
  return { samples: valid.length, minutes: valid.length >= 3 ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : null };
}
export function csvCell(value: unknown) {
  let str = String(value ?? ''); if (/^[=+@\-\t\r]/.test(str)) str = `'${str}`;
  return `"${str.replaceAll('"', '""')}"`;
}
export function isMinor(birth: string, today: string) {
  const age = Number(today.slice(0,4)) - Number(birth.slice(0,4)) - (today.slice(5) < birth.slice(5) ? 1 : 0);
  return age < 18;
}
