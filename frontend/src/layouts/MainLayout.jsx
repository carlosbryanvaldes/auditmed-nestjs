import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/',              label: 'Dashboard',     icon: '📊', perm: null },
  { to: '/audits',        label: 'Auditorías',    icon: '📋', perm: 'audits:read' },
  { to: '/forms',         label: 'Formularios',   icon: '📝', perm: 'forms:read' },
  { to: '/bitacora',      label: 'Bitácora',      icon: '🗒️', perm: 'bitacora:read' },
  { to: '/admin/users',   label: 'Usuarios',      icon: '👤', perm: 'users:read' },
  { to: '/admin/roles',   label: 'Roles',         icon: '🔐', perm: 'roles:read' },
  { to: '/admin/master',  label: 'Datos maestros',icon: '🗂️', perm: 'master:read' },
];

function NavLink({ to, label, icon }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? 'bg-brand-500 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function MainLayout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNav = NAV.filter((n) => !n.perm || can(n.perm));

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-gray-200">
          <span className="text-xl font-bold text-brand-600">🏥 AuditMed</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {visibleNav.map((n) => (
            <NavLink key={n.to} {...n} />
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold">
              {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">{user?.fullName}</div>
              <div className="text-[10px] text-gray-400 truncate">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn btn-ghost btn-sm justify-start text-red-500 hover:bg-red-50 border-0"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Backdrop (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 lg:px-6">
          <button
            className="btn-icon lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >☰</button>
          <div className="flex-1" />
          <span className="text-xs text-gray-400 hidden sm:block">{user?.email}</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
