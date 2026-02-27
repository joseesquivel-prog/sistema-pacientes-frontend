import { useEffect } from 'react'
import styles from './Modal.module.css'

export default function Modal({ open, onClose, title, subtitle, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`${styles.modal} ${styles[size]}`} role="dialog" aria-modal>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}

export function ModalActions({ children }) {
  return <div className={styles.actions}>{children}</div>
}

export function FormGrid({ children, cols = 2 }) {
  return (
    <div className={styles.formGrid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {children}
    </div>
  )
}

export function SectionLabel({ children }) {
  return <div className={styles.sectionLabel}>{children}</div>
}
