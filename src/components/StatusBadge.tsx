const STATUS_COLORS: Record<string, { bg: string; dot: string; text: string }> = {
  placed: { bg: 'bg-blue-50 ring-blue-200/60', dot: 'bg-blue-500', text: 'text-blue-700' },
  packing: { bg: 'bg-amber-50 ring-amber-200/60', dot: 'bg-amber-500', text: 'text-amber-700' },
  shipped: { bg: 'bg-indigo-50 ring-indigo-200/60', dot: 'bg-indigo-500', text: 'text-indigo-700' },
  delivered: { bg: 'bg-emerald-50 ring-emerald-200/60', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  cancelled: { bg: 'bg-red-50 ring-red-200/60', dot: 'bg-red-500', text: 'text-red-700' },
  offered: { bg: 'bg-sky-50 ring-sky-200/60', dot: 'bg-sky-500', text: 'text-sky-700' },
  accepted: { bg: 'bg-violet-50 ring-violet-200/60', dot: 'bg-violet-500', text: 'text-violet-700' },
  at_pickup: { bg: 'bg-orange-50 ring-orange-200/60', dot: 'bg-orange-500', text: 'text-orange-700' },
  picked_up: { bg: 'bg-teal-50 ring-teal-200/60', dot: 'bg-teal-500', text: 'text-teal-700' },
};

const DEFAULT_COLORS = { bg: 'bg-slate-100 ring-slate-200/60', dot: 'bg-slate-400', text: 'text-slate-700' };

export function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] ?? DEFAULT_COLORS;
  const label = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${colors.bg} ${colors.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} aria-hidden />
      {label}
    </span>
  );
}
