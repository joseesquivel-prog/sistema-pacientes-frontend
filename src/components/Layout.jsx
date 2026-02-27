import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '◈', end: true },
  { to: '/pacientes', label: 'Pacientes', icon: '♀' },
  { to: '/citas', label: 'Citas', icon: '◷' },
  { to: '/historial', label: 'Historial Médico', icon: '⊞' },
]

function initials(name) {
  if (!name) return '?'
  return name.split('').slice(0, 2).join('').toUpperCase()
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ''}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>🌸</div>
            {!collapsed && (
              <div className={styles.brandText}>
                <span className={styles.brandName}>SistemaPacientes</span>
                <span className={styles.brandSub}>Ginecología</span>
              </div>
            )}
          </div>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expandir' : 'Colapsar'}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        <nav className={styles.nav}>
          {!collapsed && <span className={styles.navLabel}>Menú principal</span>}
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel2}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{initials(user?.username)}</div>
            {!collapsed && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.username}</span>
                <span className={styles.userRole}>{user?.rol}</span>
              </div>
            )}
            <button className={styles.logoutBtn} onClick={handleLogout} title="Cerrar sesión">
              ⏻
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.content}>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
