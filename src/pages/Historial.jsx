import { useState, useEffect, useCallback } from 'react'
import { historialService, pacienteService } from '../services/api'
import { useToast } from '../context/ToastContext'
import { PageHeader, Btn, Badge, Avatar, Table, Loading, Empty, Field, Input, Select, Textarea } from '../components/UI'
import Modal, { ModalActions, FormGrid, SectionLabel } from '../components/Modal'
import styles from './Historial.module.css'

function formatDateTime(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Historial() {
  const addToast = useToast()
  const [historial, setHistorial] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    pacienteId: '', semanasGestacion: '', peso: '',
    presionArterial: '', sintomas: '', diagnostico: '',
    tratamiento: '', observaciones: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [h, p] = await Promise.all([
        historialService.getAll(),
        pacienteService.getAll(),
      ])
      setHistorial(h.sort((a, b) => new Date(b.fechaConsulta) - new Date(a.fechaConsulta)))
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
    setForm({ pacienteId: '', semanasGestacion: '', peso: '', presionArterial: '', sintomas: '', diagnostico: '', tratamiento: '', observaciones: '' })
    setModalOpen(true)
  }

  async function save() {
    if (!form.pacienteId) { addToast('Selecciona una paciente', 'error'); return }
    setSaving(true)
    try {
      await historialService.create({
        paciente: { id: parseInt(form.pacienteId) },
        semanasGestacion: form.semanasGestacion ? parseInt(form.semanasGestacion) : null,
        peso: form.peso ? parseFloat(form.peso) : null,
        presionArterial: form.presionArterial || null,
        sintomas: form.sintomas || null,
        diagnostico: form.diagnostico || null,
        tratamiento: form.tratamiento || null,
        observaciones: form.observaciones || null,
      })
      addToast('Consulta registrada correctamente', 'success')
      setModalOpen(false)
      load()
    } catch (e) {
      addToast('Error: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function del(id) {
    if (!confirm('¿Eliminar este registro del historial?')) return
    try {
      await historialService.delete(id)
      addToast('Registro eliminado', 'success')
      load()
    } catch (e) {
      addToast('Error: ' + e.message, 'error')
    }
  }

  return (
    <div className={styles.root}>
      <PageHeader
        title="Historial Médico"
        subtitle="Registra y consulta el historial clínico de las pacientes"
        action={<Btn variant="primary" onClick={openNew}>+ Nueva consulta</Btn>}
      />

      <div className={styles.header}>
        <Btn variant="ghost" size="sm" onClick={load}>↻ Actualizar</Btn>
      </div>

      <div className={styles.tableCard}>
        {loading
          ? <Loading />
          : historial.length === 0
            ? <Empty icon="📋" title="Sin registros" subtitle="Registra la primera consulta médica" />
            : <Table headers={['Fecha', 'Paciente', 'Semanas', 'Peso', 'Presión', 'Diagnóstico', 'Acciones']}>
                {historial.map(h => (
                  <tr key={h.id}>
                    <td className={styles.muted}>{formatDateTime(h.fechaConsulta)}</td>
                    <td>
                      <div className={styles.nameCell}>
                        <Avatar name={h.paciente?.nombreCompleto} size="xs" />
                        <span>{h.paciente?.nombreCompleto || '—'}</span>
                      </div>
                    </td>
                    <td>
                      {h.semanasGestacion
                        ? <Badge variant="teal">🤰 {h.semanasGestacion} sem</Badge>
                        : <span className={styles.muted}>—</span>}
                    </td>
                    <td>{h.peso ? `${h.peso} kg` : <span className={styles.muted}>—</span>}</td>
                    <td>{h.presionArterial || <span className={styles.muted}>—</span>}</td>
                    <td className={styles.diagnostico}>{h.diagnostico || <span className={styles.muted}>—</span>}</td>
                    <td>
                      <div className={styles.actions}>
                        <Btn variant="secondary" size="sm" onClick={() => { setSelected(h); setDetailOpen(true) }}>👁 Ver</Btn>
                        <Btn variant="danger" size="sm" onClick={() => del(h.id)}>🗑</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
        }
      </div>

      {/* New Consulta Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Consulta" subtitle="Registra los datos de la consulta médica" size="lg">
        <FormGrid>
          <Field label="Paciente" required span={2}>
            <Select value={form.pacienteId} onChange={set('pacienteId')}>
              <option value="">Seleccionar paciente...</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.nombreCompleto} — {p.codigoFacil}</option>
              ))}
            </Select>
          </Field>
        </FormGrid>

        <SectionLabel>Datos clínicos</SectionLabel>
        <FormGrid>
          <Field label="Semanas de gestación"><Input type="number" min="0" max="45" placeholder="0" value={form.semanasGestacion} onChange={set('semanasGestacion')} /></Field>
          <Field label="Peso (kg)"><Input type="number" step="0.1" placeholder="60.5" value={form.peso} onChange={set('peso')} /></Field>
          <Field label="Presión arterial"><Input placeholder="120/80" value={form.presionArterial} onChange={set('presionArterial')} /></Field>
          <Field label="Síntomas"><Input placeholder="Describe los síntomas" value={form.sintomas} onChange={set('sintomas')} /></Field>
          <Field label="Diagnóstico" span={2}><Textarea placeholder="Diagnóstico médico..." value={form.diagnostico} onChange={set('diagnostico')} /></Field>
          <Field label="Tratamiento" span={2}><Textarea placeholder="Tratamiento indicado..." value={form.tratamiento} onChange={set('tratamiento')} /></Field>
          <Field label="Observaciones" span={2}><Textarea placeholder="Observaciones adicionales..." value={form.observaciones} onChange={set('observaciones')} /></Field>
        </FormGrid>
        <ModalActions>
          <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>{saving ? '...' : '💾 Guardar consulta'}</Btn>
        </ModalActions>
      </Modal>

      {/* Detail Modal */}
      {selected && (
        <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle de consulta" subtitle={formatDateTime(selected.fechaConsulta)} size="lg">
          <div className={styles.detailHeader}>
            <Avatar name={selected.paciente?.nombreCompleto} size="md" />
            <div>
              <h3 className={styles.detailName}>{selected.paciente?.nombreCompleto || '—'}</h3>
              <div className={styles.detailBadges}>
                {selected.semanasGestacion && <Badge variant="teal">🤰 {selected.semanasGestacion} semanas</Badge>}
                {selected.peso && <Badge variant="amber">⚖️ {selected.peso} kg</Badge>}
                {selected.presionArterial && <Badge variant="slate">💓 {selected.presionArterial}</Badge>}
              </div>
            </div>
          </div>

          <SectionLabel>Datos clínicos</SectionLabel>
          <div className={styles.detailGrid}>
            {[
              ['Síntomas', selected.sintomas],
              ['Diagnóstico', selected.diagnostico],
              ['Tratamiento', selected.tratamiento],
              ['Observaciones', selected.observaciones],
            ].map(([label, val]) => val ? (
              <div key={label} className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                <span className={styles.detailLabel}>{label}</span>
                <span className={styles.detailVal}>{val}</span>
              </div>
            ) : null)}
          </div>

          <ModalActions>
            <Btn variant="ghost" onClick={() => setDetailOpen(false)}>Cerrar</Btn>
          </ModalActions>
        </Modal>
      )}
    </div>
  )
}
