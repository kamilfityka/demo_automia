/* ============================================================
   /dashboard (mobile)
   ============================================================ */
function KpiCard({ kpi, icon, accent, suffix, sub }) {
  return (
    <div className="surface" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: accent.bg, color: accent.fg }}><Icon name={icon} size={18} /></span>
        {sub}
      </div>
      <div>
        <div className="tnum" style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 28, lineHeight: 1, letterSpacing: '-0.02em' }}>{kpi.value}{suffix}</div>
        <div className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>{kpi.label}</div>
      </div>
    </div>
  );
}

function TrendPill({ value }) {
  const up = value >= 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700,
      color: up ? '#57E8A8' : '#FF8080', background: up ? 'rgba(54,179,126,0.16)' : 'rgba(255,77,77,0.16)',
      borderRadius: 50, padding: '4px 8px',
    }}>
      <Icon name={up ? 'arrow-up' : 'arrow-down'} size={12} stroke={2.4} />{Math.abs(value)}
    </span>
  );
}

function StatusBarChart() {
  const data = window.DB.statusCounts();
  const max = Math.max(...data.map(d => d.count), 1);
  const colorFor = { nowy: '#7BA7FF', wtoku: '#FFD166', oczekuje: '#C77DFF', wygrany: '#57E8A8', przegrany: '#FF8080', zamkniety: 'rgba(255,255,255,0.4)' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {data.map(d => (
        <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 76, fontSize: 12.5, color: 'var(--color-text-soft)', flexShrink: 0 }}>{d.label}</div>
          <div style={{ flex: 1, height: 22, background: 'rgba(255,255,255,0.05)', borderRadius: 50, overflow: 'hidden' }}>
            <div style={{ width: `${(d.count / max) * 100}%`, height: '100%', borderRadius: 50, background: colorFor[d.key], minWidth: d.count ? 22 : 0, boxShadow: `0 0 14px ${colorFor[d.key]}55`, transition: 'width 0.6s cubic-bezier(.3,.8,.3,1)' }} />
          </div>
          <div className="tnum" style={{ width: 22, textAlign: 'right', fontWeight: 700, fontSize: 13.5 }}>{d.count}</div>
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
      <TopBar brand title="Pulpit" right={
        <button className="btn-icon" onClick={() => nav('/settings/account')} style={{ padding: 0, background: 'transparent' }}>
          <Avatar user={user} size={36} />
        </button>
      } />

      <div style={{ padding: '4px var(--screen-pad) 28px', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
        <div style={{ paddingTop: 8 }}>
          <h1 style={{ fontSize: 23 }}>Cześć, {user.name.split(' ')[0]} 👋</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>Oto co dzieje się dzisiaj.</p>
        </div>

        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <KpiCard kpi={k.newToday} icon="inbox" accent={{ bg: 'rgba(64,96,224,0.2)', fg: '#7BA7FF' }} sub={<TrendPill value={k.newToday.trend} />} />
          <KpiCard kpi={k.open} icon="activity" accent={{ bg: 'rgba(255,176,32,0.16)', fg: '#FFD166' }} />
          <KpiCard kpi={k.responseTime} suffix="h" icon="clock" accent={{ bg: 'rgba(155,64,224,0.2)', fg: '#C77DFF' }} />
          <KpiCard kpi={k.wonMonth} icon="trend-up" accent={{ bg: 'rgba(54,179,126,0.18)', fg: '#57E8A8' }} sub={<span className="badge badge-wygrany" style={{ height: 22, fontSize: 11 }}>{k.wonMonth.conv}%</span>} />
        </div>

        {/* chart */}
        <div className="surface" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontSize: 16 }}>Leady wg statusu</h3>
            <span className="chip" style={{ height: 28, fontSize: 12 }}><Icon name="leads" size={13} /> {window.DB.leads.length}</span>
          </div>
          <StatusBarChart />
        </div>

        {/* recent leads */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 2px' }}>
            <h3 style={{ fontSize: 16 }}>Ostatnie leady</h3>
            <button className="muted click" onClick={() => nav('/leads')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)' }}>
              Wszystkie <Icon name="chevron-right" size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recent.map((l) => {
              const agent = window.DB.userById(l.assignedTo);
              return (
                <div key={l.id} onClick={() => nav('/leads/' + l.id)} className="surface press click" style={{ padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar user={agent} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="trunc" style={{ fontWeight: 600, fontSize: 14.5 }}>{l.name}</div>
                    <div className="muted trunc" style={{ fontSize: 12.5 }}>{l.company}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <StatusBadge status={l.status} />
                    <span className="muted tnum" style={{ fontSize: 11.5 }}>{l.created.slice(5, 10).replace('-', '.')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* activity */}
        <div className="surface" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
            <Icon name="activity" size={17} style={{ color: '#C77DFF' }} />
            <h3 style={{ fontSize: 16 }}>Ostatnia aktywność</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {window.DB.recentActivity.slice(0, 5).map((a, i, arr) => {
              const u = window.DB.userById(a.user);
              return (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '9px 0' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {u ? <Avatar user={u} size={30} /> : <span className="avatar" style={{ width: 30, height: 30, fontSize: 12, background: 'rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}><Icon name="settings" size={14} /></span>}
                    {i < arr.length - 1 && <div style={{ position: 'absolute', left: '50%', top: 36, bottom: -10, width: 1, background: 'var(--color-border)', transform: 'translateX(-50%)' }} />}
                  </div>
                  <div style={{ minWidth: 0, paddingTop: 1 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}><strong style={{ fontWeight: 600 }}>{u ? u.name.split(' ')[0] : 'System'}</strong> <span className="soft">{a.text}</span></div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <FAB icon="plus" label="Nowy lead" onClick={() => nav('/leads')} />
    </>
  );
}

window.DashboardScreenM = DashboardScreen;
