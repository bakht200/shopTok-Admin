import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/users', label: 'Users' },
  { to: '/admins', label: 'Admins' },
  { to: '/orders', label: 'Orders' },
  { to: '/deliveries', label: 'Deliveries' },
  { to: '/content', label: 'Content' },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <p className="text-lg font-bold text-primary">ShopTok Admin</p>
        <p className="mt-1 truncate text-xs text-gray-500">{profile?.full_name || 'Admin'}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button
          type="button"
          onClick={() => signOut()}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
