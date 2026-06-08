/* ============================================================
   /f/:slug — publiczny formularz (bez logowania)
   ============================================================ */
function PublicFormScreen({ slug }) {
  const form = window.DB.forms.find(f => f.slug === slug) || window.DB.forms[0];
  const schema = window.DB.builderSchema;
  const [submitted, setSubmitted] = React.useState(false);
  const [values, setValues] = React.useState({});
  const [errors, setErrors] = React.useState({});

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    schema.forEach(f => {
      if (f.required && f.type !== 'section' && !values[f.id]) errs[f.id] = 'To pole jest wymagane';
      if (f.type === 'email' && values[f.id] && !values[f.id].includes('@')) errs[f.id] = 'Nieprawidłowy email';
    });
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      const pick = (needle) => { const f = schema.find(x => x.type !== 'section' && x.label.toLowerCase().includes(needle)); return f ? (values[f.id] || '') : ''; };
      const answers = schema.filter(f => f.type !== 'section').map(f => ({
        label: f.label, value: Array.isArray(values[f.id]) ? values[f.id].join(', ') : (values[f.id] || ''),
      }));
      window.DB.addLead({
        name: pick('imię') || 'Zgłoszenie z formularza',
        email: pick('email'),
        phone: pick('telefon'),
        company: pick('firma'),
        formId: form.id,
        assignedTo: form.assignTo,
        answers,
      });
      setSubmitted(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', position: 'relative', overflow: 'hidden' }}>
      {/* ambient gradient blobs */}
      <div style={{ position: 'absolute', top: -160, left: '20%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,64,160,0.4), transparent 70%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: -200, right: '15%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(64,96,224,0.35), transparent 70%)', filter: 'blur(50px)' }} />

      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 64px' }}>
        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 40 }}>
          <span style={{ width: 40, height: 40, borderRadius: 13, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(155,64,224,0.45)' }}><Icon name="sparkles" size={21} stroke={2.2} /></span>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 19 }}>LeadBase</span>
        </div>

        <div style={{ width: '100%', maxWidth: 640 }}>
          {submitted ? (
            <div className="surface modal-in" style={{ padding: '56px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(54,179,126,0.2)', color: '#57E8A8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={36} stroke={2.4} /></span>
              <h1 style={{ fontSize: 28 }}>Dziękujemy!</h1>
              <p className="soft" style={{ fontSize: 15.5, maxWidth: 420, lineHeight: 1.6 }}>Twoje zgłoszenie zostało wysłane. Skontaktujemy się z Tobą najszybciej jak to możliwe. Potwierdzenie wysłaliśmy na podany adres email.</p>
              <button className="btn btn-secondary btn-sm" disabled style={{ marginTop: 8, opacity: 0.6 }}>Formularz został już wysłany</button>
            </div>
          ) : (
            <div className="surface" style={{ padding: '40px 44px' }}>
              <h1 style={{ fontSize: 30, marginBottom: 10 }}>{form.name}</h1>
              <p className="muted" style={{ fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>Zostaw dane — odezwiemy się w ciągu 24h.</p>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* honeypot */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
                {schema.map(f => {
                  if (f.type === 'section') return <h3 key={f.id} style={{ fontSize: 16, marginTop: 8, paddingBottom: 8, borderBottom: '1px solid var(--color-border)' }}>{f.label}</h3>;
                  return (
                    <div key={f.id}>
                      <label className="field-label" style={{ color: 'rgba(255,255,255,0.85)' }}>{f.label} {f.required && <span style={{ color: '#FF8080' }}>*</span>}</label>
                      <PublicField field={f} value={values[f.id]} error={errors[f.id]}
                        onChange={v => { setValues(s => ({ ...s, [f.id]: v })); setErrors(e => ({ ...e, [f.id]: undefined })); }} />
                      {errors[f.id] && <div className="field-error"><Icon name="x" size={12} style={{ verticalAlign: -1 }} /> {errors[f.id]}</div>}
                      {f.help && !errors[f.id] && <div className="field-help">{f.help}</div>}
                    </div>
                  );
                })}
                <button type="submit" className="btn btn-primary" style={{ height: 52, fontSize: 15.5, marginTop: 8 }}>
                  Wyślij zgłoszenie <Icon name="send" size={17} />
                </button>
              </form>
            </div>
          )}
          <p className="muted" style={{ textAlign: 'center', fontSize: 12.5, marginTop: 24 }}>Chronione przez LeadBase · Twoje dane są bezpieczne</p>
        </div>
      </div>
    </div>
  );
}

function PublicField({ field, value, error, onChange }) {
  const cls = 'input' + (error ? ' input-error' : '');
  const t = field.type;
  if (t === 'textarea') return <textarea className={'textarea' + (error ? ' input-error' : '')} placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />;
  if (t === 'select') return (
    <select className={'select-native' + (error ? ' input-error' : '')} value={value || ''} onChange={e => onChange(e.target.value)}>
      <option value="">Wybierz…</option>
      {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  if (t === 'radio') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
      {(field.options || []).map(o => (
        <label key={o} className="click" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5 }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', border: value === o ? '6px solid #9B40E0' : '2px solid var(--color-border-strong)', flexShrink: 0, transition: 'all 0.15s ease' }} onClick={() => onChange(o)} />
          <span onClick={() => onChange(o)}>{o}</span>
        </label>
      ))}
    </div>
  );
  if (t === 'checkbox') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
      {(field.options || []).map(o => {
        const arr = Array.isArray(value) ? value : [];
        const on = arr.includes(o);
        return (
          <label key={o} className="click" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5 }}
            onClick={() => onChange(on ? arr.filter(x => x !== o) : [...arr, o])}>
            <span style={{ width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: on ? 'none' : '2px solid var(--color-border-strong)', background: on ? 'var(--gradient)' : 'transparent', flexShrink: 0 }}>{on && <Icon name="check" size={13} stroke={3} />}</span>
            {o}
          </label>
        );
      })}
    </div>
  );
  if (t === 'file') return (
    <label className={cls} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: 'var(--color-input-placeholder)' }}>
      <Icon name="paperclip" size={16} /> {value || 'Wybierz plik (max 10MB)'}
      <input type="file" style={{ display: 'none' }} onChange={e => onChange(e.target.files[0] ? e.target.files[0].name : '')} />
    </label>
  );
  if (t === 'date') return <input type="text" className={cls} placeholder="DD.MM.RRRR" value={value || ''} onChange={e => onChange(e.target.value)} onFocus={e => e.target.type = 'date'} />;
  return <input type={t === 'email' ? 'email' : t === 'phone' ? 'tel' : 'text'} className={cls} placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />;
}

window.PublicFormScreenD = PublicFormScreen;
