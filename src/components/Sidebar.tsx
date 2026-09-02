import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  ShoppingBag,
  Truck,
  FileImage,
  LogOut,
  Store,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/admins', label: 'Admins', icon: Shield },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/deliveries', label: 'Deliveries', icon: Truck },
  { to: '/content', label: 'Content', icon: FileImage },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-slate-200">
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-white">ShopTok</p>
            <p className="text-xs text-slate-400">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-white shadow-sm shadow-primary/30'
                  : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 truncate px-1 text-xs text-slate-400">
          Signed in as <span className="font-medium text-slate-200">{profile?.full_name || 'Admin'}</span>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-sidebar-hover"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
