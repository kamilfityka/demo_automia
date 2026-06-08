/* ============================================================
   /login — Logowanie (mobile)
   ============================================================ */
function LoginScreen() {
  const { nav } = useRouter();
  const [email, setEmail] = React.useState('jan.kowalski@automnia.pl');
  const [pass, setPass] = React.useState('••••••••');
  const [show, setShow] = React.useState(false);
  const [err, setErr] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    if (!email.includes('@') || pass.length < 3) { setErr('Nieprawidłowy email lub hasło.'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); nav('/dashboard'); }, 850);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* gradient hero */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '54px 24px 30px', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient)', opacity: 0.95 }} />
        <div style={{ position: 'absolute', top: -90, right: -50, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', filter: 'blur(36px)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 26 }}>
            <span style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}><Icon name="sparkles" size={21} stroke={2.2} /></span>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 19 }}>Automnia</div>
              <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.85 }}>Panel zgłoszeń</div>
            </div>
          </div>
          <h1 style={{ fontSize: 26, lineHeight: 1.18, maxWidth: 320 }}>Zgłoszenia o automaty samoobsługowe w jednym miejscu.</h1>
          <p style={{ fontSize: 14.5, lineHeight: 1.55, marginTop: 12, opacity: 0.92, maxWidth: 320 }}>Formularz zgłoszeniowy, statusy i pełna historia każdego zapytania — w Twojej kieszeni.</p>
        </div>
      </div>

      {/* form */}
      <div style={{ padding: '28px 22px 36px', flex: 1 }}>
        <h2 style={{ fontSize: 22, marginBottom: 6 }}>Witaj ponownie 👋</h2>
        <p className="muted" style={{ marginBottom: 24, fontSize: 14.5 }}>Zaloguj się, aby zarządzać leadami.</p>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.pl" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="field-label">Hasło</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="Twoje hasło" style={{ paddingRight: 54 }} />
              <button type="button" onClick={() => setShow(s => !s)} style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'transparent', color: 'var(--color-input-text)', opacity: 0.6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon name={show ? 'eye-off' : 'eye'} size={19} /></button>
            </div>
          </div>

          {err && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9, color: '#FF8080', fontSize: 13.5,
              background: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.3)',
              borderRadius: 12, padding: '11px 14px', marginBottom: 14,
            }}><Icon name="x" size={15} /> {err}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button type="button" onClick={() => setResetOpen(true)} className="muted click" style={{ background: 'none', border: 'none', fontSize: 13.5, cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 4 }}>Zapomniałem hasła</button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', height: 54, fontSize: 16 }}>
            {loading ? <span className="spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> : <>Zaloguj się <Icon name="chevron-right" size={18} /></>}
          </button>
        </form>

        <p className="muted" style={{ fontSize: 12.5, marginTop: 24, textAlign: 'center' }}>
          Demo — kliknij „Zaloguj się", aby wejść do panelu.
        </p>
      </div>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Resetuj hasło"
        footer={<>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setResetOpen(false)}>Anuluj</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setResetOpen(false)}>Wyślij link</button>
        </>}>
        <p className="muted" style={{ marginBottom: 18, fontSize: 14 }}>Podaj adres email — wyślemy link do ustawienia nowego hasła.</p>
        <label className="field-label">Email</label>
        <input className="input" type="email" placeholder="twoj@email.pl" defaultValue="" />
      </Modal>
    </div>
  );
}

window.LoginScreenM = LoginScreen;
