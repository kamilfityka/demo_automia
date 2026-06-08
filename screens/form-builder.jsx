/* ============================================================
   /forms/new + /forms/:id/edit — kreator (mobile)
   ============================================================ */
function FormBuilderScreen({ id }) {
  const { nav } = useRouter();
  const toast = useToast();
  const editing = !!id;
  const existing = editing ? window.DB.formById(id) : null;
  const [tab, setTab] = React.useState('build');
  const [fields, setFields] = React.useState(window.DB.builderSchema.map(f => ({ ...f })));
  const [configId, setConfigId] = React.useState(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [name, setName] = React.useState(existing ? existing.name : 'Nowy formularz');
  const [slug, setSlug] = React.useState(existing ? existing.slug : 'nowy-formularz');

  const config = fields.find(f => f.id === configId);

  const addField = (type) => {
    const ft = window.DB.fieldTypes.find(t => t.type === type);
    const nf = {
      id: 'fld' + Date.now() + Math.random().toString(36).slice(2, 5),
      type, label: ft.label, placeholder: '', required: false, help: '',
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Opcja 1', 'Opcja 2'] : undefined,
    };
    setFields(f => [...f, nf]);
    setPickerOpen(false);
    setConfigId(nf.id);
  };
  const update = (patch) => setFields(f => f.map(x => x.id === configId ? { ...x, ...patch } : x));
  const remove = (fid) => { setFields(f => f.filter(x => x.id !== fid)); if (configId === fid) setConfigId(null); };
  const move = (idx, dir) => setFields(f => {
    const j = idx + dir;
    if (j < 0 || j >= f.length) return f;
    const c = [...f]; const [m] = c.splice(idx, 1); c.splice(j, 0, m); return c;
  });

  return (
    <>
      <TopBar onBack={() => nav('/forms')} title={editing ? 'Edycja' : 'Nowy formularz'} right={
        <Menu title="Formularz" trigger={<button className="btn-icon"><Icon name="more" size={18} /></button>}
          items={[
            { icon: 'rocket', label: 'Opublikuj', onClick: () => { toast('Formularz opublikowany'); nav('/forms'); } },
            { icon: 'eye', label: 'Podgląd', onClick: () => nav('/f/' + slug) },
            { icon: 'check', label: 'Zapisz szkic', onClick: () => toast('Szkic zapisany') },
          ]} />
      } />

      <div style={{ padding: '12px var(--screen-pad) 6px' }}>
        <Segmented full value={tab} onChange={setTab} options={[{ value: 'build', label: 'Pola', icon: 'forms' }, { value: 'settings', label: 'Ustawienia', icon: 'settings' }]} />
      </div>

      {tab === 'build' ? (
        <div style={{ padding: '10px var(--screen-pad) 28px', display: 'flex', flexDirection: 'column', gap: 11 }}>
          {fields.map((f, i) => (
            <FieldRow key={f.id} field={f} idx={i} total={fields.length}
              onConfig={() => setConfigId(f.id)} onRemove={() => remove(f.id)} onMove={move} />
          ))}
          {fields.length === 0 && (
            <div className="muted" style={{ textAlign: 'center', padding: '48px 20px', border: '2px dashed var(--color-border)', borderRadius: 16 }}>
              <Icon name="forms" size={28} style={{ opacity: 0.5, marginBottom: 10 }} /><br />
              Brak pól — dodaj pierwsze poniżej
            </div>
          )}
          <button className="btn btn-secondary" onClick={() => setPickerOpen(true)} style={{ width: '100%', marginTop: 4 }}>
            <Icon name="plus" size={17} /> Dodaj pole
          </button>
        </div>
      ) : (
        <FormSettings name={name} setName={setName} slug={slug} setSlug={setSlug} />
      )}

      {/* field type picker */}
      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Dodaj pole">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingBottom: 16 }}>
          {window.DB.fieldTypes.map(ft => (
            <button key={ft.type} className="press" onClick={() => addField(ft.type)} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '13px 13px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', color: '#fff',
            }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(155,64,224,0.18)', color: '#C77DFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ft.icon} size={16} /></span>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{ft.label}</span>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* field config */}
      <BottomSheet open={!!config} onClose={() => setConfigId(null)} title="Konfiguracja pola"
        footer={<button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setConfigId(null)}><Icon name="check" size={16} /> Gotowe</button>}>
        {config && <FieldConfig field={config} update={update} onRemove={() => remove(config.id)} />}
      </BottomSheet>
    </>
  );
}

/* a field shown in the build list */
function FieldRow({ field, idx, total, onConfig, onRemove, onMove }) {
  const ft = window.DB.fieldTypes.find(t => t.type === field.type) || {};
  const isSection = field.type === 'section';
  return (
    <div className="surface" style={{ padding: 13, display: 'flex', alignItems: 'center', gap: 12, borderStyle: isSection ? 'dashed' : 'solid' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button className="btn-icon" style={{ width: 30, height: 26, borderRadius: 8 }} disabled={idx === 0} onClick={() => onMove(idx, -1)}><Icon name="chevron-up" size={15} /></button>
        <button className="btn-icon" style={{ width: 30, height: 26, borderRadius: 8 }} disabled={idx === total - 1} onClick={() => onMove(idx, 1)}><Icon name="chevron-down" size={15} /></button>
      </div>
      <div className="click" onClick={onConfig} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-soft)', color: '#C77DFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ft.icon || 'type'} size={16} /></span>
        <div style={{ minWidth: 0 }}>
          <div className="trunc" style={{ fontWeight: 600, fontSize: 14.5 }}>{field.label} {field.required && <span style={{ color: '#FF8080' }}>*</span>}</div>
          <div className="muted" style={{ fontSize: 12 }}>{isSection ? 'Sekcja' : ft.label}</div>
        </div>
      </div>
      <button className="btn-icon" style={{ width: 38, height: 38 }} onClick={onConfig}><Icon name="edit" size={16} /></button>
    </div>
  );
}

function FieldConfig({ field, update, onRemove }) {
  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);
  return (
    <div style={{ paddingTop: 2 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 8 }}>
        <div>
          <label className="field-label">Etykieta</label>
          <input className="input" value={field.label} onChange={e => update({ label: e.target.value })} />
        </div>
        {field.type !== 'section' && (
          <>
            <div>
              <label className="field-label">Placeholder</label>
              <input className="input" value={field.placeholder || ''} onChange={e => update({ placeholder: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Podpowiedź (helper)</label>
              <input className="input" value={field.help || ''} onChange={e => update({ help: e.target.value })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 2px' }}>
              <span style={{ fontSize: 15, fontWeight: 500 }}>Pole wymagane</span>
              <Toggle checked={!!field.required} onChange={v => update({ required: v })} />
            </div>
          </>
        )}
        {hasOptions && (
          <div>
            <label className="field-label">Opcje</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {(field.options || []).map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input className="input" style={{ height: 46 }} value={o} onChange={e => update({ options: field.options.map((x, j) => j === i ? e.target.value : x) })} />
                  <button className="btn-icon" onClick={() => update({ options: field.options.filter((_, j) => j !== i) })}><Icon name="x" size={16} /></button>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => update({ options: [...(field.options || []), 'Nowa opcja'] })}><Icon name="plus" size={15} /> Dodaj opcję</button>
            </div>
          </div>
        )}
        <button className="btn btn-ghost" onClick={onRemove} style={{ width: '100%', color: '#FF8080', marginTop: 4 }}><Icon name="trash" size={16} /> Usuń pole</button>
      </div>
    </div>
  );
}

function FormSettings({ name, setName, slug, setSlug }) {
  return (
    <div style={{ padding: '10px var(--screen-pad) 28px' }}>
      <div className="surface" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="field-label">Nazwa formularza</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Slug URL</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 50, paddingLeft: 16, overflow: 'hidden' }}>
            <span style={{ color: 'var(--color-input-placeholder)', fontSize: 13.5, whiteSpace: 'nowrap' }}>…/f/</span>
            <input value={slug} onChange={e => setSlug(e.target.value.replace(/\s+/g, '-').toLowerCase())} style={{ flex: 1, minWidth: 0, height: 52, border: 'none', outline: 'none', background: 'transparent', color: 'var(--color-input-text)', fontSize: 16, fontWeight: 600, paddingLeft: 2 }} />
          </div>
          <div className="field-help">Adres musi być unikalny.</div>
        </div>
        <div>
          <label className="field-label">Opis formularza</label>
          <textarea className="textarea" defaultValue="Zostaw dane — odezwiemy się w ciągu 24h." />
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
          <div className="field-help">Dostępne: {'{{imię}}'}, {'{{email}}'}</div>
        </div>
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
  );
}

window.FormBuilderScreen = FormBuilderScreen;
