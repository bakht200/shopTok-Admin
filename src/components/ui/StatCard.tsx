import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type StatCardProps = {
  label: string;
  value: number | string;
  to?: string;
  icon: LucideIcon;
  accent: string;
  description?: string;
};

export function StatCard({ label, value, to, icon: Icon, accent, description }: StatCardProps) {
  const body = (
    <div className={`card card-hover group relative overflow-hidden p-5 ${to ? 'cursor-pointer' : ''}`}>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-slate-100/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
        </div>
        <div className={`rounded-xl p-3 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {to && (
        <div className="relative mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View details
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{body}</Link>;
  }
  return body;
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-8 w-16" />
        </div>
        <div className="skeleton h-11 w-11 rounded-xl" />
      </div>
    </div>
  );
}
