/* ============================================================
   /forms — lista formularzy (mobile)
   ============================================================ */
function FormsScreen() {
  const { nav } = useRouter();
  const toast = useToast();
  const [forms, setForms] = React.useState(window.DB.forms);

  const toggleActive = (id) => {
    setForms(f => f.map(x => x.id === id ? { ...x, active: !x.active } : x));
    const form = forms.find(x => x.id === id);
    toast(form.active ? 'Formularz dezaktywowany' : 'Formularz aktywowany');
  };

  return (
    <>
      <TopBar title="Formularze" subtitle={`${forms.length} formularzy`} />

      <div style={{ padding: '12px var(--screen-pad) 28px' }}>
        {forms.length === 0 ? (
          <div className="surface"><EmptyState icon="forms" title="Brak formularzy" text="Stwórz pierwszy formularz, aby zacząć zbierać leady." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/forms/new')}><Icon name="plus" size={16} /> Nowy formularz</button>} /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {forms.map(f => {
              const partner = f.partner ? window.DB.userById(f.partner) : null;
              return (
                <div key={f.id} className="surface" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.active ? '#57E8A8' : 'rgba(255,255,255,0.3)', boxShadow: f.active ? '0 0 8px #57E8A8' : 'none', flexShrink: 0 }} />
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: f.active ? '#57E8A8' : 'var(--color-text-muted)' }}>{f.active ? 'Aktywny' : 'Nieaktywny'}</span>
                      </div>
                      <h3 style={{ fontSize: 17 }}>{f.name}</h3>
                      <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, marginTop: 4 }}>{f.desc}</p>
                    </div>
                    <Menu title={f.name} trigger={<button className="btn-icon" style={{ width: 38, height: 38 }}><Icon name="more" size={18} /></button>}
                      items={[
                        { icon: 'copy', label: 'Duplikuj', onClick: () => toast('Formularz zduplikowany') },
                        { icon: 'trash', label: 'Usuń', danger: true, onClick: () => { setForms(x => x.filter(y => y.id !== f.id)); toast('Formularz usunięty'); } },
                      ]} />
                  </div>

                  {/* url */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 50, padding: '5px 5px 5px 14px' }}>
                    <Icon name="link" size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    <span className="muted trunc" style={{ fontSize: 12.5, flex: 1 }}>leadbase.app/f/{f.slug}</span>
                    <CopyButton value={`https://leadbase.app/f/${f.slug}`} size={34} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                      <span className="tnum" style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22 }}>{f.responses.toLocaleString('pl-PL')}</span>
                      <span className="muted" style={{ fontSize: 12 }}>odpowiedzi</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {partner && <span className="chip" style={{ height: 28, fontSize: 11.5 }}><Icon name="link" size={12} /> {partner.name.split(' ')[0]}</span>}
                      <Toggle checked={f.active} onChange={() => toggleActive(f.id)} />
                    </div>
                  </div>

                  <div className="divider" />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => nav('/f/' + f.slug)}><Icon name="eye" size={15} /> Podgląd</button>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => nav('/forms/' + f.id + '/edit')}><Icon name="edit" size={15} /> Edytuj</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FAB icon="plus" label="Nowy formularz" onClick={() => nav('/forms/new')} />
    </>
  );
}

window.FormsScreen = FormsScreen;
