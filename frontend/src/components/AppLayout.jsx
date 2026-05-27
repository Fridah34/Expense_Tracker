import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const NAV = [
  { to: '/dashboard',  icon: 'ti-layout-dashboard', label: 'Dashboard'  },
  { to: '/expenses',   icon: 'ti-receipt',           label: 'Expenses'   },
  { to: '/categories', icon: 'ti-tag',               label: 'Categories' },
  { to: '/profile',    icon: 'ti-user-circle',       label: 'Profile'    },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F4FF', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: collapsed ? 64 : 220,
        minHeight: '100vh',
        background: '#1A1645',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
      }}>

        {/* Brand */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 16px' : '0 20px',
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg,#7F6FE8,#4F46E5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>E</div>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
                ExpenseTracker
              </span>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg,#7F6FE8,#4F46E5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>E</div>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', padding: 4, display: 'flex',
            }}>
              <i className="ti ti-layout-sidebar-left-collapse" style={{ fontSize: 16 }} />
            </button>
          )}
        </div>

        {/* Collapse expand button when collapsed */}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)', padding: '12px 0',
            display: 'flex', justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <i className="ti ti-layout-sidebar-left-expand" style={{ fontSize: 16 }} />
          </button>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10,
              textDecoration: 'none',
              transition: 'background 0.15s',
              background: isActive ? 'rgba(127,111,232,0.2)' : 'transparent',
              color: isActive ? '#A89FF5' : 'rgba(255,255,255,0.5)',
              fontWeight: isActive ? 600 : 400,
              fontSize: 13.5,
              position: 'relative',
            })}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 3, borderRadius: 2, background: '#7F6FE8',
                    }} />
                  )}
                  <i className={`ti ${icon}`} style={{ fontSize: 17, flexShrink: 0 }} />
                  {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: collapsed ? '12px 0' : '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#7F6FE8,#4F46E5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{initials}</div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} title="Logout" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.35)', display: 'flex', padding: 4,
            }}>
              <i className="ti ti-logout" style={{ fontSize: 16 }} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0, padding: '32px 36px', overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;