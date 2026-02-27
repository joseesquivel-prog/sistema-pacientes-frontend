import { useState, useEffect, useCallback } from 'react'
import { pacienteService } from '../services/api'
import { useToast } from '../context/ToastContext'
import { PageHeader, Btn, Badge, Avatar, Table, Loading, Empty, Field, Input, Select, Textarea } from '../components/UI'
import Modal, { ModalActions, FormGrid, SectionLabel } from '../components/Modal'
import styles from './Pacientes.module.css'

const INITIAL_FORM = {
  nombreCompleto: '', dni: '', codigoFacil: '', fechaNacimiento: '',
  telefono: '', email: '', direccion: '',
  semanasGestacion: '', fechaUltimaMenstruacion: '',
  grupoSanguineo: '', alergias: '', observaciones: '',
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Pacientes() {
  const addToast = useToast()
  const [pacientes, setPacientes] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await pacienteService.getAll()
      setPacientes(data)
      setFiltered(data)
    } catch (e) {
      addToast('Error al cargar pacientes: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(pacientes.filter(p =>
      p.nombreCompleto?.toLowerCase().includes(q) ||
      p.dni?.toLowerCase().includes(q) ||
      p.codigoFacil?.toLowerCase().includes(q)
    ))
  }, [search, pacientes])

  function set(k) { return (e) => setForm(f => ({ ...f, [k]: e.target.value })) }

  function openNew() {
    setEditId(null)
    setForm(INITIAL_FORM)
    setModalOpen(true)
  }

  function openEdit(p) {
    setEditId(p.id)
    setForm({
      nombreCompleto: p.nombreCompleto || '',
      dni: p.dni || '',
      codigoFacil: p.codigoFacil || '',
      fechaNacimiento: p.fechaNacimiento || '',
      telefono: p.telefono || '',
      email: p.email || '',
      direccion: p.direccion || '',
      semanasGestacion: p.semanasGestacion ?? '',
      fechaUltimaMenstruacion: p.fechaUltimaMenstruacion || '',
      grupoSanguineo: p.grupoSanguineo || '',
      alergias: p.alergias || '',
      observaciones: p.observaciones || '',
    })
    setModalOpen(true)
  }

  function openDetail(p) {
    setSelected(p)
    setDetailOpen(true)
  }

  async function save() {
    if (!form.nombreCompleto || !form.dni || !form.codigoFacil) {
      addToast('Nombre, DNI y código son obligatorios', 'error')
      return
    }
    setSaving(true)
    const body = {
      ...form,
      semanasGestacion: form.semanasGestacion ? parseInt(form.semanasGestacion) : null,
      fechaNacimiento: form.fechaNacimiento || null,
      fechaUltimaMenstruacion: form.fechaUltimaMenstruacion || null,
      telefono: form.telefono || null,
      email: form.email || null,
      direccion: form.direccion || null,
      grupoSanguineo: form.grupoSanguineo || null,
      alergias: form.alergias || null,
      observaciones: form.observaciones || null,
    }
    try {
      if (editId) {
        await pacienteService.update(editId, body)
        addToast('Paciente actualizada correctamente', 'success')
      } else {
        await pacienteService.create(body)
        addToast('Paciente registrada correctamente', 'success')
      }
      setModalOpen(false)
      load()
    } catch (e) {
      addToast('Error al guardar: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function del(id) {
    if (!confirm('¿Eliminar esta paciente? Esta acción no se puede deshacer.')) return
    try {
      await pacienteService.delete(id)
      addToast('Paciente eliminada', 'success')
      load()
    } catch (e) {
      addToast('Error al eliminar: ' + e.message, 'error')
    }
  }

  return (
    <div className={styles.root}>
      <PageHeader
        title="Pacientes"
        subtitle="Gestiona el registro de pacientes ginecológicas"
        action={<Btn variant="primary" onClick={openNew}>+ Nueva paciente</Btn>}
      />

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Buscar por nombre, DNI o código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Btn variant="ghost" size="sm" onClick={load}>↻ Actualizar</Btn>
      </div>

      <div className={styles.tableCard}>
        {loading
          ? <Loading />
          : filtered.length === 0
            ? <Empty icon="👩" title="Sin resultados" subtitle={search ? 'Prueba otra búsqueda' : 'Registra la primera paciente'} />
            : <Table headers={['Código', 'Paciente', 'DNI', 'Gestación', 'Teléfono', 'Registro', 'Acciones']}>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td><Badge variant="teal">{p.codigoFacil}</Badge></td>
                    <td>
                      <div className={styles.nameCell}>
                        <Avatar name={p.nombreCompleto} size="sm" />
                        <span>{p.nombreCompleto}</span>
                      </div>
                    </td>
                    <td className={styles.mono}>{p.dni}</td>
                    <td>
                      {p.semanasGestacion
                        ? <Badge variant="rose">🤰 {p.semanasGestacion} sem</Badge>
                        : <span className={styles.muted}>—</span>}
                    </td>
                    <td>{p.telefono || <span className={styles.muted}>—</span>}</td>
                    <td className={styles.muted}>{formatDate(p.fechaRegistro)}</td>
                    <td>
                      <div className={styles.actions}>
                        <Btn variant="secondary" size="sm" onClick={() => openDetail(p)}>👁</Btn>
                        <Btn variant="ghost" size="sm" onClick={() => openEdit(p)}>✏️</Btn>
                        <Btn variant="danger" size="sm" onClick={() => del(p.id)}>🗑</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
        }
      </div>

      {/* Form Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Editar Paciente' : 'Nueva Paciente'}
        subtitle="Completa la información de la paciente"
        size="lg"
      >
        <SectionLabel>Datos personales</SectionLabel>
        <FormGrid>
          <Field label="Nombre completo" required><Input placeholder="Nombre y apellidos" value={form.nombreCompleto} onChange={set('nombreCompleto')} /></Field>
          <Field label="DNI" required><Input placeholder="00000000" value={form.dni} onChange={set('dni')} /></Field>
          <Field label="Código fácil" required><Input placeholder="GIN-001" value={form.codigoFacil} onChange={set('codigoFacil')} /></Field>
          <Field label="Fecha de nacimiento"><Input type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} /></Field>
          <Field label="Teléfono"><Input type="tel" placeholder="987 654 321" value={form.telefono} onChange={set('telefono')} /></Field>
          <Field label="Email"><Input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={set('email')} /></Field>
          <Field label="Dirección" span={2}><Input placeholder="Calle, número, distrito" value={form.direccion} onChange={set('direccion')} /></Field>
        </FormGrid>

        <SectionLabel>Datos obstétricos</SectionLabel>
        <FormGrid>
          <Field label="Semanas de gestación"><Input type="number" min="0" max="45" placeholder="0" value={form.semanasGestacion} onChange={set('semanasGestacion')} /></Field>
          <Field label="Fecha última menstruación"><Input type="date" value={form.fechaUltimaMenstruacion} onChange={set('fechaUltimaMenstruacion')} /></Field>
          <Field label="Grupo sanguíneo">
            <Select value={form.grupoSanguineo} onChange={set('grupoSanguineo')}>
              <option value="">Seleccionar...</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
            </Select>
          </Field>
          <Field label="Alergias"><Input placeholder="Ninguna / Penicilina..." value={form.alergias} onChange={set('alergias')} /></Field>
          <Field label="Observaciones" span={2}><Textarea placeholder="Observaciones adicionales..." value={form.observaciones} onChange={set('observaciones')} /></Field>
        </FormGrid>

        <ModalActions>
          <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>
            {saving ? '...' : '💾 Guardar paciente'}
          </Btn>
        </ModalActions>
      </Modal>

      {/* Detail Modal */}
      {selected && (
        <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Ficha de paciente" subtitle="Información completa" size="lg">
          <div className={styles.detailHeader}>
            <Avatar name={selected.nombreCompleto} size="lg" />
            <div>
              <h3 className={styles.detailName}>{selected.nombreCompleto}</h3>
              <div className={styles.detailBadges}>
                <Badge variant="teal">{selected.codigoFacil}</Badge>
                <Badge variant="slate">DNI: {selected.dni}</Badge>
                {selected.grupoSanguineo && <Badge variant="rose">🩸 {selected.grupoSanguineo}</Badge>}
                {selected.semanasGestacion && <Badge variant="amber">🤰 {selected.semanasGestacion} semanas</Badge>}
              </div>
            </div>
          </div>

          <SectionLabel>Datos personales</SectionLabel>
          <div className={styles.detailGrid}>
            {[
              ['Fecha de nacimiento', formatDate(selected.fechaNacimiento)],
              ['Teléfono', selected.telefono],
              ['Email', selected.email],
              ['Dirección', selected.direccion],
              ['Fecha de registro', formatDate(selected.fechaRegistro)],
            ].map(([label, val]) => (
              <div key={label} className={styles.detailItem}>
                <span className={styles.detailLabel}>{label}</span>
                <span className={styles.detailVal}>{val || '—'}</span>
              </div>
            ))}
          </div>

          <SectionLabel>Datos obstétricos</SectionLabel>
          <div className={styles.detailGrid}>
            {[
              ['Semanas de gestación', selected.semanasGestacion ? selected.semanasGestacion + ' semanas' : null],
              ['Última menstruación', formatDate(selected.fechaUltimaMenstruacion)],
              ['Grupo sanguíneo', selected.grupoSanguineo],
              ['Alergias', selected.alergias],
            ].map(([label, val]) => (
              <div key={label} className={styles.detailItem}>
                <span className={styles.detailLabel}>{label}</span>
                <span className={styles.detailVal}>{val || '—'}</span>
              </div>
            ))}
            {selected.observaciones && (
              <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                <span className={styles.detailLabel}>Observaciones</span>
                <span className={styles.detailVal}>{selected.observaciones}</span>
              </div>
            )}
          </div>

          <ModalActions>
            <Btn variant="ghost" onClick={() => setDetailOpen(false)}>Cerrar</Btn>
            <Btn variant="secondary" onClick={() => { setDetailOpen(false); openEdit(selected) }}>✏️ Editar</Btn>
          </ModalActions>
        </Modal>
      )}
    </div>
  )
}
