/* ============================================================
   UI primitives (MOBILE-FIRST)
   Avatar · Badges · Toasts · BottomSheet · Modal · SlideOver
   · Menu (action sheet) · FAB · EmptyState · Segmented · Toggle
   ============================================================ */

function initials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
}

function shade(hex, amt) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function Avatar({ user, name, color, size = 34 }) {
  const n = user ? user.name : name;
  const c = user ? user.color : (color || '#9B40E0');
  return (
    <span className="avatar" style={{
      width: size, height: size, fontSize: size * 0.4,
      background: `linear-gradient(135deg, ${c}, ${shade(c, -28)})`,
      boxShadow: `0 2px 8px ${c}44`,
    }}>{initials(n)}</span>
  );
}

function StatusBadge({ status, withDot = true }) {
  const s = window.DB.statusByKey(status) || { label: status, cls: 'badge-zamkniety' };
  return <span className={`badge ${s.cls}`}>{withDot && <span className="dot" />}{s.label}</span>;
}

function RoleBadge({ role }) {
  const map = { admin: ['Admin', 'badge-admin'], agent: ['Handlowiec', 'badge-agent'], partner: ['Partner', 'badge-partner'] };
  const [label, cls] = map[role] || [role, 'badge-zamkniety'];
  return <span className={`badge ${cls}`}>{label}</span>;
}

/* ---------- Bottom sheet (core overlay) ---------- */
function BottomSheet({ open, onClose, title, children, footer, height }) {
  React.useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <OverlayPortal>
      <div className="sheet-backdrop" onMouseDown={onClose} />
      <div className="sheet" style={height ? { height } : null}>
        <div className="sheet-grip" />
        {title && (
          <div className="sheet-head">
            <h3 style={{ fontSize: 18 }}>{title}</h3>
            <button className="btn-icon" onClick={onClose} style={{ width: 38, height: 38 }} aria-label="Zamknij"><Icon name="x" size={18} /></button>
          </div>
        )}
        <div className="sheet-body" style={{ paddingBottom: footer ? 8 : 'calc(18px + var(--safe-bottom))' }}>{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </OverlayPortal>
  );
}

/* ---------- Modal — renders as a bottom sheet on the phone ---------- */
function Modal({ open, onClose, title, children, footer }) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title} footer={footer}>
      <div style={{ paddingTop: 2 }}>{children}</div>
    </BottomSheet>
  );
}

/* ---------- SlideOver — tall sheet that hosts its own header/footer ---------- */
function SlideOver({ open, onClose, children }) {
  React.useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <OverlayPortal>
      <div className="sheet-backdrop" onMouseDown={onClose} />
      <div className="sheet" style={{ height: '90%' }}>
        <div className="sheet-grip" />
        {children}
      </div>
    </OverlayPortal>
  );
}

/* ---------- Toasts ---------- */
const ToastCtx = React.createContext(() => {});
function useToast() { return React.useContext(ToastCtx); }

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const push = React.useCallback((msg, kind = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      {toasts.length > 0 && (
        <OverlayPortal>
          <div style={{
            position: 'absolute', left: 14, right: 14, bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 14px)',
            zIndex: 300, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch', pointerEvents: 'none',
          }}>
            {toasts.map(t => (
              <div key={t.id} className="toast-in" style={{
                display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'auto',
                background: 'var(--color-bg-elevated)',
                border: `1px solid ${t.kind === 'error' ? 'rgba(255,77,77,0.5)' : 'rgba(54,179,126,0.5)'}`,
                borderRadius: 16, padding: '13px 16px', boxShadow: 'var(--shadow-pop)', color: '#fff', fontSize: 14, fontWeight: 500,
              }}>
                <span style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: t.kind === 'error' ? 'rgba(255,77,77,0.2)' : 'rgba(54,179,126,0.2)',
                  color: t.kind === 'error' ? '#FF8080' : '#57E8A8',
                }}><Icon name={t.kind === 'error' ? 'x' : 'check'} size={16} /></span>
                <span style={{ lineHeight: 1.35 }}>{t.msg}</span>
              </div>
            ))}
          </div>
        </OverlayPortal>
      )}
    </ToastCtx.Provider>
  );
}

/* ---------- Menu — opens an action sheet ---------- */
function Menu({ trigger, items, title }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <span onClick={e => { e.stopPropagation(); setOpen(true); }}>{trigger}</span>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={title || 'Akcje'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12 }}>
          {items.filter(it => !it.divider).map((it, i) => (
            <button key={i} className="press" onClick={e => { e.stopPropagation(); setOpen(false); it.onClick && it.onClick(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
                padding: '14px 16px', borderRadius: 14, border: '1px solid var(--color-border)',
                background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
                color: it.danger ? '#FF8080' : '#fff', fontSize: 15, fontWeight: 500, fontFamily: 'var(--font-body)',
              }}>
              {it.icon && (
                <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: it.danger ? 'rgba(255,77,77,0.15)' : 'var(--gradient-soft)', color: it.danger ? '#FF8080' : '#C77DFF' }}>
                  <Icon name={it.icon} size={17} />
                </span>
              )}
              {it.label}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}

/* ---------- Floating action button ---------- */
function FAB({ icon = 'plus', onClick, hasNav = true, label }) {
  return (
    <OverlayPortal>
      <button className={'fab' + (hasNav ? '' : ' no-nav')} onClick={onClick} aria-label={label || 'Dodaj'} style={{ pointerEvents: 'auto' }}>
        <Icon name={icon} size={26} stroke={2.4} />
      </button>
    </OverlayPortal>
  );
}

/* ---------- Empty state ---------- */
function EmptyState({ icon = 'inbox', title, text, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 72, height: 72, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--gradient-soft)', border: '1px solid var(--color-border)', color: '#C77DFF',
      }}><Icon name={icon} size={30} /></div>
      <h3 style={{ fontSize: 18 }}>{title}</h3>
      <p className="muted" style={{ maxWidth: 320, fontSize: 14 }}>{text}</p>
      {action}
    </div>
  );
}

/* ---------- Copy button ---------- */
function CopyButton({ value, size = 38 }) {
  const toast = useToast();
  const [done, setDone] = React.useState(false);
  return (
    <button className="btn-icon" style={{ width: size, height: size }} title="Kopiuj"
      onClick={e => {
        e.stopPropagation();
        navigator.clipboard && navigator.clipboard.writeText(value);
        setDone(true); toast('Skopiowano do schowka');
        setTimeout(() => setDone(false), 1500);
      }}>
      <Icon name={done ? 'check' : 'copy'} size={16} />
    </button>
  );
}

/* ---------- Segmented control ---------- */
function Segmented({ value, options, onChange, full }) {
  return (
    <div style={{ display: 'flex', padding: 4, gap: 4, borderRadius: 50, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', width: full ? '100%' : undefined }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            flex: full ? 1 : undefined,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 38, padding: '0 16px',
            borderRadius: 50, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 14,
            background: active ? 'var(--gradient)' : 'transparent',
            color: active ? '#fff' : 'var(--color-text-muted)',
            boxShadow: active ? '0 4px 14px rgba(155,64,224,0.4)' : 'none', transition: 'all 0.18s ease',
          }}>
            {o.icon && <Icon name={o.icon} size={16} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Toggle switch ---------- */
function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: 50, height: 30, borderRadius: 50, border: 'none', cursor: 'pointer', padding: 3, flexShrink: 0,
      background: checked ? 'var(--gradient)' : 'rgba(255,255,255,0.16)',
      display: 'flex', justifyContent: checked ? 'flex-end' : 'flex-start', transition: 'background 0.2s ease',
    }}>
      <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', transition: 'all 0.2s ease' }} />
    </button>
  );
}

/* ---------- Checkbox ---------- */
function Checkbox({ checked, onChange, size = 22 }) {
  return (
    <span onClick={e => { e.stopPropagation(); onChange(); }} className="click" style={{
      width: size, height: size, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: checked ? 'none' : '1.5px solid var(--color-border-strong)',
      background: checked ? 'var(--gradient)' : 'transparent', transition: 'all 0.12s ease',
    }}>{checked && <Icon name="check" size={14} stroke={3} />}</span>
  );
}

Object.assign(window, {
  initials, shade, Avatar, StatusBadge, RoleBadge,
  ToastProvider, useToast, BottomSheet, Modal, SlideOver, Menu, FAB,
  EmptyState, CopyButton, Segmented, Toggle, Checkbox,
});
