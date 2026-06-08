/* ============================================================
   App shell (MOBILE-FIRST)
   DeviceFrame · OverlayPortal · RouterProvider · TopBar · BottomNav · AppLayout
   ============================================================ */

/* ---------- Router ---------- */
const RouterCtx = React.createContext({ path: '/dashboard', nav: () => {} });
function useRouter() { return React.useContext(RouterCtx); }

/* ---------- App config (nav position / density) ---------- */
const AppCfgCtx = React.createContext({ navPos: 'bottom' });

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
    const sc = document.querySelector('.scroll');
    if (sc) sc.scrollTo(0, 0);
  }, []);
  return <RouterCtx.Provider value={{ path, nav }}>{children}</RouterCtx.Provider>;
}

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

/* ---------- Device frame + overlay portal ---------- */
const OverlayCtx = React.createContext(null);

function DeviceFrame({ children }) {
  const [ov, setOv] = React.useState(null);
  return (
    <div className="device-stage">
      <div className="device">
        <div className="device-screen">
          <div className="device-notch" />
          <OverlayCtx.Provider value={ov}>{children}</OverlayCtx.Provider>
          <div className="ov-root" ref={setOv} />
        </div>
      </div>
    </div>
  );
}

/* Portal overlays (sheets, toasts, menus) into the device, not the viewport. */
function OverlayPortal({ children }) {
  const ov = React.useContext(OverlayCtx);
  if (!ov) return null;
  return ReactDOM.createPortal(children, ov);
}

/* ---------- Top bar (sticky, per-screen) ---------- */
function TopBar({ title, onBack, brand, right, subtitle }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40, minHeight: 'var(--topbar-h)',
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px var(--screen-pad)',
      background: 'rgba(26,21,96,0.82)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      {onBack && (
        <button className="btn-icon" onClick={onBack} style={{ width: 40, height: 40, marginLeft: -4 }} aria-label="Wstecz">
          <Icon name="chevron-left" size={20} />
        </button>
      )}
      {brand && (
        <span style={{
          width: 36, height: 36, borderRadius: 11, background: 'var(--gradient)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(155,64,224,0.45)',
        }}><Icon name="sparkles" size={18} stroke={2.2} /></span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="trunc" style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{title}</div>
        {subtitle && <div className="muted trunc" style={{ fontSize: 12.5, marginTop: 1 }}>{subtitle}</div>}
      </div>
      {right && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{right}</div>}
    </header>
  );
}

/* page heading used under the top bar when a screen wants a big intro */
function PageIntro({ title, subtitle, children }) {
  return (
    <div style={{ padding: 'calc(var(--gap) + 4px) var(--screen-pad) 4px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1>{title}</h1>
          {subtitle && <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Bottom (or top) nav ---------- */
const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Pulpit' },
  { to: '/leads', icon: 'leads', label: 'Leady' },
  { to: '/forms', icon: 'forms', label: 'Formularze' },
  { key: 'more', icon: 'menu', label: 'Więcej' },
];

function NavBar({ pos, onMore }) {
  const { path, nav } = useRouter();
  const isActive = (to) => path === to
    || (to === '/leads' && path.startsWith('/leads'))
    || (to === '/forms' && path.startsWith('/forms'))
    || (to === '/dashboard' && path === '/dashboard');
  const moreActive = path.startsWith('/settings');

  return (
    <nav style={{
      flexShrink: 0, display: 'flex', alignItems: 'stretch',
      height: 'calc(var(--nav-h) + var(--safe-bottom))',
      paddingBottom: 'var(--safe-bottom)',
      background: 'rgba(20,16,74,0.92)', backdropFilter: 'blur(18px)',
      borderTop: pos === 'bottom' ? '1px solid var(--color-border)' : 'none',
      borderBottom: pos === 'top' ? '1px solid var(--color-border)' : 'none',
    }}>
      {NAV_ITEMS.map((it) => {
        const active = it.key === 'more' ? moreActive : isActive(it.to);
        return (
          <button key={it.to || it.key}
            onClick={() => it.key === 'more' ? onMore() : nav(it.to)}
            style={{
              flex: 1, border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              color: active ? '#fff' : 'var(--color-text-muted)', padding: '6px 2px',
            }}>
            <span style={{
              width: 46, height: 30, borderRadius: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? 'var(--gradient)' : 'transparent',
              boxShadow: active ? '0 4px 14px rgba(155,64,224,0.5)' : 'none',
              transition: 'background 0.18s ease',
            }}>
              <Icon name={it.icon} size={20} stroke={active ? 2.3 : 2} />
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 600, fontFamily: 'var(--font-head)', letterSpacing: '0.01em' }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------- "More" sheet (account / users / logout) ---------- */
function MoreSheet({ open, onClose, user }) {
  const { nav } = useRouter();
  const go = (to) => { onClose(); nav(to); };
  const Row = ({ icon, label, to, danger, sub }) => (
    <button onClick={() => go(to)} className="press" style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
      padding: '15px 16px', borderRadius: 16, border: '1px solid var(--color-border)',
      background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: danger ? '#FF8080' : '#fff',
    }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: danger ? 'rgba(255,77,77,0.15)' : 'var(--gradient-soft)', color: danger ? '#FF8080' : '#C77DFF' }}>
        <Icon name={icon} size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{label}</div>
        {sub && <div className="muted" style={{ fontSize: 12.5 }}>{sub}</div>}
      </div>
      <Icon name="chevron-right" size={16} style={{ color: 'var(--color-text-muted)' }} />
    </button>
  );
  return (
    <BottomSheet open={open} onClose={onClose} title="Więcej">
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '4px 4px 18px' }}>
        <Avatar user={user} size={48} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }} className="trunc">{user.name}</div>
          <div className="muted trunc" style={{ fontSize: 13 }}>{user.email}</div>
        </div>
        <span className="badge badge-admin" style={{ marginLeft: 'auto' }}>Admin</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
        <Row icon="shield" label="Użytkownicy" sub="Zespół i partnerzy" to="/settings/users" />
        <Row icon="settings" label="Ustawienia konta" sub="Profil i bezpieczeństwo" to="/settings/account" />
        <Row icon="logout" label="Wyloguj się" danger to="/login" />
      </div>
    </BottomSheet>
  );
}

/* ---------- App layout (authenticated) ---------- */
function AppLayout({ user, children }) {
  const { navPos } = React.useContext(AppCfgCtx);
  const [moreOpen, setMoreOpen] = React.useState(false);
  return (
    <>
      {navPos === 'top' && <NavBar pos="top" onMore={() => setMoreOpen(true)} />}
      <div className="scroll">{children}</div>
      {navPos !== 'top' && <NavBar pos="bottom" onMore={() => setMoreOpen(true)} />}
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} user={user} />
    </>
  );
}

Object.assign(window, {
  RouterProvider, useRouter, matchPath, AppCfgCtx,
  DeviceFrame, OverlayPortal, OverlayCtx,
  TopBar, PageIntro, NavBar, MoreSheet, AppLayout,
});
