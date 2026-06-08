/* ============================================================
   /leads — table + kanban
   ============================================================ */
function StatusFilterDropdown({ selected, onToggle }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const count = selected.length;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)}>
        <Icon name="filter" size={15} /> Status {count > 0 && <span style={{ background: 'var(--gradient)', borderRadius: 50, padding: '1px 8px', fontSize: 11.5, fontWeight: 700 }}>{count}</span>}
      </button>
      {open && (
        <div className="menu-in" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', padding: 8, minWidth: 200 }}>
          {window.DB.STATUSES.map(s => (
            <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, cursor: 'pointer', fontSize: 13.5 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span onClick={() => onToggle(s.key)} style={{
                width: 18, height: 18, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: selected.includes(s.key) ? 'none' : '1.5px solid var(--color-border-strong)',
                background: selected.includes(s.key) ? 'var(--gradient)' : 'transparent',
              }}>{selected.includes(s.key) && <Icon name="check" size={12} stroke={3} />}</span>
              <span onClick={() => onToggle(s.key)} style={{ flex: 1 }}><StatusBadge status={s.key} /></span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function LeadsScreen({ user }) {
  const { nav, path } = useRouter();
  const toast = useToast();
  const view = path.includes('view=kanban') ? 'kanban' : 'table';
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState([]);
  const [sort, setSort] = React.useState({ col: 'created', dir: 'desc' });
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [perPage, setPerPage] = React.useState(25);
  const [newOpen, setNewOpen] = React.useState(false);
  const [leadsState, setLeadsState] = React.useState(window.DB.leads);
  const [slideId, setSlideId] = React.useState(null);

  const toggleStatus = (k) => setStatusFilter(f => f.includes(k) ? f.filter(x => x !== k) : [...f, k]);

  const filtered = React.useMemo(() => {
    let r = leadsState.filter(l => {
      const q = search.toLowerCase();
      const matchQ = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.company.toLowerCase().includes(q);
      const matchS = statusFilter.length === 0 || statusFilter.includes(l.status);
      return matchQ && matchS;
    });
    r = [...r].sort((a, b) => {
      let av, bv;
      if (sort.col === 'name') { av = a.name; bv = b.name; }
      else if (sort.col === 'company') { av = a.company; bv = b.company; }
      else if (sort.col === 'status') { av = a.status; bv = b.status; }
      else { av = a.created; bv = b.created; }
      return (av < bv ? -1 : av > bv ? 1 : 0) * (sort.dir === 'asc' ? 1 : -1);
    });
    return r;
  }, [leadsState, search, statusFilter, sort]);

  const pageCount = Math.ceil(filtered.length / perPage);
  const pageRows = filtered.slice(page * perPage, page * perPage + perPage);
  React.useEffect(() => { setPage(0); }, [search, statusFilter, perPage]);

  const setStatus = (id, status) => { window.DB.setLeadStatus(id, status); setLeadsState(window.DB.leads); };
  const removeLead = (id) => { window.DB.deleteLead(id); setLeadsState(window.DB.leads); setSelected(s => s.filter(x => x !== id)); };

  const allChecked = pageRows.length > 0 && pageRows.every(l => selected.includes(l.id));
  const toggleAll = () => setSelected(allChecked ? selected.filter(id => !pageRows.find(l => l.id === id)) : [...new Set([...selected, ...pageRows.map(l => l.id)])]);
  const toggleOne = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const SortHead = ({ col, children, style }) => (
    <button onClick={() => setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }))}
      style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-label)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-body)', padding: 0, ...style }}>
      {children}
      {sort.col === col && <Icon name={sort.dir === 'asc' ? 'chevron-up' : 'chevron-down'} size={13} />}
    </button>
  );

  return (
    <>
      <Topbar
        title="Leady"
        subtitle={`${filtered.length} z ${leadsState.length} leadów`}
        right={<>
          <button className="btn btn-secondary btn-sm" onClick={() => toast('Eksport CSV rozpoczęty')}><Icon name="download" size={16} /> Eksport CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => setNewOpen(true)}><Icon name="plus" size={16} /> Nowy lead</button>
        </>}
      />

      <div style={{ padding: '0 40px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Segmented value={view} onChange={v => nav(v === 'kanban' ? '/leads?view=kanban' : '/leads')}
          options={[{ value: 'table', label: 'Tabela', icon: 'list' }, { value: 'kanban', label: 'Kanban', icon: 'columns' }]} />

        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
          <Icon name="search" size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-input-placeholder)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj po nazwie, emailu, firmie…"
            className="input" style={{ height: 42, paddingLeft: 44, fontSize: 13.5 }} />
        </div>

        <StatusFilterDropdown selected={statusFilter} onToggle={toggleStatus} />
        <button className="btn btn-ghost btn-sm"><Icon name="user" size={15} /> Przypisany</button>
        <button className="btn btn-ghost btn-sm"><Icon name="forms" size={15} /> Źródło</button>
        <button className="btn btn-ghost btn-sm"><Icon name="calendar" size={15} /> Data</button>
      </div>

      {view === 'table'
        ? <LeadsTable rows={pageRows} all={filtered} selected={selected} toggleAll={toggleAll} toggleOne={toggleOne} allChecked={allChecked}
            SortHead={SortHead} nav={nav} setStatus={setStatus} removeLead={removeLead} toast={toast}
            page={page} setPage={setPage} pageCount={pageCount} perPage={perPage} setPerPage={setPerPage}
            setSelected={setSelected} />
        : <LeadsKanbanD leads={filtered} setStatus={setStatus} onOpen={setSlideId} toast={toast} />}

      <NewLeadModalD open={newOpen} onClose={() => setNewOpen(false)} onCreate={(data) => { window.DB.addLead(data); setLeadsState(window.DB.leads); setNewOpen(false); toast('Lead utworzony'); }} />
      <LeadSlideOverD id={slideId} onClose={() => setSlideId(null)} nav={nav} />
    </>
  );
}

/* ---------- Table view ---------- */
function LeadsTable({ rows, all, selected, toggleAll, toggleOne, allChecked, SortHead, nav, setStatus, removeLead, toast, page, setPage, pageCount, perPage, setPerPage, setSelected }) {
  const cols = '40px 1.7fr 1.5fr 130px 1.1fr 1.2fr 130px 50px';
  if (all.length === 0) {
    return <div style={{ padding: '0 40px 40px' }}><div className="surface"><EmptyState icon="inbox" title="Brak leadów" text="Nie ma jeszcze żadnych leadów. Opublikuj formularz i poczekaj na pierwsze zgłoszenia." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/forms')}><Icon name="forms" size={16} /> Przejdź do formularzy</button>} /></div></div>;
  }
  return (
    <div style={{ padding: '0 40px 40px' }}>
      {/* bulk bar */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', marginBottom: 14, borderRadius: 16, background: 'var(--gradient-soft)', border: '1px solid var(--color-border-strong)' }}>
          <strong style={{ fontSize: 14 }}>{selected.length} zaznaczonych</strong>
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-sm" onClick={() => toast('Zmień status — zbiorcze')}><Icon name="tag" size={15} /> Zmień status</button>
          <button className="btn btn-ghost btn-sm" onClick={() => toast('Przypisz — zbiorcze')}><Icon name="user" size={15} /> Przypisz</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { toast('Usunięto'); setSelected([]); }} style={{ color: '#FF8080' }}><Icon name="trash" size={15} /> Usuń</button>
          <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setSelected([])}><Icon name="x" size={16} /></button>
        </div>
      )}

      <div className="surface" style={{ overflow: 'hidden', padding: 0 }}>
        {/* header */}
        <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', gap: 14, padding: '15px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <Checkbox checked={allChecked} onChange={toggleAll} />
          <SortHead col="name">Imię / Firma</SortHead>
          <span style={{ color: 'var(--color-label)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</span>
          <SortHead col="status">Status</SortHead>
          <span style={{ color: 'var(--color-label)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Źródło</span>
          <span style={{ color: 'var(--color-label)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Przypisany</span>
          <SortHead col="created">Data</SortHead>
          <span />
        </div>

        {rows.map((l, i) => {
          const agent = window.DB.userById(l.assignedTo);
          const form = window.DB.formById(l.formId);
          const checked = selected.includes(l.id);
          return (
            <div key={l.id} className="click" style={{
              display: 'grid', gridTemplateColumns: cols, alignItems: 'center', gap: 14, padding: '13px 20px',
              borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none',
              background: checked ? 'rgba(155,64,224,0.08)' : 'transparent', transition: 'background 0.12s ease',
            }}
              onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent'; }}>
              <Checkbox checked={checked} onChange={() => toggleOne(l.id)} />
              <div className="click" onClick={() => nav('/leads/' + l.id)} style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="lead-link">{l.name}</div>
                <div className="muted" style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.company}</div>
              </div>
              <div className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.email}</div>
              <StatusBadge status={l.status} />
              <div className="soft" style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form ? form.name : '—'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <Avatar user={agent} size={26} />
                <span style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent ? agent.name.split(' ')[0] : '—'}</span>
              </div>
              <div className="muted tnum" style={{ fontSize: 12.5 }}>{l.created.slice(8, 10) + '.' + l.created.slice(5, 7) + '.' + l.created.slice(0, 4)}<br /><span style={{ opacity: 0.7 }}>{l.created.slice(11)}</span></div>
              <Menu trigger={<button className="btn-icon" style={{ width: 32, height: 32 }}><Icon name="more" size={16} /></button>}
                items={[
                  { icon: 'edit', label: 'Edytuj', onClick: () => nav('/leads/' + l.id) },
                  { icon: 'tag', label: 'Zmień status', onClick: () => nav('/leads/' + l.id) },
                  { divider: true },
                  { icon: 'trash', label: 'Usuń', danger: true, onClick: () => { removeLead(l.id); toast('Lead usunięty'); } },
                ]} />
            </div>
          );
        })}
      </div>

      {/* pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="muted" style={{ fontSize: 13 }}>Wierszy na stronę:</span>
          {[25, 50, 100].map(n => (
            <button key={n} onClick={() => setPerPage(n)} style={{
              width: 36, height: 32, borderRadius: 9, border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: perPage === n ? 'var(--gradient)' : 'transparent', color: '#fff',
            }}>{n}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="muted" style={{ fontSize: 13 }}>Strona {page + 1} z {Math.max(1, pageCount)}</span>
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}><Icon name="chevron-left" size={15} /> Poprzednia</button>
          <button className="btn btn-ghost btn-sm" disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)}>Następna <Icon name="chevron-right" size={15} /></button>
        </div>
      </div>
    </div>
  );
}

function Checkbox({ checked, onChange }) {
  return (
    <span onClick={e => { e.stopPropagation(); onChange(); }} className="click" style={{
      width: 19, height: 19, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: checked ? 'none' : '1.5px solid var(--color-border-strong)',
      background: checked ? 'var(--gradient)' : 'transparent', transition: 'all 0.12s ease',
    }}>{checked && <Icon name="check" size={13} stroke={3} />}</span>
  );
}

window.LeadsScreenD = LeadsScreen;
