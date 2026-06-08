/* ============================================================
   /forms/new + /forms/:id/edit — kreator formularza
   ============================================================ */
function FormBuilderScreen({ id }) {
  const { nav } = useRouter();
  const toast = useToast();
  const editing = !!id;
  const existing = editing ? window.DB.formById(id) : null;
  const [tab, setTab] = React.useState('build'); // build | settings
  const [fields, setFields] = React.useState(window.DB.builderSchema.map(f => ({ ...f })));
  const [selectedId, setSelectedId] = React.useState(null);
  const [dragType, setDragType] = React.useState(null);
  const [dragIdx, setDragIdx] = React.useState(null);
  const [overIdx, setOverIdx] = React.useState(null);
  const [name, setName] = React.useState(existing ? existing.name : 'Nowy formularz');
  const [slug, setSlug] = React.useState(existing ? existing.slug : 'nowy-formularz');

  const selected = fields.find(f => f.id === selectedId);

  const addField = (type, atIdx) => {
    const ft = window.DB.fieldTypes.find(t => t.type === type);
    const nf = {
      id: 'fld' + Date.now() + Math.random().toString(36).slice(2, 5),
      type, label: ft.label, placeholder: '', required: false, help: '',
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Opcja 1', 'Opcja 2'] : undefined,
    };
    setFields(f => { const c = [...f]; c.splice(atIdx == null ? f.length : atIdx, 0, nf); return c; });
    setSelectedId(nf.id);
  };

  const update = (patch) => setFields(f => f.map(x => x.id === selectedId ? { ...x, ...patch } : x));
  const remove = (fid) => { setFields(f => f.filter(x => x.id !== fid)); if (selectedId === fid) setSelectedId(null); };

  const onCanvasDrop = (idx) => {
    if (dragType) addField(dragType, idx);
    else if (dragIdx != null && idx != null) {
      setFields(f => { const c = [...f]; const [m] = c.splice(dragIdx, 1); c.splice(dragIdx < idx ? idx - 1 : idx, 0, m); return c; });
    }
    setDragType(null); setDragIdx(null); setOverIdx(null);
  };

  return (
    <>
      <Topbar
        breadcrumb={<><span className="click" onClick={() => nav('/forms')}>Formularze</span> <Icon name="chevron-right" size={13} /> <span className="soft">{editing ? 'Edycja' : 'Nowy'}</span></>}
        title={name}
        right={<>
          <button className="btn btn-ghost btn-sm" onClick={() => toast('Szkic zapisany')}>Zapisz szkic</button>
          <button className="btn btn-secondary btn-sm" onClick={() => nav('/f/' + slug)}><Icon name="eye" size={15} /> Podgląd</button>
          <button className="btn btn-primary btn-sm" onClick={() => { toast('Formularz opublikowany'); nav('/forms'); }}><Icon name="rocket" size={15} /> Opublikuj</button>
        </>}
      />

      <div style={{ padding: '0 40px 16px' }}>
        <Segmented value={tab} onChange={setTab} options={[{ value: 'build', label: 'Pola', icon: 'forms' }, { value: 'settings', label: 'Ustawienia', icon: 'settings' }]} />
      </div>

      {tab === 'build' ? (
        <div style={{ padding: '0 40px 48px', display: 'grid', gridTemplateColumns: '270px 1fr 300px', gap: 20, alignItems: 'start' }}>
          {/* field library */}
          <div className="surface" style={{ padding: 18, position: 'sticky', top: 24 }}>
            <div className="field-label" style={{ marginBottom: 14 }}>Typy pól — przeciągnij na formularz</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {window.DB.fieldTypes.map(ft => (
                <div key={ft.type} draggable
                  onDragStart={() => setDragType(ft.type)} onDragEnd={() => { setDragType(null); setOverIdx(null); }}
                  onClick={() => addField(ft.type)}
                  className="click" style={{
                    display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', cursor: 'grab',
                    transition: 'all 0.14s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--gradient-soft)'; e.currentTarget.style.borderColor = 'var(--color-border-strong)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}>
                  <span style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(155,64,224,0.18)', color: '#C77DFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ft.icon} size={15} /></span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{ft.label}</div>
                    <div className="muted" style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ft.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* canvas */}
          <div className="surface" style={{ padding: 26, minHeight: 400 }}
            onDragOver={e => { e.preventDefault(); if (overIdx == null) setOverIdx(fields.length); }}
            onDrop={() => onCanvasDrop(overIdx == null ? fields.length : overIdx)}>
            <DropZone active={overIdx === 0} onOver={() => setOverIdx(0)} />
            {fields.map((f, i) => (
              <React.Fragment key={f.id}>
                <FieldPreview field={f} selected={selectedId === f.id}
                  onClick={() => setSelectedId(f.id)} onRemove={() => remove(f.id)}
                  onDragStart={() => setDragIdx(i)} onDragEnd={() => { setDragIdx(null); setOverIdx(null); }} />
                <DropZone active={overIdx === i + 1} onOver={() => setOverIdx(i + 1)} />
              </React.Fragment>
            ))}
            {fields.length === 0 && (
              <div className="muted" style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--color-border)', borderRadius: 16 }}>
                <Icon name="forms" size={28} style={{ opacity: 0.5, marginBottom: 10 }} /><br />
                Przeciągnij pola z lewej strony, aby zbudować formularz
              </div>
            )}
          </div>

          {/* config */}
          <div className="surface" style={{ padding: 22, position: 'sticky', top: 24 }}>
            {selected ? <FieldConfig field={selected} update={update} /> : (
              <div className="muted" style={{ textAlign: 'center', padding: '40px 16px', fontSize: 13.5 }}>
                <Icon name="edit" size={24} style={{ opacity: 0.5, marginBottom: 10 }} /><br />
                Kliknij pole, aby je skonfigurować
              </div>
            )}
          </div>
        </div>
      ) : (
        <FormSettings name={name} setName={setName} slug={slug} setSlug={setSlug} />
      )}
    </>
  );
}

function DropZone({ active, onOver }) {
  return (
    <div onDragOver={e => { e.preventDefault(); e.stopPropagation(); onOver(); }}
      style={{ height: active ? 44 : 10, transition: 'height 0.12s ease', display: 'flex', alignItems: 'center' }}>
      {active && <div style={{ width: '100%', height: 3, borderRadius: 50, background: 'var(--gradient)', boxShadow: '0 0 12px rgba(155,64,224,0.6)' }} />}
    </div>
  );
}

function FieldPreview({ field, selected, onClick, onRemove, onDragStart, onDragEnd }) {
  if (field.type === 'section') {
    return (
      <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onClick} className="click" style={{
        padding: '14px 4px 6px', borderBottom: '1px solid var(--color-border-strong)', marginBottom: 4,
        position: 'relative', outline: selected ? '2px solid #9B40E0' : 'none', outlineOffset: 6, borderRadius: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 16 }}>{field.label}</h3>
          <FieldTools onRemove={onRemove} />
        </div>
      </div>
    );
  }
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onClick} className="click" style={{
      padding: 14, borderRadius: 14, border: selected ? '2px solid #9B40E0' : '1px solid var(--color-border)',
      background: selected ? 'var(--gradient-soft)' : 'rgba(255,255,255,0.02)', position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <label className="field-label" style={{ marginBottom: 8 }}>{field.label} {field.required && <span style={{ color: '#FF8080' }}>*</span>}</label>
        <FieldTools onRemove={onRemove} />
      </div>
      <MockInput field={field} />
      {field.help && <div className="field-help">{field.help}</div>}
    </div>
  );
}

function FieldTools({ onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Icon name="drag" size={15} style={{ color: 'var(--color-text-muted)', opacity: 0.5, cursor: 'grab' }} />
      <button onClick={e => { e.stopPropagation(); onRemove(); }} className="btn-icon" style={{ width: 26, height: 26, background: 'transparent' }}><Icon name="trash" size={13} /></button>
    </div>
  );
}

function MockInput({ field }) {
  const t = field.type;
  if (t === 'textarea') return <div className="input" style={{ height: 64, borderRadius: 16, display: 'flex', alignItems: 'flex-start', paddingTop: 12, color: 'var(--color-input-placeholder)', fontSize: 13 }}>{field.placeholder || 'Długi tekst…'}</div>;
  if (t === 'select') return <div className="select-native" style={{ display: 'flex', alignItems: 'center', color: 'var(--color-input-placeholder)', fontSize: 13 }}>Wybierz…</div>;
  if (t === 'radio' || t === 'checkbox') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(field.options || []).map((o, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5 }}>
          <span style={{ width: 17, height: 17, borderRadius: t === 'radio' ? '50%' : 5, border: '1.5px solid var(--color-border-strong)', flexShrink: 0 }} /> {o}
        </div>
      ))}
    </div>
  );
  if (t === 'file') return <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-input-placeholder)', fontSize: 13 }}><Icon name="paperclip" size={15} /> Wybierz plik (max 10MB)</div>;
  if (t === 'date') return <div className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-input-placeholder)', fontSize: 13 }}>DD.MM.RRRR <Icon name="calendar" size={15} /></div>;
  return <div className="input" style={{ display: 'flex', alignItems: 'center', color: 'var(--color-input-placeholder)', fontSize: 13 }}>{field.placeholder || 'Tekst…'}</div>;
}

function FieldConfig({ field, update }) {
  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(155,64,224,0.18)', color: '#C77DFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={(window.DB.fieldTypes.find(t => t.type === field.type) || {}).icon || 'type'} size={15} /></span>
        <h3 style={{ fontSize: 15 }}>Konfiguracja pola</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="field-label">Etykieta</label>
          <input className="input" style={{ height: 42, fontSize: 13.5 }} value={field.label} onChange={e => update({ label: e.target.value })} />
        </div>
        {field.type !== 'section' && (
          <>
            <div>
              <label className="field-label">Placeholder</label>
              <input className="input" style={{ height: 42, fontSize: 13.5 }} value={field.placeholder || ''} onChange={e => update({ placeholder: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Podpowiedź (helper)</label>
              <input className="input" style={{ height: 42, fontSize: 13.5 }} value={field.help || ''} onChange={e => update({ help: e.target.value })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>Pole wymagane</span>
              <Toggle checked={!!field.required} onChange={v => update({ required: v })} />
            </div>
          </>
        )}
        {hasOptions && (
          <div>
            <label className="field-label">Opcje</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(field.options || []).map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="drag" size={14} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                  <input className="input" style={{ height: 38, fontSize: 13 }} value={o} onChange={e => update({ options: field.options.map((x, j) => j === i ? e.target.value : x) })} />
                  <button className="btn-icon" style={{ width: 30, height: 30 }} onClick={() => update({ options: field.options.filter((_, j) => j !== i) })}><Icon name="x" size={14} /></button>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => update({ options: [...(field.options || []), 'Nowa opcja'] })}><Icon name="plus" size={14} /> Dodaj opcję</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormSettings({ name, setName, slug, setSlug }) {
  return (
    <div style={{ padding: '0 40px 48px', maxWidth: 680 }}>
      <div className="surface" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="field-label">Nazwa formularza</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Slug URL</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#fff', borderRadius: 50, paddingLeft: 18, overflow: 'hidden' }}>
            <span style={{ color: 'var(--color-input-placeholder)', fontSize: 13.5, whiteSpace: 'nowrap' }}>leadbase.app/f/</span>
            <input value={slug} onChange={e => setSlug(e.target.value.replace(/\s+/g, '-').toLowerCase())} style={{ flex: 1, height: 48, border: 'none', outline: 'none', background: 'transparent', color: 'var(--color-input-text)', fontSize: 13.5, fontWeight: 600, paddingLeft: 2 }} />
          </div>
          <div className="field-help">Adres musi być unikalny. Generowany automatycznie z nazwy.</div>
        </div>
        <div>
          <label className="field-label">Opis formularza</label>
          <textarea className="textarea" placeholder="Krótki opis widoczny nad formularzem…" defaultValue="Zostaw dane — odezwiemy się w ciągu 24h." />
        </div>
        <div>
          <label className="field-label">Wiadomość po wysłaniu</label>
          <textarea className="textarea" defaultValue="Dziękujemy! Twoje zgłoszenie zostało wysłane. Skontaktujemy się wkrótce." />
        </div>
        <div className="divider" />
        <div>
          <label className="field-label">Autoresponder — temat</label>
          <input className="input" defaultValue="Potwierdzenie zgłoszenia — AutomiaCRM" />
        </div>
        <div>
          <label className="field-label">Autoresponder — treść</label>
          <textarea className="textarea" defaultValue={"Cześć {{imię}},\n\ndziękujemy za kontakt. Otrzymaliśmy Twoje zgłoszenie z adresu {{email}} i wrócimy z odpowiedzią najszybciej jak to możliwe.\n\nPozdrawiamy,\nZespół AutomiaCRM"} style={{ minHeight: 140 }} />
          <div className="field-help">Dostępne placeholdery: {'{{imię}}'}, {'{{email}}'}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="field-label">Domyślne przypisanie</label>
            <select className="select-native" defaultValue="u2">
              {window.DB.agents().map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Powiązanie z partnerem</label>
            <select className="select-native" defaultValue="">
              <option value="">Brak</option>
              {window.DB.users.filter(u => u.role === 'partner').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

window.FormBuilderScreen = FormBuilderScreen;
