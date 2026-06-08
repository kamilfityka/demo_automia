/* ============================================================
   /leads — card list + kanban (mobile)
   ============================================================ */
function FilterSheet({ open, onClose, statusFilter, toggleStatus, assignFilter, setAssignFilter, onClear }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Filtry"
      footer={<>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClear}>Wyczyść</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>Pokaż wyniki</button>
      </>}>
      <div style={{ paddingBottom: 8 }}>
        <div className="field-label" style={{ marginBottom: 10 }}>Status</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 22 }}>
          {window.DB.STATUSES.map(s => {
            const on = statusFilter.includes(s.key);
            return (
              <button key={s.key} onClick={() => toggleStatus(s.key)} style={{
                border: on ? '1.5px solid transparent' : '1px solid var(--color-border)', borderRadius: 50, padding: 0, cursor: 'pointer',
                background: on ? 'var(--gradient-soft)' : 'transparent', boxShadow: on ? 'inset 0 0 0 1.5px var(--color-border-strong)' : 'none',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 13px' }}>
                  {on && <Icon name="check" size={13} stroke={3} style={{ color: '#C77DFF' }} />}
                  <StatusBadge status={s.key} />
                </span>
              </button>
            );
          })}
        </div>

        <div className="field-label" style={{ marginBottom: 10 }}>Przypisany</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>
          <button onClick={() => setAssignFilter(null)} className="press" style={rowSelStyle(assignFilter === null)}>
            <span style={{ fontWeight: 500 }}>Wszyscy</span>
            {assignFilter === null && <Icon name="check" size={17} style={{ color: '#C77DFF' }} />}
          </button>
          {window.DB.agents().map(a => (
            <button key={a.id} onClick={() => setAssignFilter(a.id)} className="press" style={rowSelStyle(assignFilter === a.id)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}><Avatar user={a} size={30} /> <span style={{ fontWeight: 500 }}>{a.name}</span></span>
              {assignFilter === a.id && <Icon name="check" size={17} style={{ color: '#C77DFF' }} />}
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
function rowSelStyle(on) {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer',
    padding: '11px 14px', borderRadius: 13, border: '1px solid var(--color-border)',
    background: on ? 'var(--gradient-soft)' : 'rgba(255,255,255,0.03)', color: '#fff', textAlign: 'left',
  };
}

function LeadCard({ lead, nav, onMenu }) {
  const agent = window.DB.userById(lead.assignedTo);
  const form = window.DB.formById(lead.formId);
  return (
    <div className="surface press click" onClick={() => nav('/leads/' + lead.id)} style={{ padding: 15, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Avatar user={agent} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="trunc" style={{ fontWeight: 600, fontSize: 15.5 }}>{lead.name}</div>
          <div className="muted trunc" style={{ fontSize: 13 }}>{lead.company}</div>
        </div>
        <button className="btn-icon" style={{ width: 36, height: 36, marginTop: -2, marginRight: -4 }} onClick={e => { e.stopPropagation(); onMenu(lead); }}><Icon name="more" size={18} /></button>
      </div>
      <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
        <Icon name="mail" size={14} /> <span className="trunc">{lead.email}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <StatusBadge status={lead.status} />
        <span className="chip" style={{ height: 28, fontSize: 12, maxWidth: 150 }}><Icon name="forms" size={12} /> <span className="trunc">{form ? form.name : '—'}</span></span>
      </div>
    </div>
  );
}

function LeadsScreen({ user }) {
  const { nav, path } = useRouter();
  const toast = useToast();
  const view = path.includes('view=kanban') ? 'kanban' : 'list';
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState([]);
  const [assignFilter, setAssignFilter] = React.useState(null);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [newOpen, setNewOpen] = React.useState(false);
  const [leadsState, setLeadsState] = React.useState(window.DB.leads);
  const [slideId, setSlideId] = React.useState(null);
  const [menuLead, setMenuLead] = React.useState(null);
  const [visible, setVisible] = React.useState(12);

  const toggleStatus = (k) => setStatusFilter(f => f.includes(k) ? f.filter(x => x !== k) : [...f, k]);
  const setStatus = (id, status) => setLeadsState(s => s.map(l => l.id === id ? { ...l, status } : l));

  const filtered = React.useMemo(() => {
    return leadsState.filter(l => {
      const q = search.toLowerCase();
      const matchQ = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.company.toLowerCase().includes(q);
      const matchS = statusFilter.length === 0 || statusFilter.includes(l.status);
      const matchA = !assignFilter || l.assignedTo === assignFilter;
      return matchQ && matchS && matchA;
    });
  }, [leadsState, search, statusFilter, assignFilter]);

  React.useEffect(() => { setVisible(12); }, [search, statusFilter, assignFilter]);
  const activeFilters = statusFilter.length + (assignFilter ? 1 : 0);
  const shown = filtered.slice(0, visible);

  return (
    <>
      <TopBar title="Leady" subtitle={`${filtered.length} z ${leadsState.length}`} right={
        <Menu title="Opcje" trigger={<button className="btn-icon"><Icon name="more" size={18} /></button>}
          items={[{ icon: 'download', label: 'Eksport CSV', onClick: () => toast('Eksport CSV rozpoczęty') }]} />
      } />

      {/* controls */}
      <div style={{ padding: '12px var(--screen-pad) 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ position: 'relative' }}>
          <Icon name="search" size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-input-placeholder)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj leada…" className="input" style={{ height: 48, paddingLeft: 46, fontSize: 15 }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Segmented value={view} onChange={v => nav(v === 'kanban' ? '/leads?view=kanban' : '/leads')}
            options={[{ value: 'list', label: 'Lista', icon: 'list' }, { value: 'kanban', label: 'Kanban', icon: 'columns' }]} />
          <button className="btn btn-ghost btn-sm" onClick={() => setFilterOpen(true)} style={{ marginLeft: 'auto' }}>
            <Icon name="filter" size={16} /> Filtry
            {activeFilters > 0 && <span style={{ background: 'var(--gradient)', borderRadius: 50, padding: '1px 8px', fontSize: 11.5, fontWeight: 700 }}>{activeFilters}</span>}
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div style={{ padding: '6px var(--screen-pad) 24px' }}>
          {filtered.length === 0 ? (
            <div className="surface" style={{ marginTop: 8 }}><EmptyState icon="inbox" title="Brak leadów" text="Nie znaleziono leadów pasujących do filtrów." action={<button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setStatusFilter([]); setAssignFilter(null); }}>Wyczyść filtry</button>} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {shown.map(l => <LeadCard key={l.id} lead={l} nav={nav} onMenu={setMenuLead} />)}
              {visible < filtered.length && (
                <button className="btn btn-secondary" onClick={() => setVisible(v => v + 12)} style={{ marginTop: 4 }}>
                  Pokaż więcej ({filtered.length - visible})
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <LeadsKanban leads={filtered} setStatus={setStatus} onOpen={setSlideId} toast={toast} />
      )}

      <FAB icon="plus" label="Nowy lead" onClick={() => setNewOpen(true)} />

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} statusFilter={statusFilter} toggleStatus={toggleStatus}
        assignFilter={assignFilter} setAssignFilter={setAssignFilter}
        onClear={() => { setStatusFilter([]); setAssignFilter(null); }} />
      <NewLeadModal open={newOpen} onClose={() => setNewOpen(false)} onCreate={() => { setNewOpen(false); toast('Lead utworzony'); }} />
      <LeadSlideOver id={slideId} onClose={() => setSlideId(null)} nav={nav} />
      {/* per-lead action sheet */}
      <BottomSheet open={!!menuLead} onClose={() => setMenuLead(null)} title={menuLead ? menuLead.name : ''}>
        {menuLead && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 14 }}>
            <ActionRow icon="edit" label="Otwórz kartę" onClick={() => { const id = menuLead.id; setMenuLead(null); nav('/leads/' + id); }} />
            <div className="field-label" style={{ margin: '8px 4px 2px' }}>Zmień status</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {window.DB.STATUSES.map(s => (
                <button key={s.key} onClick={() => { setStatus(menuLead.id, s.key); setMenuLead(null); toast('Status: ' + s.label); }} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
                  <StatusBadge status={s.key} />
                </button>
              ))}
            </div>
            <div style={{ height: 6 }} />
            <ActionRow icon="trash" danger label="Usuń lead" onClick={() => { setLeadsState(s => s.filter(x => x.id !== menuLead.id)); setMenuLead(null); toast('Lead usunięty'); }} />
          </div>
        )}
      </BottomSheet>
    </>
  );
}

function ActionRow({ icon, label, onClick, danger }) {
  return (
    <button className="press" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
      padding: '14px 16px', borderRadius: 14, border: '1px solid var(--color-border)',
      background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: danger ? '#FF8080' : '#fff', fontSize: 15, fontWeight: 500,
    }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: danger ? 'rgba(255,77,77,0.15)' : 'var(--gradient-soft)', color: danger ? '#FF8080' : '#C77DFF' }}><Icon name={icon} size={17} /></span>
      {label}
    </button>
  );
}

window.LeadsScreen = LeadsScreen;
window.ActionRow = ActionRow;
