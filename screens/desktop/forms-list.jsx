/* ============================================================
   /forms — lista formularzy
   ============================================================ */
function FormsScreen() {
  const { nav } = useRouter();
  const toast = useToast();
  const [forms, setForms] = React.useState(window.DB.forms);

  const toggleActive = (id) => {
    const form = forms.find(x => x.id === id);
    window.DB.toggleForm(id);
    setForms(window.DB.forms);
    toast(form.active ? 'Formularz dezaktywowany' : 'Formularz aktywowany');
  };

  return (
    <>
      <Topbar
        title="Formularze"
        subtitle="Twórz i zarządzaj formularzami zbierającymi leady."
        right={<button className="btn btn-primary btn-sm" onClick={() => nav('/forms/new')}><Icon name="plus" size={16} /> Nowy formularz</button>}
      />
      <div style={{ padding: '0 40px 48px' }}>
        {forms.length === 0 ? (
          <div className="surface"><EmptyState icon="forms" title="Brak formularzy" text="Stwórz pierwszy formularz aby zacząć zbierać leady." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/forms/new')}><Icon name="plus" size={16} /> Nowy formularz</button>} /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {forms.map(f => {
              const assignee = window.DB.userById(f.assignTo);
              const partner = f.partner ? window.DB.userById(f.partner) : null;
              return (
                <div key={f.id} className="surface lift" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.active ? '#57E8A8' : 'rgba(255,255,255,0.3)', boxShadow: f.active ? '0 0 8px #57E8A8' : 'none' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: f.active ? '#57E8A8' : 'var(--color-text-muted)' }}>{f.active ? 'Aktywny' : 'Nieaktywny'}</span>
                    </div>
                    <Menu trigger={<button className="btn-icon" style={{ width: 32, height: 32 }}><Icon name="more" size={16} /></button>}
                      items={[
                        { icon: 'copy', label: 'Duplikuj', onClick: () => toast('Formularz zduplikowany') },
                        { divider: true },
                        { icon: 'trash', label: 'Usuń', danger: true, onClick: () => { window.DB.deleteForm(f.id); setForms(window.DB.forms); toast('Formularz usunięty'); } },
                      ]} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: 17, marginBottom: 6 }}>{f.name}</h3>
                    <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, minHeight: 38 }}>{f.desc}</p>
                  </div>

                  {/* url */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 50, padding: '5px 5px 5px 14px' }}>
                    <Icon name="link" size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    <span className="muted" style={{ fontSize: 12.5, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>automnia.pl/f/{f.slug}</span>
                    <CopyButton value={`https://automnia.pl/f/${f.slug}`} size={28} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22 }} className="tnum">{f.responses.toLocaleString('pl-PL')}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>odpowiedzi</div>
                    </div>
                    {partner && <span className="chip" style={{ height: 28, fontSize: 12 }}><Icon name="link" size={12} /> {partner.name.split(' ')[0]}</span>}
                    <Toggle checked={f.active} onChange={() => toggleActive(f.id)} />
                  </div>

                  <div className="divider" />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="muted" style={{ fontSize: 12 }}>Utworzono {f.created.split('-').reverse().join('.')}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" style={{ height: 32 }} onClick={() => nav('/f/' + f.slug)}><Icon name="eye" size={14} /> Podgląd</button>
                      <button className="btn btn-secondary btn-sm" style={{ height: 32 }} onClick={() => nav('/forms/' + f.id + '/edit')}><Icon name="edit" size={14} /> Edytuj</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

window.FormsScreenD = FormsScreen;
