/* ============================================================
   App shell (RESPONSIVE)
   One shell that adapts to the viewport:
   · phones      → DeviceFrame screen, sticky TopBar, bottom nav, sheets
   · desktops    → sidebar + topbar, window scroll
   Router · useIsDesktop · OverlayPortal · TopBar · NavBar · Sidebar · AppLayout
   ============================================================ */

/* ---------- Router ---------- */
const RouterCtx = React.createContext({ path: '/dashboard', nav: () => {} });
function useRouter() { return React.useContext(RouterCtx); }

/* ---------- App config (nav position / density — mobile) ---------- */
const AppCfgCtx = React.createContext({ navPos: 'bottom' });

/* ---------- Responsive breakpoint ---------- */
function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = React.useState(get);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = e => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler); };
  }, [query]);
  return matches;
}
function useIsDesktop() { return useMediaQuery('(min-width: 1024px)'); }

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
    window.scrollTo(0, 0);
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

/* ---------- Responsive frame + overlay portal ---------- */
const OverlayCtx = React.createContext(null);

/* On phones this is a full-height flex column (sticky bar + scroll + nav).
   On desktops it is a plain block that lets the window scroll.
   Overlays (sheets, toasts, menus) portal into the .ov-root inside it. */
function DeviceFrame({ children }) {
  const isDesktop = useIsDesktop();
  const [ov, setOv] = React.useState(null);
  return (
    <div className={isDesktop ? 'desk-stage' : 'phone-stage'}>
      <OverlayCtx.Provider value={ov}>{children}</OverlayCtx.Provider>
      <div className={isDesktop ? 'ov-root ov-fixed' : 'ov-root'} ref={setOv} />
    </div>
  );
}

function OverlayPortal({ children }) {
  const ov = React.useContext(OverlayCtx);
  if (!ov) return null;
  return ReactDOM.createPortal(children, ov);
}

/* ============================================================
   MOBILE pieces — top bar, page intro, bottom nav, more sheet
   ============================================================ */

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

/* ============================================================
   DESKTOP pieces — sidebar, user chip, topbar
   ============================================================ */

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

/* ============================================================
   App layout (authenticated) — responsive
   ============================================================ */
function AppLayout({ user, children }) {
  const isDesktop = useIsDesktop();
  const { navPos } = React.useContext(AppCfgCtx);
  const [moreOpen, setMoreOpen] = React.useState(false);

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <Sidebar user={user} />
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>{children}</main>
      </div>
    );
  }

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
  useMediaQuery, useIsDesktop,
  DeviceFrame, OverlayPortal, OverlayCtx,
  TopBar, PageIntro, NavBar, MoreSheet,
  Sidebar, UserChip, Topbar, AppLayout,
});
