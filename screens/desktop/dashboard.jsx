/* ============================================================
   /dashboard
   ============================================================ */
function KpiCard({ kpi, icon, accent, suffix, sub }) {
  return (
    <div className="surface lift" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 138 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          width: 42, height: 42, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: accent.bg, color: accent.fg,
        }}><Icon name={icon} size={20} /></span>
        {sub}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 34, lineHeight: 1, letterSpacing: '-0.02em' }} className="tnum">
          {kpi.value}{suffix}
        </div>
        <div className="muted" style={{ fontSize: 13.5, marginTop: 8 }}>{kpi.label}</div>
      </div>
    </div>
  );
}

function TrendPill({ value }) {
  const up = value >= 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12.5, fontWeight: 700,
      color: up ? '#57E8A8' : '#FF8080', background: up ? 'rgba(54,179,126,0.16)' : 'rgba(255,77,77,0.16)',
      borderRadius: 50, padding: '4px 9px',
    }}>
      <Icon name={up ? 'arrow-up' : 'arrow-down'} size={13} stroke={2.4} />{Math.abs(value)}
    </span>
  );
}

function StatusBarChart() {
  const data = window.DB.statusCounts();
  const max = Math.max(...data.map(d => d.count), 1);
  const colorFor = {
    nowy: '#7BA7FF', wtoku: '#FFD166', oczekuje: '#C77DFF', wygrany: '#57E8A8', przegrany: '#FF8080', zamkniety: 'rgba(255,255,255,0.4)',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {data.map(d => (
        <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 86, fontSize: 13, color: 'var(--color-text-soft)', flexShrink: 0 }}>{d.label}</div>
          <div style={{ flex: 1, height: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 50, overflow: 'hidden' }}>
            <div style={{
              width: `${(d.count / max) * 100}%`, height: '100%', borderRadius: 50,
              background: colorFor[d.key], minWidth: d.count ? 24 : 0,
              boxShadow: `0 0 16px ${colorFor[d.key]}55`, transition: 'width 0.6s cubic-bezier(.3,.8,.3,1)',
            }} />
          </div>
          <div className="tnum" style={{ width: 28, textAlign: 'right', fontWeight: 700, fontSize: 14 }}>{d.count}</div>
        </div>
      ))}
    </div>
  );
}

function DashboardScreen({ user }) {
  const { nav } = useRouter();
  const recent = window.DB.leads.slice(0, 5);
  const k = window.DB.kpis;

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Przegląd KPI i ostatniej aktywności w systemie."
        right={<>
          <button className="btn btn-secondary btn-sm" onClick={() => nav('/forms')}><Icon name="forms" size={16} /> Formularze</button>
          <button className="btn btn-primary btn-sm" onClick={() => nav('/leads')}><Icon name="plus" size={16} /> Nowy lead</button>
        </>}
      />

      <div style={{ padding: '0 40px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          <KpiCard kpi={k.newToday} icon="inbox" accent={{ bg: 'rgba(64,96,224,0.2)', fg: '#7BA7FF' }} sub={<TrendPill value={k.newToday.trend} />} />
          <KpiCard kpi={k.open} icon="activity" accent={{ bg: 'rgba(255,176,32,0.16)', fg: '#FFD166' }} />
          <KpiCard kpi={k.responseTime} suffix="h" icon="clock" accent={{ bg: 'rgba(155,64,224,0.2)', fg: '#C77DFF' }} />
          <KpiCard kpi={k.wonMonth} icon="trend-up" accent={{ bg: 'rgba(54,179,126,0.18)', fg: '#57E8A8' }}
            sub={<span className="badge badge-wygrany" style={{ height: 24 }}>{k.wonMonth.conv}% konwersji</span>} />
        </div>

        {/* main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* chart */}
            <div className="surface" style={{ padding: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontSize: 17 }}>Leady według statusu</h3>
                <span className="chip" style={{ height: 28 }}><Icon name="leads" size={14} /> {window.DB.leads.length} łącznie</span>
              </div>
              <StatusBarChart />
            </div>

            {/* recent leads */}
            <div className="surface" style={{ padding: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <h3 style={{ fontSize: 17 }}>Ostatnie leady</h3>
                <button className="muted click" onClick={() => nav('/leads')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)' }}>
                  Zobacz wszystkie <Icon name="chevron-right" size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recent.map((l, i) => {
                  const agent = window.DB.userById(l.assignedTo);
                  const form = window.DB.formById(l.formId);
                  return (
                    <div key={l.id} onClick={() => nav('/leads/' + l.id)} className="click" style={{
                      display: 'grid', gridTemplateColumns: '1.6fr 110px 1.2fr 1fr 90px', alignItems: 'center', gap: 12,
                      padding: '13px 10px', borderTop: i ? '1px solid var(--color-border)' : 'none', borderRadius: 10,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                        <div className="muted" style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.company}</div>
                      </div>
                      <StatusBadge status={l.status} />
                      <div className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form ? form.name : '—'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <Avatar user={agent} size={26} />
                        <span style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent ? agent.name.split(' ')[0] : '—'}</span>
                      </div>
                      <div className="muted tnum" style={{ fontSize: 12.5, textAlign: 'right' }}>{l.created.slice(5, 10).replace('-', '.')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* activity feed */}
          <div className="surface" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 20 }}>
              <Icon name="activity" size={18} style={{ color: '#C77DFF' }} />
              <h3 style={{ fontSize: 17 }}>Ostatnia aktywność</h3>
            </div>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {window.DB.recentActivity.map((a, i) => {
                const u = window.DB.userById(a.user);
                return (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', position: 'relative' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {u ? <Avatar user={u} size={32} /> : (
                        <span className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}><Icon name="settings" size={15} /></span>
                      )}
                      {i < window.DB.recentActivity.length - 1 && <div style={{ position: 'absolute', left: '50%', top: 38, bottom: -12, width: 1, background: 'var(--color-border)', transform: 'translateX(-50%)' }} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.45 }}>
                        <strong style={{ fontWeight: 600 }}>{u ? u.name.split(' ')[0] : 'System'}</strong> <span className="soft">{a.text}</span>
                      </div>
                      <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{a.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.DashboardScreenD = DashboardScreen;
