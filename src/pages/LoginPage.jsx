import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', rol: 'MEDICO' })
  const { login, registro } = useAuth()
  const addToast = useToast()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleLogin(e) {
    e.preventDefault()
    if (!form.username || !form.password) { addToast('Completa todos los campos', 'error'); return }
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch {
      addToast('Credenciales incorrectas. Verifica usuario y contraseña.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!form.username || !form.password) { addToast('Completa todos los campos', 'error'); return }
    setLoading(true)
    try {
      await registro(form.username, form.password, form.rol)
      addToast('¡Cuenta creada! Ahora inicia sesión.', 'success')
      setMode('login')
    } catch (err) {
      addToast(err.message || 'Error al registrar', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.bg}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />
      </div>

      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.leftLogo}>
            <span className={styles.leftLogoIcon}>🌸</span>
          </div>
          <h1 className={styles.leftTitle}>Sistema de Gestión<br /><em>Ginecológica</em></h1>
          <p className={styles.leftSub}>Administra pacientes, citas médicas e historial clínico desde un solo lugar.</p>
          <div className={styles.features}>
            {['Gestión completa de pacientes', 'Seguimiento obstétrico', 'Historial médico digital', 'Programación de citas'].map(f => (
              <div key={f} className={styles.feature}>
                <span className={styles.featureDot} />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.cardLogo}>
            <div className={styles.cardLogoIcon}>🌸</div>
            <div>
              <div className={styles.cardLogoName}>SistemaPacientes</div>
              <div className={styles.cardLogoSub}>Ginecología & Obstetricia</div>
            </div>
          </div>

          <h2 className={styles.cardTitle}>
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h2>
          <p className={styles.cardSub}>
            {mode === 'login' ? 'Ingresa tus credenciales' : 'Completa los datos para registrarte'}
          </p>

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className={styles.form}>
            <div className={styles.field}>
              <label>Usuario</label>
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
              />
            </div>
            <div className={styles.field}>
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
            {mode === 'register' && (
              <div className={styles.field}>
                <label>Rol</label>
                <select value={form.rol} onChange={set('rol')}>
                  <option value="MEDICO">Médico</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="RECEPCIONISTA">Recepcionista</option>
                </select>
              </div>
            )}

            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading
                ? <span className={styles.spinner} />
                : mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </form>

          <p className={styles.toggle}>
            {mode === 'login'
              ? <>¿No tienes cuenta? <button onClick={() => setMode('register')}>Regístrate aquí</button></>
              : <>¿Ya tienes cuenta? <button onClick={() => setMode('login')}>Inicia sesión</button></>
            }
          </p>
        </div>
      </div>
    </div>
  )
}
