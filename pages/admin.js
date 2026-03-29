import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import styles from '../styles/Admin.module.css';

// Password is passed from server via getServerSideProps (never exposed to client bundle)
export async function getServerSideProps() {
  return {
    props: {
      adminPassword: process.env.ADMIN_PASSWORD || 'saiah2025',
    },
  };
}

const STATUS_LABEL = {
  pending:   { label: 'Pending',   emoji: '⏳', cls: 'pending'   },
  confirmed: { label: 'Confirmed', emoji: '✅', cls: 'confirmed' },
  declined:  { label: 'Declined',  emoji: '❌', cls: 'declined'  },
};

export default function Admin({ adminPassword }) {
  const [authed, setAuthed]           = useState(false);
  const [pw, setPw]                   = useState('');
  const [pwError, setPwError]         = useState('');
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [tab, setTab]                 = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rsvp');
      setData(await res.json());
    } catch { console.error('Fetch failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) fetchData(); }, [authed, fetchData]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pw === adminPassword) setAuthed(true);
    else setPwError('Incorrect password');
  };

  const setStatus = async (id, status) => {
    setActionLoading(id);
    try {
      await fetch('/api/rsvp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      await fetchData();
    } finally { setActionLoading(null); }
  };

  const archive = async (id) => {
    if (!confirm('Archive this entry? It will be moved to the archived tab.')) return;
    setActionLoading(id);
    try {
      await fetch('/api/rsvp', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await fetchData();
    } finally { setActionLoading(null); }
  };

  const allRows = tab === 'archived'
    ? (data?.archived || [])
    : (data?.rsvps || []).filter(r => tab === 'all' || r.status === tab);

  const filtered = allRows.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!authed) return (
    <>
      <Head><title>Admin — Saiah&apos;s Baptism</title></Head>
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <div className={styles.loginFloral}>🌸</div>
          <h1>Admin Access</h1>
          <p>Enter the password to manage RSVPs</p>
          <form onSubmit={handleLogin}>
            <input className={styles.input} type="password"
              placeholder="Password" value={pw}
              onChange={e => setPw(e.target.value)} autoFocus />
            {pwError && <p className={styles.error}>{pwError}</p>}
            <button type="submit" className={styles.loginBtn}>Enter</button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Head><title>Admin — Saiah&apos;s Baptism</title></Head>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>RSVP Manager</h1>
            <p>Saiah Alisbo · Baptism · April 21</p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>⟳ Refresh</button>
        </header>

        <main className={styles.main}>
          <div className={styles.statsGrid}>
            {[
              { key: 'all',       label: 'Total',       num: data?.total,     cls: '' },
              { key: 'confirmed', label: '✅ Confirmed', num: data?.confirmed, cls: styles.statConfirmed },
              { key: 'pending',   label: '⏳ Pending',   num: data?.pending,   cls: styles.statPending },
              { key: 'declined',  label: '❌ Declined',  num: data?.declined,  cls: styles.statDeclined },
            ].map(s => (
              <div key={s.key} className={`${styles.statCard} ${s.cls}`}
                data-active={tab === s.key} onClick={() => setTab(s.key)}>
                <span className={styles.statNum}>{s.num ?? '—'}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.tabs}>
            {['all','confirmed','pending','declined','archived'].map(t => (
              <button key={t} className={styles.tab} data-active={tab === t} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                <span className={styles.tabCount}>
                  {t === 'all' ? (data?.total ?? 0) :
                   t === 'archived' ? (data?.archived?.length ?? 0) :
                   (data?.[t] ?? 0)}
                </span>
              </button>
            ))}
          </div>

          <div className={styles.searchRow}>
            <input className={styles.searchInput} type="text"
              placeholder="🔍  Search name or email…"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
          </div>

          <div className={styles.tableWrap}>
            {loading && !data ? (
              <p className={styles.empty}>Loading…</p>
            ) : filtered.length === 0 ? (
              <p className={styles.empty}>{search ? 'No results found.' : 'No entries here yet. 🌸'}</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Gmail</th><th>Status</th><th>Submitted</th>
                    {tab !== 'archived' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const s = STATUS_LABEL[r.status] || STATUS_LABEL.pending;
                    const busy = actionLoading === r.id;
                    return (
                      <tr key={r.id} data-status={r.status}>
                        <td className={styles.tdNum}>{i + 1}</td>
                        <td className={styles.tdName}>{r.name}</td>
                        <td className={styles.tdEmail}>{r.email}</td>
                        <td><span className={`${styles.statusBadge} ${styles[s.cls]}`}>{s.emoji} {s.label}</span></td>
                        <td className={styles.tdDate}>
                          {new Date(r.submittedAt).toLocaleDateString('en-PH', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                        {tab !== 'archived' && (
                          <td>
                            <div className={styles.actions}>
                              {r.status !== 'confirmed' && (
                                <button className={`${styles.actionBtn} ${styles.btnConfirm}`}
                                  onClick={() => setStatus(r.id, 'confirmed')} disabled={busy}>
                                  {busy ? '…' : '✅ Confirm'}
                                </button>
                              )}
                              {r.status !== 'declined' && (
                                <button className={`${styles.actionBtn} ${styles.btnDecline}`}
                                  onClick={() => setStatus(r.id, 'declined')} disabled={busy}>
                                  {busy ? '…' : '❌ Decline'}
                                </button>
                              )}
                              {r.status === 'confirmed' && (
                                <button className={`${styles.actionBtn} ${styles.btnPending}`}
                                  onClick={() => setStatus(r.id, 'pending')} disabled={busy}>
                                  ⏳ Reset
                                </button>
                              )}
                              <button className={`${styles.actionBtn} ${styles.btnArchive}`}
                                onClick={() => archive(r.id)} disabled={busy}>
                                🗂 Archive
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {(data?.confirmed ?? 0) > 0 && (
            <div className={styles.allNames}>
              <h3>✅ Confirmed Guests ({data.confirmed})</h3>
              <div className={styles.nameCloud}>
                {(data?.rsvps || []).filter(r => r.status === 'confirmed').map((r, i) => (
                  <span key={i} className={styles.nameTag}>🌸 {r.name}</span>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className={styles.footer}>
          <a href="/">← Back to RSVP Page</a>
          <span>Saiah Alisbo · Admin</span>
        </footer>
      </div>
    </>
  );
}
