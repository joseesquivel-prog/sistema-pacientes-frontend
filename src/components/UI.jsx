import styles from './UI.module.css'

/* ── BUTTON ── */
export function Btn({ variant = 'primary', size = 'md', children, className = '', ...props }) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${styles[`size-${size}`]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/* ── BADGE ── */
export function Badge({ variant = 'teal', children }) {
  return <span className={`${styles.badge} ${styles[`badge-${variant}`]}`}>{children}</span>
}

/* ── CARD ── */
export function Card({ children, className = '', noPad = false }) {
  return (
    <div className={`${styles.card} ${noPad ? styles.noPad : ''} ${className}`}>
      {children}
    </div>
  )
}

/* ── PAGE HEADER ── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSub}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

/* ── STAT CARD ── */
export function StatCard({ icon, value, label, accent = 'teal' }) {
  return (
    <div className={`${styles.statCard} ${styles[`accent-${accent}`]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statValue}>{value ?? '—'}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

/* ── SPINNER ── */
export function Spinner({ size = 'md' }) {
  return <span className={`${styles.spinner} ${styles[`spinner-${size}`]}`} />
}

/* ── LOADING STATE ── */
export function Loading({ text = 'Cargando...' }) {
  return (
    <div className={styles.loading}>
      <Spinner />
      <span>{text}</span>
    </div>
  )
}

/* ── EMPTY STATE ── */
export function Empty({ icon = '📭', title, subtitle }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      {subtitle && <p className={styles.emptySub}>{subtitle}</p>}
    </div>
  )
}

/* ── TABLE ── */
export function Table({ headers, children }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

/* ── AVATAR ── */
export function Avatar({ name, size = 'sm' }) {
  const initials = name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
  return <div className={`${styles.avatarEl} ${styles[`avatar-${size}`]}`}>{initials}</div>
}

/* ── FORM FIELD ── */
export function Field({ label, required, children, span = 1 }) {
  return (
    <div className={styles.field} style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}>
      <label className={styles.fieldLabel}>{label}{required && <span className={styles.req}>*</span>}</label>
      {children}
    </div>
  )
}

export function Input(props) {
  return <input className={styles.input} {...props} />
}

export function Select({ children, ...props }) {
  return <select className={styles.input} {...props}>{children}</select>
}

export function Textarea(props) {
  return <textarea className={`${styles.input} ${styles.textarea}`} {...props} />
}
