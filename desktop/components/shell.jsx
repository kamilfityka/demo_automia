/* ============================================================
   App shell — Sidebar, Topbar, routing context
   ============================================================ */

const RouterCtx = React.createContext({ path: '/dashboard', nav: () => {} });
function useRouter() { return React.useContext(RouterCtx); }

function parseHash() {
  let h = window.location.hash.replace(/^#/, '');
  if (!h) h = '/login';
  return h;
}

function RouterProvider({ children }) {
  const [path, setPath] = React.useState(parseHash());
  React.useEffect(() => {
    const h = () => setPath(parseHash());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  const nav = React.useCallback((to) => {
    window.location.hash = to;
    window.scrollTo(0, 0);
  }, []);
  return <RouterCtx.Provider value={{ path, nav }}>{children}</RouterCtx.Provider>;
}

/* match helpers */
function matchPath(pattern, path) {
  const pp = pattern.split('/').filter(Boolean);
  const ap = path.split('?')[0].split('/').filter(Boolean);
  if (pp.length !== ap.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(ap[i]);
    else if (pp[i] !== ap[i]) return null;
  }
  return params;
}

/* ---------- Sidebar ---------- */
const NAV_ADMIN = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/leads', icon: 'leads', label: 'Leady' },
  { to: '/forms', icon: 'forms', label: 'Formularze' },
  { section: 'Ustawienia' },
  { to: '/settings/users', icon: 'shield', label: 'Użytkownicy' },
  { to: '/settings/account', icon: 'settings', label: 'Konto' },
];

function Sidebar({ user }) {
  const { path, nav } = useRouter();
  const items = NAV_ADMIN;
  const isActive = (to) => path === to || (to !== '/dashboard' && path.startsWith(to)) || (to === '/leads' && path.startsWith('/leads'));

  return (
    <aside style={{
      width: 'var(--sidebar-w)', flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: 'var(--color-bg-surface)', borderRight: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column', padding: '24px 16px',
    }}>
      {/* logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 10px 24px' }}>
        <span style={{
          width: 38, height: 38, borderRadius: 12, background: 'var(--gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 6px 18px rgba(155,64,224,0.45)',
        }}><Icon name="sparkles" size={20} stroke={2.2} /></span>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>LeadBase</div>
          <div className="muted" style={{ fontSize: 11, fontWeight: 500 }}>by AutomiaCRM</div>
        </div>
      </div>

      {/* nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>
        {items.map((it, i) => it.section ? (
          <div key={i} className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '18px 14px 8px', opacity: 0.55 }}>{it.section}</div>
        ) : (
          <button key={i} onClick={() => nav(it.to)} className="nav-item" data-active={isActive(it.to)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 50,
            border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
            fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 14,
            background: isActive(it.to) ? 'var(--gradient)' : 'transparent',
            color: isActive(it.to) ? '#fff' : 'var(--color-text-muted)',
            boxShadow: isActive(it.to) ? '0 6px 18px rgba(155,64,224,0.4)' : 'none',
            transition: 'all 0.16s ease',
          }}>
            <Icon name={it.icon} size={18} stroke={isActive(it.to) ? 2.2 : 2} />
            {it.label}
          </button>
        ))}
      </nav>

      {/* upgrade / user */}
      <div style={{ marginTop: 12 }}>
        <div style={{
          background: 'var(--gradient)', borderRadius: 18, padding: 16, marginBottom: 14,
          boxShadow: '0 8px 24px rgba(155,64,224,0.35)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontFamily: 'var(--font-head)', fontSize: 14, marginBottom: 4 }}>
            <Icon name="rocket" size={16} /> 11 leadów w toku
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.4, marginBottom: 12 }}>Masz 3 leady bez odpowiedzi ponad 24h.</div>
          <button onClick={() => nav('/leads')} style={{
            width: '100%', height: 36, borderRadius: 50, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.95)', color: '#1A1560', fontWeight: 700,
            fontFamily: 'var(--font-head)', fontSize: 13,
          }}>Przejdź do leadów</button>
        </div>
        <UserChip user={user} />
      </div>
    </aside>
  );
}

function UserChip({ user }) {
  const { nav } = useRouter();
  return (
    <Menu
      align="left"
      trigger={
        <button style={{
          display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '8px 10px',
          borderRadius: 14, border: '1px solid var(--color-border)', cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', color: '#fff', textAlign: 'left',
        }}>
          <Avatar user={user} size={36} />
          <div style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div className="muted" style={{ fontSize: 11.5 }}>Administrator</div>
          </div>
          <Icon name="chevron-up" size={15} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      }
      items={[
        { icon: 'settings', label: 'Ustawienia konta', onClick: () => nav('/settings/account') },
        { icon: 'shield', label: 'Zarządzaj użytkownikami', onClick: () => nav('/settings/users') },
        { divider: true },
        { icon: 'logout', label: 'Wyloguj się', danger: true, onClick: () => nav('/login') },
      ]}
    />
  );
}

/* ---------- Topbar ---------- */
function Topbar({ title, subtitle, right, breadcrumb }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20,
      padding: '34px 40px 22px', flexWrap: 'wrap',
    }}>
      <div>
        {breadcrumb && <div className="muted" style={{ fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>{breadcrumb}</div>}
        <h1>{title}</h1>
        {subtitle && <p className="muted" style={{ marginTop: 8, fontSize: 14.5 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{right}</div>
    </header>
  );
}

/* ---------- App layout wrapper ---------- */
function AppLayout({ user, children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>{children}</main>
    </div>
  );
}

Object.assign(window, {
  RouterProvider, useRouter, matchPath, Sidebar, Topbar, AppLayout,
});
