import { useState, useEffect } from 'react'
import { Card, Badge, Btn, fmtDate } from '../components/UI'
import { ROLE_LABELS } from '../lib/firebase'

export default function DetalleSolicitud({ solicitud, empleado, onAccion, onBack, fetchHistorial }) {
  const [historial,   setHistorial]   = useState([])
  const [comentario,  setComentario]  = useState('')
  const [loading,     setLoading]     = useState(false)

  useEffect(() => {
    fetchHistorial(solicitud.id).then(setHistorial)
  }, [solicitud.id])

  const getAcciones = () => {
    const { rol } = empleado
    const { estado } = solicitud
    if (rol === 'encargado_taller'    && estado === 'pendiente_encargado')
      return [{ key: 'aprobar_encargado',    label: 'Aprobar', variant: 'success' }, { key: 'rechazar_encargado',    label: 'Rechazar', variant: 'danger' }]
    if (rol === 'jefe_zona'           && estado === 'pendiente_jefe_zona')
      return [{ key: 'aprobar_jefe_zona',    label: 'Aprobar', variant: 'success' }, { key: 'rechazar_jefe_zona',    label: 'Rechazar', variant: 'danger' }]
    if (rol === 'responsable_oficina' && estado === 'pendiente_responsable')
      return [{ key: 'aprobar_responsable',  label: 'Aprobar', variant: 'success' }, { key: 'rechazar_responsable',  label: 'Rechazar', variant: 'danger' }]
    if (rol === 'admin' && estado.startsWith('pendiente'))
      return [{ key: 'aprobar_responsable',  label: 'Aprobar', variant: 'success' }, { key: 'rechazar_responsable',  label: 'Rechazar', variant: 'danger' }]
    if (solicitud.empleadoId === empleado.id && (estado === 'pendiente_encargado' || estado === 'pendiente_responsable'))
      return [{ key: 'cancelar', label: 'Cancelar solicitud', variant: 'danger' }]
    return []
  }

  const acciones = getAcciones()

  const handleAccion = async (accion) => {
    setLoading(true)
    await onAccion(solicitud, accion, comentario)
    setLoading(false)
  }

  const campos = [
    ['Empleado',     solicitud.empleado_nombre],
    ['Rol',          ROLE_LABELS[solicitud.empleado_rol]],
    ['Área',         solicitud.taller_nombre || 'Oficina'],
    ['Fecha inicio', fmtDate(solicitud.fechaInicio)],
    ['Fecha fin',    fmtDate(solicitud.fechaFin)],
    ['Días',         `${solicitud.dias} días laborables`],
    ['Motivo',       solicitud.motivo || '—'],
    ['Creada el',    fmtDate(solicitud.createdAt)],
  ]

  return (
    <div>
      <Btn variant="ghost" small onClick={onBack} style={{ marginBottom: 16 }}>← Volver</Btn>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>Solicitud</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#1E3A5F', marginTop: 2 }}>{solicitud.empleado_nombre}</div>
          </div>
          <Badge estado={solicitud.estado} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {campos.map(([k, v]) => (
            <div key={k} style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>{k}</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ fontWeight: 700, color: '#1E3A5F', marginBottom: 14 }}>📜 Trazabilidad</div>
        <div style={{ paddingLeft: 8 }}>
          {historial.map((h, i) => (
            <div key={h.id} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 99, background: '#1E3A5F', flexShrink: 0, marginTop: 3,
                  boxShadow: i === historial.length - 1 ? '0 0 0 3px #1E3A5F33' : 'none',
                }} />
                {i < historial.length - 1 && <div style={{ width: 2, flex: 1, background: '#E5E7EB', marginTop: 4 }} />}
              </div>
              <div style={{ paddingBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{h.accion}</div>
                {h.comentario && <div style={{ fontSize: 12, color: '#374151', fontStyle: 'italic', marginTop: 2 }}>"{h.comentario}"</div>}
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{h.autorNombre} · {fmtDate(h.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>

        {acciones.length > 0 && (
          <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 20, paddingTop: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Comentario (opcional)</div>
            <textarea
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, height: 70, resize: 'vertical', marginBottom: 12 }}
              placeholder="Añade un comentario…"
              value={comentario} onChange={e => setComentario(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {acciones.map(a => (
                <Btn key={a.key} variant={a.variant} disabled={loading} onClick={() => handleAccion(a.key)}>
                  {loading ? '…' : a.label}
                </Btn>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
