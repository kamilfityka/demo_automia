/* ============================================================
   Leads — Kanban view, New-lead modal, Slide-over preview
   ============================================================ */
function LeadsKanban({ leads, setStatus, onOpen, toast }) {
  const [dragId, setDragId] = React.useState(null);
  const [overCol, setOverCol] = React.useState(null);
  const colColor = { nowy: '#7BA7FF', wtoku: '#FFD166', oczekuje: '#C77DFF', wygrany: '#57E8A8', przegrany: '#FF8080', zamkniety: 'rgba(255,255,255,0.4)' };

  const drop = (statusKey) => {
    if (dragId) { setStatus(dragId, statusKey); toast('Status zmieniony na „' + window.DB.statusByKey(statusKey).label + '”'); }
    setDragId(null); setOverCol(null);
  };

  return (
    <div style={{ padding: '0 40px 40px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 16, minWidth: 'min-content' }}>
        {window.DB.STATUSES.map(s => {
          const col = leads.filter(l => l.status === s.key);
          return (
            <div key={s.key}
              onDragOver={e => { e.preventDefault(); setOverCol(s.key); }}
              onDragLeave={() => setOverCol(c => c === s.key ? null : c)}
              onDrop={() => drop(s.key)}
              style={{
                width: 282, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12,
                background: overCol === s.key ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderRadius: 18, padding: 6, transition: 'background 0.15s ease',
                outline: overCol === s.key ? '1.5px dashed var(--color-border-strong)' : '1.5px dashed transparent',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: colColor[s.key], boxShadow: `0 0 10px ${colColor[s.key]}` }} />
                <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14 }}>{s.label}</span>
                <span className="muted tnum" style={{ fontSize: 13, marginLeft: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 50, padding: '1px 9px' }}>{col.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 60 }}>
                {col.map(l => {
                  const agent = window.DB.userById(l.assignedTo);
                  const form = window.DB.formById(l.formId);
                  return (
                    <div key={l.id} draggable
                      onDragStart={() => setDragId(l.id)} onDragEnd={() => { setDragId(null); setOverCol(null); }}
                      onClick={() => onOpen(l.id)}
                      className="lift click" style={{
                        background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 16,
                        padding: 15, opacity: dragId === l.id ? 0.4 : 1, boxShadow: 'var(--shadow-card)',
                        borderLeft: `3px solid ${colColor[s.key]}`,
                      }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                          <div className="muted" style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.company}</div>
                        </div>
                        <Icon name="drag" size={16} style={{ color: 'var(--color-text-muted)', opacity: 0.5, flexShrink: 0 }} />
                      </div>
                      <div className="muted" style={{ fontSize: 12.5, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="mail" size={13} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 13, gap: 8 }}>
                        <span className="chip" style={{ height: 26, fontSize: 12, maxWidth: 150 }}><Icon name="forms" size={12} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form ? form.name : '—'}</span></span>
                        <Avatar user={agent} size={26} />
                      </div>
                    </div>
                  );
                })}
                {col.length === 0 && <div className="muted" style={{ textAlign: 'center', fontSize: 12.5, padding: '20px 0', opacity: 0.5 }}>Przeciągnij tutaj</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- New lead modal ---------- */
function NewLeadModal({ open, onClose, onCreate }) {
  return (
    <Modal open={open} onClose={onClose} title="Nowy lead" width={520}
      footer={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Anuluj</button>
        <button className="btn btn-primary btn-sm" onClick={onCreate}><Icon name="check" size={16} /> Utwórz lead</button>
      </>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingBottom: 6 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Imię i nazwisko *</label>
          <input className="input" placeholder="Jan Kowalski" />
        </div>
        <div>
          <label className="field-label">Email *</label>
          <input className="input" placeholder="jan@firma.pl" />
        </div>
        <div>
          <label className="field-label">Telefon</label>
          <input className="input" placeholder="+48 600 000 000" />
        </div>
        <div>
          <label className="field-label">Firma</label>
          <input className="input" placeholder="Nazwa firmy" />
        </div>
        <div>
          <label className="field-label">Status</label>
          <select className="select-native" defaultValue="nowy">
            {window.DB.STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Przypisz do</label>
          <select className="select-native" defaultValue="u2">
            {window.DB.agents().map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Slide-over (kanban card → quick view) ---------- */
function LeadSlideOver({ id, onClose, nav }) {
  const lead = id ? window.DB.leadById(id) : null;
  const agent = lead ? window.DB.userById(lead.assignedTo) : null;
  const form = lead ? window.DB.formById(lead.formId) : null;
  return (
    <SlideOver open={!!id} onClose={onClose}>
      {lead && (
        <>
          <div style={{ padding: '24px 26px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <StatusBadge status={lead.status} />
              <h2 style={{ fontSize: 22, marginTop: 12 }}>{lead.name}</h2>
              <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>{lead.company}</div>
            </div>
            <button className="btn-icon" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
          <div style={{ padding: 26, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <InfoRow icon="mail" label="Email" value={lead.email} />
            <InfoRow icon="phone" label="Telefon" value={lead.phone} />
            <InfoRow icon="forms" label="Źródło" value={form ? form.name : '—'} />
            <InfoRow icon="calendar" label="Data wpłynięcia" value={lead.created} />
            <div className="divider" />
            <div>
              <div className="field-label">Przypisany handlowiec</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar user={agent} size={32} /><span style={{ fontWeight: 600 }}>{agent ? agent.name : '—'}</span>
              </div>
            </div>
            {lead.tags.length > 0 && (
              <div>
                <div className="field-label">Tagi</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {lead.tags.map(t => <span key={t} className="chip" style={{ height: 28 }}><Icon name="tag" size={12} /> {t}</span>)}
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '18px 26px', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { onClose(); nav('/leads/' + lead.id); }}>
              Otwórz pełną kartę leadu <Icon name="external" size={16} />
            </button>
          </div>
        </>
      )}
    </SlideOver>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', flexShrink: 0 }}><Icon name={icon} size={16} /></span>
      <div style={{ minWidth: 0 }}>
        <div className="muted" style={{ fontSize: 12 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      </div>
    </div>
  );
}

Object.assign(window, { LeadsKanbanD: LeadsKanban, NewLeadModalD: NewLeadModal, LeadSlideOverD: LeadSlideOver });
