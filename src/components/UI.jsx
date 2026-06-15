import { ESTADO_CONFIG } from '../lib/firebase'

export const Badge = ({ estado }) => {
  const cfg = ESTADO_CONFIG[estado] || { label: estado, color: '#999' }
  return (
    <span style={{
      background: cfg.color + '22', color: cfg.color,
      border: `1px solid ${cfg.color}44`, borderRadius: 6,
      padding: '2px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{cfg.label}</span>
  )
}

export const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{
    background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
    padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    cursor: onClick ? 'pointer' : 'default', ...style,
  }}>{children}</div>
)

export const Btn = ({ children, onClick, variant = 'primary', small, disabled, style }) => {
  const variants = {
    primary: { background: '#1E3A5F', color: '#fff' },
    success: { background: '#10B981', color: '#fff' },
    danger:  { background: '#EF4444', color: '#fff' },
    ghost:   { background: '#F3F4F6', color: '#374151' },
    outline: { background: 'transparent', color: '#1E3A5F', border: '1.5px solid #1E3A5F' },
  }
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      border: 'none', borderRadius: 8, fontWeight: 600, transition: 'opacity .15s',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1,
      padding: small ? '6px 14px' : '10px 20px', fontSize: small ? 13 : 14,
      ...variants[variant], ...style,
    }}>{children}</button>
  )
}

export const Input = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>}
    <input style={{
      padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB',
      fontSize: 14, outline: 'none', width: '100%',
    }} {...props} />
  </div>
)

export const Toast = ({ toast }) => {
  if (!toast) return null
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: toast.type === 'ok' ? '#10B981' : toast.type === 'error' ? '#EF4444' : '#F59E0B',
      color: '#fff', padding: '12px 24px', borderRadius: 12,
      fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,.2)',
      zIndex: 999, whiteSpace: 'nowrap',
    }}>
      {toast.type === 'ok' ? '✓' : '⚠️'} {toast.msg}
    </div>
  )
}

export const Stat = ({ label, value, color = '#1E3A5F' }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{label}</div>
  </div>
)

export const fmtDate = (s) => {
  if (!s) return '—'
  const str = typeof s === 'string' ? s : s.toDate?.().toISOString() || ''
  const [y, m, d] = str.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export const calcDias = (inicio, fin) => {
  if (!inicio || !fin) return 0
  const d1 = new Date(inicio), d2 = new Date(fin)
  let dias = 0
  for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) dias++
  }
  return dias
}

export const today = () => new Date().toISOString().slice(0, 10)
