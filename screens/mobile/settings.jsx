/* ============================================================
   /settings/users  +  /settings/account (mobile)
   ============================================================ */
function UsersScreen() {
  const { nav } = useRouter();
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
      <TopBar onBack={() => nav('/dashboard')} title="Użytkownicy" subtitle={`${users.length} osób`} />

      <div style={{ padding: '12px var(--screen-pad) 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {users.map(u => (
          <div key={u.id} className="surface" style={{ padding: 15, display: 'flex', alignItems: 'center', gap: 13 }}>
            <Avatar user={u} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="trunc" style={{ fontWeight: 600, fontSize: 15 }}>{u.name}</div>
              <div className="muted trunc" style={{ fontSize: 12.5 }}>{u.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
                <RoleBadge role={u.role} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.status === 'aktywny' ? '#57E8A8' : 'rgba(255,255,255,0.3)' }} />
                  <span className="muted">{u.status === 'aktywny' ? 'Aktywny' : 'Nieaktywny'}</span>
                </span>
              </div>
            </div>
            <Menu title={u.name} trigger={<button className="btn-icon" style={{ width: 38, height: 38 }}><Icon name="more" size={18} /></button>}
              items={[
                { icon: 'edit', label: 'Edytuj', onClick: () => toast('Edycja użytkownika') },
                { icon: 'lock', label: 'Resetuj hasło', onClick: () => toast('Link resetujący wysłany') },
                { icon: u.status === 'aktywny' ? 'x' : 'check', label: u.status === 'aktywny' ? 'Dezaktywuj' : 'Aktywuj', danger: u.status === 'aktywny', onClick: () => { toggleStatus(u.id); toast(u.status === 'aktywny' ? 'Użytkownik dezaktywowany' : 'Użytkownik aktywowany'); } },
              ]} />
          </div>
        ))}
      </div>

      <FAB icon="plus" label="Dodaj użytkownika" onClick={() => setAddOpen(true)} />

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Dodaj użytkownika / resellera"
        footer={<>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setAddOpen(false)}>Anuluj</button>
          <button className="btn btn-primary" style={{ flex: 1.4 }} onClick={createUser} disabled={!form.name.trim() || !form.email.trim()}><Icon name="check" size={16} /> Dodaj</button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15, paddingBottom: 4 }}>
          <div>
            <label className="field-label">Imię i nazwisko *</label>
            <input className="input" placeholder="Jan Kowalski" value={form.name} onChange={up('name')} />
          </div>
          <div>
            <label className="field-label">Email *</label>
            <input className="input" type="email" placeholder="jan@firma.pl" value={form.email} onChange={up('email')} />
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
  const { nav } = useRouter();
  const toast = useToast();
  return (
    <>
      <TopBar onBack={() => nav('/dashboard')} title="Ustawienia konta" />

      <div style={{ padding: '12px var(--screen-pad) 28px', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
        {/* profile */}
        <div className="surface" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <Avatar user={user} size={64} />
            <div>
              <button className="btn btn-secondary btn-sm" onClick={() => toast('Wybór awatara')}><Icon name="user" size={15} /> Zmień awatar</button>
              <div className="muted" style={{ fontSize: 12, marginTop: 7 }}>JPG lub PNG, max 2MB.</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div>
              <label className="field-label">Imię i nazwisko</label>
              <input className="input" defaultValue={user.name} />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input className="input" type="email" defaultValue={user.email} />
            </div>
            <div>
              <label className="field-label">Strefa czasowa</label>
              <select className="select-native" defaultValue="warsaw">
                <option value="warsaw">(GMT+2) Warszawa</option>
                <option value="london">(GMT+1) Londyn</option>
                <option value="newyork">(GMT-4) Nowy Jork</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => toast('Profil zaktualizowany')} style={{ width: '100%', marginTop: 18 }}><Icon name="check" size={16} /> Zapisz zmiany</button>
        </div>

        {/* password */}
        <div className="surface" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Zmiana hasła</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>Użyj silnego hasła, którego nie używasz gdzie indziej.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
          <button className="btn btn-secondary" onClick={() => toast('Hasło zmienione')} style={{ width: '100%', marginTop: 18 }}><Icon name="lock" size={16} /> Zmień hasło</button>
        </div>

        <button className="btn btn-ghost" onClick={() => nav('/login')} style={{ width: '100%', color: '#FF8080' }}><Icon name="logout" size={16} /> Wyloguj się</button>
      </div>
    </>
  );
}

Object.assign(window, { UsersScreenM: UsersScreen, AccountScreenM: AccountScreen });
