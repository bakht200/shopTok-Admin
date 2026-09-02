import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

type StatCardProps = {
  label: string;
  value: number | string;
  to?: string;
  icon: LucideIcon;
  accent: string;
};

export function StatCard({ label, value, to, icon: Icon, accent }: StatCardProps) {
  const body = (
    <div className={`card card-hover p-5 ${to ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{body}</Link>;
  }
  return body;
}
