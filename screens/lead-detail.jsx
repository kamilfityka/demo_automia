/* ============================================================
   /leads/:id — Karta leadu (mobile, stacked)
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
  const [assignOpen, setAssignOpen] = React.useState(false);

  if (!lead) return (
    <>
      <TopBar onBack={() => nav('/leads')} title="Lead" />
      <div style={{ padding: 30 }}><EmptyState icon="inbox" title="Nie znaleziono leadu" text="Ten lead nie istnieje lub został usunięty." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/leads')}>Wróć do listy</button>} /></div>
    </>
  );

  const agent = window.DB.userById(lead.assignedTo);
  const form = window.DB.formById(lead.formId);
  const partner = form && form.partner ? window.DB.userById(form.partner) : null;
  const activity = window.DB.activityFor(lead);

  const changeStatus = (s) => {
    if (s === 'przegrany') { setLostOpen(true); return; }
    setLead(l => ({ ...l, status: s })); toast('Status: „' + window.DB.statusByKey(s).label + '”');
  };
  const confirmLost = () => { setLead(l => ({ ...l, status: 'przegrany' })); setLostOpen(false); toast('Status: „Przegrany”'); };
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
      <TopBar onBack={() => nav('/leads')} title={lead.name} subtitle={lead.company} right={
        <button className="btn-icon" onClick={() => toast('Edycja')}><Icon name="edit" size={17} /></button>
      } />

      <div style={{ padding: '12px var(--screen-pad) 28px', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
        {/* status + assign hero */}
        <div className="surface" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="field-label" style={{ marginBottom: 9 }}>Status leadu</div>
            <select className="select-native" value={lead.status} onChange={e => changeStatus(e.target.value)}>
              {window.DB.STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div className="divider" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar user={agent} size={42} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="muted" style={{ fontSize: 12 }}>Przypisany handlowiec</div>
              <div className="trunc" style={{ fontWeight: 600, fontSize: 14.5 }}>{agent ? agent.name : 'Nieprzypisany'}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setAssignOpen(true)}>Zmień</button>
          </div>
        </div>

        {/* partner */}
        {partner && (
          <div className="surface" style={{ padding: 18, background: 'var(--gradient-soft)' }}>
            <div className="field-label" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="link" size={14} /> Partner</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar user={partner} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="trunc" style={{ fontWeight: 600, fontSize: 14 }}>{partner.name}</div>
                <div className="muted trunc" style={{ fontSize: 12.5 }}>{partner.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* contact */}
        <Section title="Dane kontaktowe" icon="user">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <ContactField label="Email" value={lead.email} copy />
            <ContactField label="Telefon" value={lead.phone} copy />
            <ContactField label="Firma / Organizacja" value={lead.company} />
            <ContactField label="Źródło" value={form ? form.name : '—'} link onClick={() => nav('/forms')} />
            <ContactField label="Data wpłynięcia" value={lead.created} />
          </div>
        </Section>

        {/* form answers */}
        <Section title="Odpowiedzi z formularza" icon="forms">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {lead.answers.map((a, i) => (
              <div key={i} style={{ padding: '12px 0', borderTop: i ? '1px solid var(--color-border)' : 'none' }}>
                <div className="muted" style={{ fontSize: 12.5, marginBottom: 3 }}>{a.label}</div>
                <div className="soft" style={{ fontSize: 14.5, lineHeight: 1.5 }}>{a.value}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* tags */}
        <Section title="Tagi" icon="tag">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: tags.length ? 14 : 0 }}>
            {tags.map(t => (
              <span key={t} className="chip" style={{ paddingRight: 6 }}>
                <Icon name="tag" size={12} /> {t}
                <button onClick={() => setTags(x => x.filter(y => y !== t))} className="btn-icon" style={{ width: 22, height: 22, background: 'transparent' }}><Icon name="x" size={13} /></button>
              </span>
            ))}
          </div>
          <input className="input" style={{ height: 46 }} placeholder="Dodaj tag i naciśnij Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />
        </Section>

        {/* notes */}
        <Section title="Notatka" icon="message">
          <textarea className="textarea" placeholder="Dodaj notatkę…" value={note} onChange={e => setNote(e.target.value)} style={{ minHeight: 88 }} />
          <button className="btn btn-primary" onClick={addNote} disabled={!note.trim()} style={{ width: '100%', marginTop: 12 }}><Icon name="send" size={16} /> Zapisz notatkę</button>
        </Section>

        {/* activity */}
        <Section title="Historia aktywności" icon="activity">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notes.map((n, i) => <ActivityItem key={'n' + i} item={{ type: 'note', user: n.user, time: n.time, note: n.text }} first={i === 0} />)}
            {activity.map((a, i) => <ActivityItem key={i} item={a} first={notes.length === 0 && i === 0} />)}
          </div>
        </Section>
      </div>

      {/* assign sheet */}
      <BottomSheet open={assignOpen} onClose={() => setAssignOpen(false)} title="Przypisz handlowca">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 16 }}>
          {window.DB.agents().map(a => (
            <button key={a.id} className="press" onClick={() => assign(a.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer',
              padding: '11px 14px', borderRadius: 14, border: '1px solid var(--color-border)',
              background: lead.assignedTo === a.id ? 'var(--gradient-soft)' : 'rgba(255,255,255,0.03)', color: '#fff',
            }}>
              <Avatar user={a} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="trunc" style={{ fontWeight: 600, fontSize: 14.5 }}>{a.name}</div>
                <div className="muted trunc" style={{ fontSize: 12.5 }}>{a.email}</div>
              </div>
              {lead.assignedTo === a.id && <Icon name="check" size={18} style={{ color: '#C77DFF' }} />}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* lost reason sheet */}
      <Modal open={lostOpen} onClose={() => setLostOpen(false)} title="Oznacz jako Przegrany"
        footer={<>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setLostOpen(false)}>Anuluj</button>
          <button className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(100deg,#FF4D4D,#E0408a)' }} onClick={confirmLost}><Icon name="check" size={16} /> Potwierdź</button>
        </>}>
        <p className="muted" style={{ marginBottom: 16, fontSize: 14 }}>Podaj powód utraty leadu — pomoże to w analizie sprzedaży.</p>
        <label className="field-label">Powód *</label>
        <textarea className="textarea" placeholder="np. Wybrali konkurencję, brak budżetu…" />
      </Modal>
    </>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="surface" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 15 }}>
        <Icon name={icon} size={16} style={{ color: '#C77DFF' }} />
        <h3 style={{ fontSize: 15.5 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ContactField({ label, value, copy, link, onClick }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span onClick={onClick} className={link ? 'click gradient-text trunc' : 'trunc'} style={{ fontSize: 14.5, fontWeight: 500, cursor: link ? 'pointer' : 'default', flex: 1 }}>{value}</span>
        {copy && <CopyButton value={value} size={36} />}
      </div>
    </div>
  );
}

function ActivityItem({ item, first }) {
  const u = item.user ? window.DB.userById(item.user) : null;
  const nm = (u) => u ? u.name.split(' ')[0] + ' ' + (u.name.split(' ')[1] || '')[0] + '.' : 'System';
  let content, icon, color = '#C77DFF';
  if (item.type === 'status') { content = <><strong>{nm(u)}</strong> zmienił status z „{item.from}" na „{item.to}"</>; icon = 'tag'; color = '#FFD166'; }
  else if (item.type === 'note') { content = <><strong>{nm(u)}</strong> dodał notatkę: <span className="muted">„{item.note}"</span></>; icon = 'message'; color = '#7BA7FF'; }
  else if (item.type === 'assign') { const t = window.DB.userById(item.to); content = <>System przypisał lead do <strong>{t ? t.name : '—'}</strong></>; icon = 'user'; color = '#C77DFF'; }
  else { const f = window.DB.formById(item.formId); content = <>Lead wpłynął z formularza <strong>„{f ? f.name : '—'}"</strong></>; icon = 'inbox'; color = '#57E8A8'; }
  return (
    <div style={{ display: 'flex', gap: 13, padding: '11px 0', borderTop: first ? 'none' : '1px solid var(--color-border)' }}>
      <span style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '22', color, marginTop: 1 }}><Icon name={icon} size={15} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.5 }} className="soft">{content}</div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{item.time}</div>
      </div>
    </div>
  );
}

window.LeadDetailScreen = LeadDetailScreen;
