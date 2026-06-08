/* ============================================================
   /leads/:id — Karta leadu
   ============================================================ */
function LeadDetailScreen({ id }) {
  const { nav } = useRouter();
  const toast = useToast();
  const base = window.DB.leadById(id);
  const [lead, setLead] = React.useState(base);
  const [note, setNote] = React.useState('');
  const [notes, setNotes] = React.useState([]);
  const [tags, setTags] = React.useState(base ? [...base.tags] : []);
  const [tagInput, setTagInput] = React.useState('');
  const [lostOpen, setLostOpen] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState(null);
  const [assignOpen, setAssignOpen] = React.useState(false);

  if (!lead) return <div style={{ padding: 60 }}><EmptyState icon="inbox" title="Nie znaleziono leadu" text="Ten lead nie istnieje lub został usunięty." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/leads')}>Wróć do listy</button>} /></div>;

  const agent = window.DB.userById(lead.assignedTo);
  const form = window.DB.formById(lead.formId);
  const partner = form && form.partner ? window.DB.userById(form.partner) : null;
  const activity = window.DB.activityFor(lead);

  const changeStatus = (s) => {
    if (s === 'przegrany') { setPendingStatus(s); setLostOpen(true); return; }
    setLead(l => ({ ...l, status: s })); toast('Status zmieniony na „' + window.DB.statusByKey(s).label + '”');
  };
  const confirmLost = () => { setLead(l => ({ ...l, status: 'przegrany' })); setLostOpen(false); toast('Status zmieniony na „Przegrany”'); };
  const addNote = () => {
    if (!note.trim()) return;
    setNotes(n => [{ text: note, time: 'teraz', user: 'u1' }, ...n]);
    setNote(''); toast('Notatka zapisana');
  };
  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) { setTags(t => [...new Set([...t, tagInput.trim()])]); setTagInput(''); }
  };
  const assign = (uid) => { setLead(l => ({ ...l, assignedTo: uid })); setAssignOpen(false); toast('Lead przypisany'); };

  return (
    <>
      <Topbar
        breadcrumb={<><span className="click" onClick={() => nav('/leads')}>Leady</span> <Icon name="chevron-right" size={13} /> <span className="soft">{lead.name}</span></>}
        title={lead.name}
        subtitle={lead.company}
        right={<>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/leads')}><Icon name="chevron-left" size={16} /> Wróć</button>
          <button className="btn btn-secondary btn-sm" onClick={() => toast('Edycja')}><Icon name="edit" size={15} /> Edytuj</button>
        </>}
      />

      <div style={{ padding: '0 40px 48px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* contact */}
          <Section title="Dane kontaktowe" icon="user">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <ContactField label="Imię i nazwisko" value={lead.name} editable />
              <ContactField label="Email" value={lead.email} copy />
              <ContactField label="Telefon" value={lead.phone} copy />
              <ContactField label="Firma / Organizacja" value={lead.company} editable />
              <ContactField label="Źródło" value={form ? form.name : '—'} link onClick={() => nav('/forms')} />
              <ContactField label="Data wpłynięcia" value={lead.created} />
            </div>
          </Section>

          {/* form answers */}
          <Section title="Odpowiedzi z formularza" icon="forms">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {lead.answers.map((a, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, padding: '13px 0', borderTop: i ? '1px solid var(--color-border)' : 'none' }}>
                  <div className="muted" style={{ fontSize: 13 }}>{a.label}</div>
                  <div className="soft" style={{ fontSize: 14, lineHeight: 1.5 }}>{a.value}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* activity history */}
          <Section title="Historia aktywności" icon="activity">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notes.map((n, i) => <ActivityItem key={'n' + i} item={{ type: 'note', user: n.user, time: n.time, note: n.text }} first={i === 0} />)}
              {activity.map((a, i) => <ActivityItem key={i} item={a} first={notes.length === 0 && i === 0} />)}
            </div>
          </Section>

          {/* add note */}
          <Section title="Notatki" icon="message">
            <textarea className="textarea" placeholder="Dodaj notatkę… (np. ustalenia z rozmowy, kolejne kroki)" value={note} onChange={e => setNote(e.target.value)} style={{ minHeight: 90 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <button className="btn btn-primary btn-sm" onClick={addNote} disabled={!note.trim()}><Icon name="send" size={15} /> Zapisz notatkę</button>
            </div>
          </Section>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 24 }}>
          {/* status panel */}
          <div className="surface" style={{ padding: 22 }}>
            <div className="field-label" style={{ marginBottom: 12 }}>Status leadu</div>
            <div style={{ marginBottom: 16 }}><span style={{ transform: 'scale(1.15)', transformOrigin: 'left', display: 'inline-block' }}><StatusBadge status={lead.status} /></span></div>
            <select className="select-native" value={lead.status} onChange={e => changeStatus(e.target.value)}>
              {window.DB.STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>

          {/* assign panel */}
          <div className="surface" style={{ padding: 22 }}>
            <div className="field-label" style={{ marginBottom: 14 }}>Przypisany handlowiec</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar user={agent} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{agent ? agent.name : 'Nieprzypisany'}</div>
                <div className="muted" style={{ fontSize: 12.5 }}>{agent ? agent.email : ''}</div>
              </div>
              <Menu align="right" trigger={<button className="btn btn-ghost btn-sm">Zmień</button>}
                items={window.DB.agents().map(a => ({ icon: 'user', label: a.name, onClick: () => assign(a.id) }))} />
            </div>
          </div>

          {/* tags panel */}
          <div className="surface" style={{ padding: 22 }}>
            <div className="field-label" style={{ marginBottom: 14 }}>Tagi</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: tags.length ? 14 : 0 }}>
              {tags.map(t => (
                <span key={t} className="chip" style={{ height: 30, paddingRight: 6 }}>
                  <Icon name="tag" size={12} /> {t}
                  <button onClick={() => setTags(x => x.filter(y => y !== t))} className="btn-icon" style={{ width: 20, height: 20, background: 'transparent' }}><Icon name="x" size={13} /></button>
                </span>
              ))}
            </div>
            <input className="input" style={{ height: 40, fontSize: 13 }} placeholder="Dodaj tag i naciśnij Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />
          </div>

          {/* partner panel */}
          {partner && (
            <div className="surface" style={{ padding: 22, background: 'var(--gradient-soft)' }}>
              <div className="field-label" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="link" size={14} /> Partner</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar user={partner} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{partner.name}</div>
                  <div className="muted" style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{partner.email}</div>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 14 }} onClick={() => nav('/settings/users')}>Profil partnera <Icon name="chevron-right" size={14} /></button>
            </div>
          )}
        </div>
      </div>

      {/* lost reason modal */}
      <Modal open={lostOpen} onClose={() => setLostOpen(false)} title="Oznacz jako Przegrany" width={440}
        footer={<>
          <button className="btn btn-ghost btn-sm" onClick={() => setLostOpen(false)}>Anuluj</button>
          <button className="btn btn-primary btn-sm" onClick={confirmLost} style={{ background: 'linear-gradient(100deg,#FF4D4D,#E0408a)' }}><Icon name="check" size={15} /> Potwierdź</button>
        </>}>
        <p className="muted" style={{ marginBottom: 16, fontSize: 14 }}>Podaj powód utraty leadu — pomoże to w analizie sprzedaży.</p>
        <label className="field-label">Powód *</label>
        <textarea className="textarea" placeholder="np. Wybrali konkurencję, brak budżetu, brak kontaktu…" />
      </Modal>
    </>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="surface" style={{ padding: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
        <Icon name={icon} size={17} style={{ color: '#C77DFF' }} />
        <h3 style={{ fontSize: 16.5 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ContactField({ label, value, copy, editable, link, onClick }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 12, marginBottom: 5 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span onClick={onClick} className={link ? 'click gradient-text' : ''} style={{ fontSize: 14.5, fontWeight: 500, cursor: link ? 'pointer' : 'default', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
        {copy && <CopyButton value={value} size={28} />}
        {editable && <Icon name="edit" size={13} style={{ color: 'var(--color-text-muted)', opacity: 0.6 }} />}
      </div>
    </div>
  );
}

function ActivityItem({ item, first }) {
  const u = item.user ? window.DB.userById(item.user) : null;
  let content, icon, color = '#C77DFF';
  if (item.type === 'status') { content = <><strong>{u ? u.name.split(' ')[0] + ' ' + u.name.split(' ')[1][0] + '.' : 'System'}</strong> zmienił status z „{item.from}" na „{item.to}"</>; icon = 'tag'; color = '#FFD166'; }
  else if (item.type === 'note') { content = <><strong>{u ? u.name.split(' ')[0] + ' ' + u.name.split(' ')[1][0] + '.' : '—'}</strong> dodał notatkę: <span className="muted">„{item.note}"</span></>; icon = 'message'; color = '#7BA7FF'; }
  else if (item.type === 'assign') { const t = window.DB.userById(item.to); content = <>System przypisał lead do <strong>{t ? t.name : '—'}</strong></>; icon = 'user'; color = '#C77DFF'; }
  else { const f = window.DB.formById(item.formId); content = <>Lead wpłynął z formularza <strong>„{f ? f.name : '—'}"</strong></>; icon = 'inbox'; color = '#57E8A8'; }

  return (
    <div style={{ display: 'flex', gap: 14, padding: '12px 0', borderTop: first ? 'none' : '1px solid var(--color-border)' }}>
      <span style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '22', color, marginTop: 2 }}><Icon name={icon} size={15} /></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.5 }} className="soft">{content}</div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>{item.time}</div>
      </div>
    </div>
  );
}

window.LeadDetailScreenD = LeadDetailScreen;
