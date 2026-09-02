import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './ui/Avatar';

type HeaderProps = {
  title: string;
  subtitle?: string;
  backTo?: { label: string; href: string };
  onMenuClick: () => void;
};

export function Header({ title, subtitle, backTo, onMenuClick }: HeaderProps) {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            {backTo && (
              <Link
                to={backTo.href}
                className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {backTo.label}
              </Link>
            )}
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
            {subtitle && <p className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Notifications"
            title="Notifications (coming soon)"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
          </button>

          <div className="hidden items-center gap-2.5 rounded-lg border border-slate-200/80 bg-slate-50/80 py-1.5 pl-1.5 pr-3 sm:flex">
            <Avatar name={profile?.full_name} src={profile?.avatar_url} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
