/* ============================================================
   App root — routing, tweaks, device mount
   ============================================================ */

const GRADIENTS = {
  signature: { stops: ['#E040A0', '#9B40E0', '#4060E0'], label: 'Sygnaturowy' },
  sunset:    { stops: ['#FF6B6B', '#E0509A', '#9B40E0'], label: 'Zachód' },
  aurora:    { stops: ['#E040A0', '#7C4DE0', '#40C0E0'], label: 'Zorza' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headFont": "sora",
  "accent": ["#E040A0", "#9B40E0", "#4060E0"],
  "intensity": "vivid",
  "corners": "pill",
  "navPos": "bottom",
  "density": "regular"
}/*EDITMODE-END*/;

function applyTweaks(t) {
  const root = document.documentElement;
  root.setAttribute('data-head', t.headFont === 'space' ? 'space' : 'sora');
  root.setAttribute('data-density', t.density || 'regular');

  const [a, b, c] = t.accent;
  const ease = t.intensity === 'soft';
  const mix = (hex, amt) => window.shade(hex, amt);
  const s = ease ? mix(a, -18) : a, m = ease ? mix(b, -14) : b, e = ease ? mix(c, -10) : c;
  root.style.setProperty('--color-gradient-start', s);
  root.style.setProperty('--color-gradient-mid', m);
  root.style.setProperty('--color-gradient-end', e);
  root.style.setProperty('--gradient', `linear-gradient(100deg, ${s} 0%, ${m} 50%, ${e} 100%)`);
  const o = ease ? 0.1 : 0.16;
  root.style.setProperty('--gradient-soft', `linear-gradient(100deg, ${hexA(s, o)} 0%, ${hexA(m, o)} 50%, ${hexA(e, o)} 100%)`);

  root.style.setProperty('--radius-pill', t.corners === 'rounded' ? '16px' : '50px');
}
function hexA(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, x => x + x) : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function Router({ user }) {
  const { path } = useRouter();

  // public / auth — full-bleed, no nav
  if (path === '/login' || path.startsWith('/login')) return <LoginScreen />;
  const pub = matchPath('/f/:slug', path);
  if (pub) return <PublicFormScreen slug={pub.slug} />;

  // authenticated — within shell
  let screen;
  const leadDetail = matchPath('/leads/:id', path.split('?')[0]);
  const formEdit = matchPath('/forms/:id/edit', path.split('?')[0]);

  if (path === '/dashboard') screen = <DashboardScreen user={user} />;
  else if (path === '/forms/new') screen = <FormBuilderScreen />;
  else if (formEdit) screen = <FormBuilderScreen id={formEdit.id} />;
  else if (path.startsWith('/forms')) screen = <FormsScreen />;
  else if (leadDetail && leadDetail.id !== 'new') screen = <LeadDetailScreen id={leadDetail.id} />;
  else if (path.startsWith('/leads')) screen = <LeadsScreen user={user} />;
  else if (path === '/settings/users') screen = <UsersScreen />;
  else if (path === '/settings/account') screen = <AccountScreen user={user} />;
  else screen = <DashboardScreen user={user} />;

  return <AppLayout user={user}>{screen}</AppLayout>;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const user = window.DB.userById('u1');
  React.useEffect(() => { applyTweaks(t); }, [t]);

  const accentOptions = Object.values(GRADIENTS).map(g => g.stops);

  return (
    <DeviceFrame>
      <AppCfgCtx.Provider value={{ navPos: t.navPos }}>
        <RouterProvider>
          <ToastProvider>
            <Router user={user} />
          </ToastProvider>
        </RouterProvider>
      </AppCfgCtx.Provider>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Układ" />
        <TweakRadio label="Pozycja nawigacji" value={t.navPos}
          options={[{ value: 'bottom', label: 'Dół' }, { value: 'top', label: 'Góra' }]}
          onChange={v => setTweak('navPos', v)} />
        <TweakRadio label="Gęstość" value={t.density}
          options={[{ value: 'compact', label: 'Kompakt' }, { value: 'regular', label: 'Norma' }, { value: 'comfy', label: 'Luźno' }]}
          onChange={v => setTweak('density', v)} />
        <TweakSection label="Typografia" />
        <TweakRadio label="Font nagłówków" value={t.headFont}
          options={[{ value: 'sora', label: 'Sora' }, { value: 'space', label: 'Space Grotesk' }]}
          onChange={v => setTweak('headFont', v)} />
        <TweakSection label="Akcent" />
        <TweakColor label="Gradient" value={t.accent} options={accentOptions}
          onChange={v => setTweak('accent', v)} />
        <TweakRadio label="Intensywność" value={t.intensity}
          options={[{ value: 'vivid', label: 'Żywy' }, { value: 'soft', label: 'Stonowany' }]}
          onChange={v => setTweak('intensity', v)} />
        <TweakSection label="Kształt" />
        <TweakRadio label="Narożniki" value={t.corners}
          options={[{ value: 'pill', label: 'Pigułka' }, { value: 'rounded', label: 'Zaokrąglone' }]}
          onChange={v => setTweak('corners', v)} />
      </TweaksPanel>
    </DeviceFrame>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
