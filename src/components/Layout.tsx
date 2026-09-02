import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export function Layout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <header className="border-b border-gray-200 bg-white px-8 py-5">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
