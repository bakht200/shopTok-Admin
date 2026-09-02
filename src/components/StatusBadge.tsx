const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-800',
  packing: 'bg-amber-100 text-amber-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  offered: 'bg-sky-100 text-sky-800',
  accepted: 'bg-violet-100 text-violet-800',
  at_pickup: 'bg-orange-100 text-orange-800',
  picked_up: 'bg-teal-100 text-teal-800',
};

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${color}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
