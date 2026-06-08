/* ============================================================
   /login — Logowanie
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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)' }}>
      {/* left — form */}
      <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 44 }}>
            <img src="assets/Automnia.svg" alt="Automnia" style={{ height: 34, display: 'block' }} />
            <div className="muted" style={{ fontSize: 12, fontWeight: 500, marginTop: 8 }}>Panel resellera</div>
          </div>

          <h1 style={{ fontSize: 30, marginBottom: 10 }}>Witaj ponownie 👋</h1>
          <p className="muted" style={{ marginBottom: 32, fontSize: 15 }}>Zaloguj się, aby zarządzać leadami i formularzami.</p>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 18 }}>
              <label className="field-label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.pl" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">Hasło</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="Twoje hasło" style={{ paddingRight: 52 }} />
                <button type="button" onClick={() => setShow(s => !s)} style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: 'transparent', color: 'var(--color-input-text)', opacity: 0.6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Icon name={show ? 'eye-off' : 'eye'} size={18} /></button>
              </div>
            </div>

            {err && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 9, color: '#FF8080', fontSize: 13.5,
                background: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.3)',
                borderRadius: 12, padding: '11px 14px', marginBottom: 14,
              }}><Icon name="x" size={15} /> {err}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22 }}>
              <button type="button" onClick={() => setResetOpen(true)} className="muted click" style={{ background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Zapomniałem hasła</button>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', height: 50, fontSize: 15 }}>
              {loading ? <span className="spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> : <>Zaloguj się <Icon name="chevron-right" size={17} /></>}
            </button>
          </form>

          <p className="muted" style={{ fontSize: 12.5, marginTop: 28, textAlign: 'center' }}>
            Demo — kliknij „Zaloguj się", aby wejść do panelu administratora.
          </p>
        </div>
      </div>

      {/* right — full-bleed photo with overlaid copy */}
      <div style={{ flex: '1 1 50%', position: 'relative', overflow: 'hidden', padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'var(--gradient)' }}>
        <img src="assets/automaty.png" alt="Automaty samoobsługowe Automnia" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* scrim for legibility of the overlaid text */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,8,40,0.92) 0%, rgba(10,8,40,0.55) 34%, rgba(10,8,40,0.08) 68%)' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            {['Nowy', 'W toku', 'Wygrany'].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 50, padding: '7px 16px', fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)' }}>{s}</div>
            ))}
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.12, maxWidth: 460, marginBottom: 16 }}>Zgłoszenia o automaty samoobsługowe w jednym miejscu.</h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, maxWidth: 440, opacity: 0.92 }}>Formularz zgłoszeniowy, przypisania do zespołu i pełna historia każdego zapytania — wszystko w panelu Automnia.</p>
        </div>
      </div>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Resetuj hasło" width={420}
        footer={<>
          <button className="btn btn-ghost btn-sm" onClick={() => setResetOpen(false)}>Anuluj</button>
          <button className="btn btn-primary btn-sm" onClick={() => setResetOpen(false)}>Wyślij link</button>
        </>}>
        <p className="muted" style={{ marginBottom: 18, fontSize: 14 }}>Podaj adres email — wyślemy link do ustawienia nowego hasła.</p>
        <label className="field-label">Email</label>
        <input className="input" type="email" placeholder="twoj@email.pl" defaultValue="" />
      </Modal>
    </div>
  );
}

window.LoginScreenD = LoginScreen;
