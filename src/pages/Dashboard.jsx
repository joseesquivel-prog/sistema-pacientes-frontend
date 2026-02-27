import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { pacienteService, citaService, historialService } from '../services/api'
import { StatCard, Card, Loading, Empty, Badge, Avatar, Btn } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function formatTime(str) {
  const d = new Date(str)
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState([])
  const [citas, setCitas] = useState([])
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      pacienteService.getAll(),
      citaService.getAll().catch(() => []),
      historialService.getAll().catch(() => []),
    ]).then(([p, c, h]) => {
      setPacientes(p)
      setCitas(c)
      setHistorial(h)
    }).finally(() => setLoading(false))
  }, [])

  const gestantes = pacientes.filter(p => p.semanasGestacion && p.semanasGestacion > 0)
  const now = new Date()
  const upcomingCitas = citas
    .filter(c => new Date(c.fechaHora) >= now)
    .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
    .slice(0, 5)
  const recentPacientes = [...pacientes].reverse().slice(0, 6)

  const citaEstadoVariant = { PROGRAMADA: 'amber', CONFIRMADA: 'teal', CANCELADA: 'rose', COMPLETADA: 'slate' }

  return (
    <div className={styles.root}>
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.welcomeTitle}>
            Buenos días, <em>{user?.username}</em> 👋
          </h1>
          <p className={styles.welcomeSub}>Aquí tienes el resumen del sistema</p>
        </div>
        <div className={styles.date}>
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="👩" value={loading ? '…' : pacientes.length} label="Pacientes registradas" />
        <StatCard icon="📅" value={loading ? '…' : citas.length} label="Total de citas" accent="teal" />
        <StatCard icon="🤰" value={loading ? '…' : gestantes.length} label="Pacientes gestantes" accent="rose" />
        <StatCard icon="📋" value={loading ? '…' : historial.length} label="Consultas registradas" accent="amber" />
      </div>

      <div className={styles.grid}>
        {/* Recent Patients */}
        <Card noPad>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Últimas pacientes</span>
            <Btn variant="secondary" size="sm" onClick={() => navigate('/pacientes')}>Ver todas →</Btn>
          </div>
          {loading
            ? <Loading />
            : recentPacientes.length === 0
              ? <Empty icon="👩" title="Sin pacientes" subtitle="Registra la primera paciente" />
              : <div className={styles.patientList}>
                  {recentPacientes.map(p => (
                    <div key={p.id} className={styles.patientRow} onClick={() => navigate('/pacientes')}>
                      <Avatar name={p.nombreCompleto} size="sm" />
                      <div className={styles.patientInfo}>
                        <span className={styles.patientName}>{p.nombreCompleto}</span>
                        <span className={styles.patientMeta}>{p.codigoFacil} · DNI {p.dni}</span>
                      </div>
                      {p.semanasGestacion
                        ? <Badge variant="rose">🤰 {p.semanasGestacion} sem</Badge>
                        : <Badge variant="slate">—</Badge>
                      }
                    </div>
                  ))}
                </div>
          }
        </Card>

        {/* Upcoming Appointments */}
        <Card noPad>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Próximas citas</span>
            <Btn variant="secondary" size="sm" onClick={() => navigate('/citas')}>Ver todas →</Btn>
          </div>
          {loading
            ? <Loading />
            : upcomingCitas.length === 0
              ? <Empty icon="📅" title="Sin citas próximas" subtitle="No hay citas programadas" />
              : <div className={styles.citasList}>
                  {upcomingCitas.map(c => {
                    const d = new Date(c.fechaHora)
                    return (
                      <div key={c.id} className={styles.citaRow}>
                        <div className={styles.citaDate}>
                          <span className={styles.citaDay}>{d.getDate()}</span>
                          <span className={styles.citaMon}>{MONTHS[d.getMonth()]}</span>
                        </div>
                        <div className={styles.citaInfo}>
                          <span className={styles.citaPatient}>{c.paciente?.nombreCompleto || 'Paciente'}</span>
                          <span className={styles.citaMeta}>{c.motivo || 'Sin motivo'} · {formatTime(c.fechaHora)}</span>
                        </div>
                        <Badge variant={citaEstadoVariant[c.estado] || 'slate'}>{c.estado}</Badge>
                      </div>
                    )
                  })}
                </div>
          }
        </Card>
      </div>
    </div>
  )
}
