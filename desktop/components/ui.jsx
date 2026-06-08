/* ============================================================
   UI primitives — Avatar, StatusBadge, Toasts, Modal, etc.
   ============================================================ */

function initials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
}

function Avatar({ user, name, color, size = 34 }) {
  const n = user ? user.name : name;
  const c = user ? user.color : (color || '#9B40E0');
  return (
    <span className="avatar" style={{
      width: size, height: size,
      fontSize: size * 0.4,
      background: `linear-gradient(135deg, ${c}, ${shade(c, -28)})`,
      boxShadow: `0 2px 8px ${c}44`,
    }}>{initials(n)}</span>
  );
}

function shade(hex, amt) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function StatusBadge({ status, withDot = true }) {
  const s = window.DB.statusByKey(status) || { label: status, cls: 'badge-zamkniety' };
  return (
    <span className={`badge ${s.cls}`}>
      {withDot && <span className="dot" />}
      {s.label}
    </span>
  );
}

function RoleBadge({ role }) {
  const map = { admin: ['Admin', 'badge-admin'], agent: ['Handlowiec', 'badge-agent'], partner: ['Partner', 'badge-partner'] };
  const [label, cls] = map[role] || [role, 'badge-zamkniety'];
  return <span className={`badge ${cls}`}>{label}</span>;
}

/* ---------- Toasts ---------- */
const ToastCtx = React.createContext(() => {});
function useToast() { return React.useContext(ToastCtx); }

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const push = React.useCallback((msg, kind = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 9000, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
        {toasts.map(t => (
          <div key={t.id} className="toast-in" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-bg-elevated)',
            border: `1px solid ${t.kind === 'error' ? 'rgba(255,77,77,0.5)' : 'rgba(54,179,126,0.5)'}`,
            borderRadius: 14, padding: '14px 18px', minWidth: 260, maxWidth: 380,
            boxShadow: 'var(--shadow-pop)', color: '#fff', fontSize: 14, fontWeight: 500,
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: t.kind === 'error' ? 'rgba(255,77,77,0.2)' : 'rgba(54,179,126,0.2)',
              color: t.kind === 'error' ? '#FF8080' : '#57E8A8',
            }}><Icon name={t.kind === 'error' ? 'x' : 'check'} size={16} /></span>
            <span style={{ lineHeight: 1.4 }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Modal ---------- */
function Modal({ open, onClose, title, children, width = 480, footer }) {
  React.useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onMouseDown={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 8000,
      background: 'rgba(10, 8, 40, 0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="modal-in" onMouseDown={e => e.stopPropagation()} style={{
        width, maxWidth: '100%', maxHeight: '88vh', overflow: 'hidden',
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)', borderRadius: 24,
        boxShadow: 'var(--shadow-pop)', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 26px 16px' }}>
          <h3 style={{ fontSize: 19 }}>{title}</h3>
          <button className="btn-icon" onClick={onClose} style={{ width: 34, height: 34 }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: '0 26px 8px', overflowY: 'auto' }}>{children}</div>
        {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '18px 26px 24px' }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Slide-over (right drawer) ---------- */
function SlideOver({ open, onClose, children, width = 460 }) {
  React.useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 7500,
      pointerEvents: open ? 'auto' : 'none',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(10,8,40,0.55)', backdropFilter: 'blur(4px)',
        opacity: open ? 1 : 0, transition: 'opacity 0.25s ease',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width, maxWidth: '94vw',
        background: 'var(--color-bg-surface)', borderLeft: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-pop)', transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(.4,.8,.3,1)', display: 'flex', flexDirection: 'column',
      }}>{children}</div>
    </div>
  );
}

/* ---------- Dropdown menu ---------- */
function Menu({ trigger, items, align = 'right' }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <span onClick={e => { e.stopPropagation(); setOpen(o => !o); }}>{trigger}</span>
      {open && (
        <div className="menu-in" style={{
          position: 'absolute', top: 'calc(100% + 6px)', [align]: 0, zIndex: 100,
          background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
          borderRadius: 14, boxShadow: 'var(--shadow-pop)', padding: 6, minWidth: 180,
        }}>
          {items.map((it, i) => it.divider ? (
            <div key={i} className="divider" style={{ margin: '6px 4px' }} />
          ) : (
            <button key={i} onClick={e => { e.stopPropagation(); setOpen(false); it.onClick && it.onClick(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: 'transparent', color: it.danger ? '#FF8080' : 'var(--color-text-soft)',
                fontSize: 13.5, fontFamily: 'var(--font-body)', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {it.icon && <Icon name={it.icon} size={15} />}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Empty state ---------- */
function EmptyState({ icon = 'inbox', title, text, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 76, height: 76, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--gradient-soft)', border: '1px solid var(--color-border)', color: '#C77DFF',
      }}><Icon name={icon} size={32} /></div>
      <h3 style={{ fontSize: 18 }}>{title}</h3>
      <p className="muted" style={{ maxWidth: 380, fontSize: 14 }}>{text}</p>
      {action}
    </div>
  );
}

/* ---------- Tooltip-free copy button ---------- */
function CopyButton({ value, size = 32 }) {
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
      <Icon name={done ? 'check' : 'copy'} size={15} />
    </button>
  );
}

/* ---------- Segmented control ---------- */
function Segmented({ value, options, onChange }) {
  return (
    <div style={{ display: 'inline-flex', padding: 4, gap: 4, borderRadius: 50, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)' }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 16px',
            borderRadius: 50, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-head)',
            fontWeight: 600, fontSize: 13.5,
            background: active ? 'var(--gradient)' : 'transparent',
            color: active ? '#fff' : 'var(--color-text-muted)',
            boxShadow: active ? '0 4px 14px rgba(155,64,224,0.4)' : 'none',
            transition: 'all 0.18s ease',
          }}>
            {o.icon && <Icon name={o.icon} size={15} />}
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
      width: 46, height: 26, borderRadius: 50, border: 'none', cursor: 'pointer', padding: 3,
      background: checked ? 'var(--gradient)' : 'rgba(255,255,255,0.16)',
      display: 'flex', justifyContent: checked ? 'flex-end' : 'flex-start',
      transition: 'background 0.2s ease',
    }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', transition: 'all 0.2s ease' }} />
    </button>
  );
}

Object.assign(window, {
  initials, shade, Avatar, StatusBadge, RoleBadge,
  ToastProvider, useToast, Modal, SlideOver, Menu, EmptyState, CopyButton, Segmented, Toggle,
});
