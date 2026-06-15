import { useState } from 'react'
import { Card, Badge, Btn, fmtDate } from '../components/UI'
import { ESTADO_CONFIG, ROLE_LABELS } from '../lib/firebase'

export default function PanelGestion({ solicitudes, empleado, onSelect, onAccion }) {
  const [filterEstado, setFilterEstado] = useState('todas')
  const [filterArea,   setFilterArea]   = useState('todas')
  const [search,       setSearch]       = useState('')

  const filtered = solicitudes.filter(s => {
    const estadoOk = filterEstado === 'todas' || s.estado === filterEstado
    const areaOk   = filterArea   === 'todas' || s.empleado_area === filterArea
    const searchOk = !search || (s.empleado_nombre || '').toLowerCase().includes(search.toLowerCase())
    return estadoOk && areaOk && searchOk
  })

  const pendientes = solicitudes.filter(s => {
    if (empleado.rol === 'encargado_taller')    return s.estado === 'pendiente_encargado'
    if (empleado.rol === 'jefe_zona')           return s.estado === 'pendiente_jefe_zona'
    if (empleado.rol === 'responsable_oficina') return s.estado === 'pendiente_responsable'
    return s.estado.startsWith('pendiente')
  })

  const getAccionesRapidas = (s) => {
    const { rol } = empleado
    if (rol === 'encargado_taller'    && s.estado === 'pendiente_encargado')
      return [{ key: 'aprobar_encargado',   label: '✓', variant: 'success' }, { key: 'rechazar_encargado',   label: '✗', variant: 'danger' }]
    if (rol === 'jefe_zona'           && s.estado === 'pendiente_jefe_zona')
      return [{ key: 'aprobar_jefe_zona',   label: '✓', variant: 'success' }, { key: 'rechazar_jefe_zona',   label: '✗', variant: 'danger' }]
    if (rol === 'responsable_oficina' && s.estado === 'pendiente_responsable')
      return [{ key: 'aprobar_responsable', label: '✓', variant: 'success' }, { key: 'rechazar_responsable', label: '✗', variant: 'danger' }]
    if (rol === 'admin' && s.estado.startsWith('pendiente'))
      return [{ key: 'aprobar_responsable', label: '✓', variant: 'success' }, { key: 'rechazar_responsable', label: '✗', variant: 'danger' }]
    return []
  }

  const sel = { padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, background: '#fff', flex: 1 }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#1E3A5F' }}>🗂️ Panel de gestión</div>
        {pendientes.length > 0 && (
          <span style={{ background: '#EF4444', color: '#fff', borderRadius: 99, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
            {pendientes.length} pendientes
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input style={{ ...sel, flex: 2 }} placeholder="Buscar empleado…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={sel} value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="todas">Todos los estados</option>
          {Object.entries(ESTADO_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select style={sel} value={filterArea} onChange={e => setFilterArea(e.target.value)}>
          <option value="todas">Todas las áreas</option>
          <option value="taller">Taller</option>
          <option value="oficina">Oficina</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Total',      value: solicitudes.length,                                        color: '#1E3A5F' },
          { label: 'Pendientes', value: pendientes.length,                                         color: '#F59E0B' },
          { label: 'Aprobadas',  value: solicitudes.filter(s => s.estado === 'aprobada').length,   color: '#10B981' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0
        ? <Card><div style={{ textAlign: 'center', color: '#9CA3AF', padding: 32 }}>No hay solicitudes con estos filtros.</div></Card>
        : filtered.map(s => {
          const acciones = getAccionesRapidas(s)
          return (
            <Card key={s.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{s.empleado_nombre}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{ROLE_LABELS[s.empleado_rol]} · {s.taller_nombre || 'Oficina'}</div>
                  <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>
                    {fmtDate(s.fechaInicio)} → {fmtDate(s.fechaFin)} · <strong>{s.dias} días</strong>
                  </div>
                  {s.motivo && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{s.motivo}</div>}
                </div>
                <Badge estado={s.estado} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {acciones.map(a => (
                  <Btn key={a.key} variant={a.variant} small onClick={() => onAccion(s, a.key, '')}>{a.label}</Btn>
                ))}
                <Btn variant="ghost" small onClick={() => onSelect(s)}>Ver detalle</Btn>
              </div>
            </Card>
          )
        })
      }
    </div>
  )
}
