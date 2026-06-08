/* ============================================================
   /settings/users  +  /settings/account
   ============================================================ */
function UsersScreen() {
  const toast = useToast();
  const [users, setUsers] = React.useState(window.DB.users);
  const [addOpen, setAddOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', role: 'partner' });
  React.useEffect(() => { if (addOpen) setForm({ name: '', email: '', role: 'partner' }); }, [addOpen]);
  const up = (k) => (e) => setForm(s => ({ ...s, [k]: e.target.value }));

  const toggleStatus = (id) => {
    const u = window.DB.userById(id);
    window.DB.updateUser(id, { status: u.status === 'aktywny' ? 'nieaktywny' : 'aktywny' });
    setUsers(window.DB.users);
  };
  const createUser = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    window.DB.addUser({ name: form.name.trim(), email: form.email.trim(), role: form.role });
    setUsers(window.DB.users);
    setAddOpen(false);
    toast(form.role === 'partner' ? 'Reseller dodany' : 'Użytkownik dodany');
  };

  return (
    <>
      <Topbar
        breadcrumb={<span className="muted">Ustawienia</span>}
        title="Użytkownicy"
        subtitle="Zarządzaj dostępem zespołu i partnerów."
        right={<button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}><Icon name="plus" size={16} /> Dodaj użytkownika</button>}
      />
      <div style={{ padding: '0 40px 48px' }}>
        <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.6fr 130px 120px 150px 50px', alignItems: 'center', gap: 14, padding: '15px 24px', borderBottom: '1px solid var(--color-border)' }}>
            {['Użytkownik', 'Email', 'Rola', 'Status', 'Ostatnie logowanie', ''].map((h, i) => <span key={i} style={{ color: 'var(--color-label)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>)}
          </div>
          {users.map((u, i) => (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.6fr 130px 120px 150px 50px', alignItems: 'center', gap: 14, padding: '14px 24px', borderBottom: i < users.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <Avatar user={u} size={36} />
                <span style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</span>
              </div>
              <div className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
              <RoleBadge role={u.role} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.status === 'aktywny' ? '#57E8A8' : 'rgba(255,255,255,0.3)' }} />
                <span className="soft">{u.status === 'aktywny' ? 'Aktywny' : 'Nieaktywny'}</span>
              </div>
              <div className="muted tnum" style={{ fontSize: 12.5 }}>{u.last.slice(8, 10) + '.' + u.last.slice(5, 7) + ' ' + u.last.slice(11)}</div>
              <Menu trigger={<button className="btn-icon" style={{ width: 32, height: 32 }}><Icon name="more" size={16} /></button>}
                items={[
                  { icon: 'edit', label: 'Edytuj', onClick: () => toast('Edycja użytkownika') },
                  { icon: 'lock', label: 'Resetuj hasło', onClick: () => toast('Link resetujący wysłany') },
                  { divider: true },
                  { icon: u.status === 'aktywny' ? 'x' : 'check', label: u.status === 'aktywny' ? 'Dezaktywuj' : 'Aktywuj', danger: u.status === 'aktywny', onClick: () => { toggleStatus(u.id); toast(u.status === 'aktywny' ? 'Użytkownik dezaktywowany' : 'Użytkownik aktywowany'); } },
                ]} />
            </div>
          ))}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Dodaj użytkownika / resellera" width={480}
        footer={<>
          <button className="btn btn-ghost btn-sm" onClick={() => setAddOpen(false)}>Anuluj</button>
          <button className="btn btn-primary btn-sm" onClick={createUser} disabled={!form.name.trim() || !form.email.trim()}><Icon name="check" size={15} /> Dodaj</button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 4 }}>
          <div>
            <label className="field-label">Imię i nazwisko *</label>
            <input className="input" placeholder="Jan Kowalski" value={form.name} onChange={up('name')} />
          </div>
          <div>
            <label className="field-label">Email *</label>
            <input className="input" placeholder="jan@firma.pl" value={form.email} onChange={up('email')} />
          </div>
          <div>
            <label className="field-label">Rola</label>
            <select className="select-native" value={form.role} onChange={up('role')}>
              <option value="partner">Partner / Reseller</option>
              <option value="agent">Handlowiec</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}

function AccountScreen({ user }) {
  const toast = useToast();
  return (
    <>
      <Topbar breadcrumb={<span className="muted">Ustawienia</span>} title="Ustawienia konta" subtitle="Zarządzaj swoim profilem i bezpieczeństwem." />
      <div style={{ padding: '0 40px 48px', maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* profile */}
        <div className="surface" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 17, marginBottom: 20 }}>Profil</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
            <Avatar user={user} size={72} />
            <div>
              <button className="btn btn-secondary btn-sm" onClick={() => toast('Wybór awatara')}><Icon name="user" size={15} /> Zmień awatar</button>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>JPG lub PNG, max 2MB. Lub użyj inicjałów.</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              <label className="field-label">Imię i nazwisko</label>
              <input className="input" defaultValue={user.name} />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input className="input" defaultValue={user.email} />
            </div>
            <div>
              <label className="field-label">Strefa czasowa</label>
              <select className="select-native" defaultValue="warsaw">
                <option value="warsaw">(GMT+2) Warszawa</option>
                <option value="london">(GMT+1) Londyn</option>
                <option value="newyork">(GMT-4) Nowy Jork</option>
              </select>
            </div>
            <div>
              <label className="field-label">Rola</label>
              <input className="input" defaultValue="Administrator" disabled style={{ opacity: 0.6 }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
            <button className="btn btn-primary btn-sm" onClick={() => toast('Profil zaktualizowany')}><Icon name="check" size={15} /> Zapisz zmiany</button>
          </div>
        </div>

        {/* password */}
        <div className="surface" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 17, marginBottom: 6 }}>Zmiana hasła</h3>
          <p className="muted" style={{ fontSize: 13.5, marginBottom: 20 }}>Użyj silnego hasła, którego nie używasz w innych serwisach.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 380 }}>
            <div>
              <label className="field-label">Obecne hasło</label>
              <input className="input" type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="field-label">Nowe hasło</label>
              <input className="input" type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="field-label">Potwierdź nowe hasło</label>
              <input className="input" type="password" placeholder="••••••••" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => toast('Hasło zmienione')}><Icon name="lock" size={15} /> Zmień hasło</button>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { UsersScreenD: UsersScreen, AccountScreenD: AccountScreen });
