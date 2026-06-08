/* ============================================================
   /f/:slug — publiczny formularz (mobile)
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
    if (Object.keys(errs).length === 0) setSubmitted(true);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -120, left: '10%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,64,160,0.4), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -140, right: '5%', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(64,96,224,0.35), transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', padding: '40px 20px 40px' }}>
        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 26 }}>
          <span style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(155,64,224,0.45)' }}><Icon name="sparkles" size={20} stroke={2.2} /></span>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 18 }}>LeadBase</span>
        </div>

        {submitted ? (
          <div className="surface modal-in" style={{ padding: '44px 26px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(54,179,126,0.2)', color: '#57E8A8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={34} stroke={2.4} /></span>
            <h1 style={{ fontSize: 25 }}>Dziękujemy!</h1>
            <p className="soft" style={{ fontSize: 15, lineHeight: 1.6 }}>Twoje zgłoszenie zostało wysłane. Skontaktujemy się z Tobą najszybciej jak to możliwe.</p>
          </div>
        ) : (
          <div className="surface" style={{ padding: '26px 22px' }}>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>{form.name}</h1>
            <p className="muted" style={{ fontSize: 14.5, marginBottom: 24, lineHeight: 1.55 }}>Zostaw dane — odezwiemy się w ciągu 24h.</p>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
              {schema.map(f => {
                if (f.type === 'section') return <h3 key={f.id} style={{ fontSize: 16, marginTop: 6, paddingBottom: 8, borderBottom: '1px solid var(--color-border)' }}>{f.label}</h3>;
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
              <button type="submit" className="btn btn-primary" style={{ height: 54, fontSize: 16, marginTop: 6 }}>
                Wyślij zgłoszenie <Icon name="send" size={17} />
              </button>
            </form>
          </div>
        )}
        <p className="muted" style={{ textAlign: 'center', fontSize: 12, marginTop: 20 }}>Chronione przez LeadBase · Twoje dane są bezpieczne</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 6 }}>
      {(field.options || []).map(o => (
        <label key={o} className="click" style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 15 }} onClick={() => onChange(o)}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', border: value === o ? '7px solid #9B40E0' : '2px solid var(--color-border-strong)', flexShrink: 0, transition: 'all 0.15s ease' }} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
  if (t === 'checkbox') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 6 }}>
      {(field.options || []).map(o => {
        const arr = Array.isArray(value) ? value : [];
        const on = arr.includes(o);
        return (
          <label key={o} className="click" style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 15 }}
            onClick={() => onChange(on ? arr.filter(x => x !== o) : [...arr, o])}>
            <span style={{ width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: on ? 'none' : '2px solid var(--color-border-strong)', background: on ? 'var(--gradient)' : 'transparent', flexShrink: 0 }}>{on && <Icon name="check" size={14} stroke={3} />}</span>
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

window.PublicFormScreen = PublicFormScreen;
