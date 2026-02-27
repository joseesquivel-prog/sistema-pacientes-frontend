import { useState, useEffect, useCallback } from 'react'
import { citaService, pacienteService } from '../services/api'
import { useToast } from '../context/ToastContext'
import { PageHeader, Btn, Badge, Loading, Empty, Field, Input, Select, Textarea } from '../components/UI'
import Modal, { ModalActions, FormGrid } from '../components/Modal'
import styles from './Citas.module.css'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const ESTADO_VARIANT = { PROGRAMADA: 'amber', CONFIRMADA: 'teal', CANCELADA: 'rose', COMPLETADA: 'slate' }

function formatDateTime(str) {
  if (!str) return '—'
  const d = new Date(str)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

export default function Citas() {
  const addToast = useToast()
  const [citas, setCitas] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({
    pacienteId: '', fechaHora: '', motivo: '', estado: 'PROGRAMADA', observaciones: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [c, p] = await Promise.all([
        citaService.getAll(),
        pacienteService.getAll(),
      ])
      setCitas(c.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)))
      setPacientes(p)
    } catch (e) {
      addToast('Error al cargar: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { load() }, [load])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  function openNew() {
    const now = new Date()
    now.setMinutes(0, 0, 0)
    setForm({
      pacienteId: '',
      fechaHora: now.toISOString().slice(0, 16),
      motivo: '',
      estado: 'PROGRAMADA',
      observaciones: '',
    })
    setModalOpen(true)
  }

  async function save() {
    if (!form.pacienteId || !form.fechaHora) {
      addToast('Selecciona una paciente y fecha', 'error')
      return
    }
    setSaving(true)
    try {
      await citaService.create({
        paciente: { id: parseInt(form.pacienteId) },
        fechaHora: form.fechaHora,
        motivo: form.motivo || null,
        estado: form.estado,
        observaciones: form.observaciones || null,
      })
      addToast('Cita registrada correctamente', 'success')
      setModalOpen(false)
      load()
    } catch (e) {
      addToast('Error: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function del(id) {
    if (!confirm('¿Cancelar / eliminar esta cita?')) return
    try {
      await citaService.delete(id)
      addToast('Cita eliminada', 'success')
      load()
    } catch (e) {
      addToast('Error: ' + e.message, 'error')
    }
  }

  const now = new Date()
  const displayed = citas.filter(c => {
    if (filter === 'upcoming') return new Date(c.fechaHora) >= now
    if (filter === 'past') return new Date(c.fechaHora) < now
    return true
  })

  return (
    <div className={styles.root}>
      <PageHeader
        title="Citas médicas"
        subtitle="Programa y gestiona las citas de las pacientes"
        action={<Btn variant="primary" onClick={openNew}>+ Nueva cita</Btn>}
      />

      <div className={styles.tabs}>
        {[['all','Todas'], ['upcoming','Próximas'], ['past','Pasadas']].map(([val, label]) => (
          <button
            key={val}
            className={`${styles.tab} ${filter === val ? styles.activeTab : ''}`}
            onClick={() => setFilter(val)}
          >
            {label}
          </button>
        ))}
        <Btn variant="ghost" size="sm" onClick={load} style={{ marginLeft: 'auto' }}>↻ Actualizar</Btn>
      </div>

      {loading
        ? <Loading />
        : displayed.length === 0
          ? <Empty icon="📅" title="Sin citas" subtitle="No hay citas en esta categoría" />
          : <div className={styles.citaGrid}>
              {displayed.map(c => {
                const d = new Date(c.fechaHora)
                const isPast = d < now
                return (
                  <div key={c.id} className={`${styles.citaCard} ${isPast ? styles.past : ''}`}>
                    <div className={styles.citaDateBox}>
                      <span className={styles.citaDay}>{d.getDate()}</span>
                      <span className={styles.citaMon}>{MONTHS[d.getMonth()]}</span>
                      <span className={styles.citaYear}>{d.getFullYear()}</span>
                    </div>
                    <div className={styles.citaBody}>
                      <div className={styles.citaPatientRow}>
                        <span className={styles.citaPatient}>{c.paciente?.nombreCompleto || 'Paciente'}</span>
                        <Badge variant={ESTADO_VARIANT[c.estado] || 'slate'}>{c.estado}</Badge>
                      </div>
                      <p className={styles.citaMotivo}>{c.motivo || 'Sin motivo especificado'}</p>
                      <p className={styles.citaTime}>🕐 {formatDateTime(c.fechaHora)}</p>
                      {c.observaciones && <p className={styles.citaObs}>📝 {c.observaciones}</p>}
                    </div>
                    <button className={styles.citaDeleteBtn} onClick={() => del(c.id)} title="Eliminar cita">✕</button>
                  </div>
                )
              })}
            </div>
      }

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva Cita"
        subtitle="Programa una cita médica para una paciente"
        size="md"
      >
        <FormGrid>
          <Field label="Paciente" required span={2}>
            <Select value={form.pacienteId} onChange={set('pacienteId')}>
              <option value="">Seleccionar paciente...</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.nombreCompleto} — {p.codigoFacil}</option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha y hora" required>
            <Input type="datetime-local" value={form.fechaHora} onChange={set('fechaHora')} />
          </Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={set('estado')}>
              <option value="PROGRAMADA">Programada</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="COMPLETADA">Completada</option>
            </Select>
          </Field>
          <Field label="Motivo de la consulta" span={2}>
            <Input placeholder="Control prenatal, ecografía, consulta..." value={form.motivo} onChange={set('motivo')} />
          </Field>
          <Field label="Observaciones" span={2}>
            <Textarea placeholder="Notas adicionales..." value={form.observaciones} onChange={set('observaciones')} />
          </Field>
        </FormGrid>
        <ModalActions>
          <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>
            {saving ? '...' : '💾 Guardar cita'}
          </Btn>
        </ModalActions>
      </Modal>
    </div>
  )
}
