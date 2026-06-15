import { Card, Stat, Badge, fmtDate } from '../components/UI'
import { ROLE_LABELS, DIAS_ANUALES }  from '../lib/firebase'

export default function Dashboard({ empleado, solicitudes, onNewRequest, onViewSolicitudes, onViewGestion, onSelectSolicitud }) {
  const misSolicitudes  = solicitudes.filter(s => s.empleadoId === empleado.id)
  const diasTomados     = misSolicitudes.filter(s => s.estado === 'aprobada').reduce((a, s) => a + s.dias, 0)
  const pendientesCount = misSolicitudes.filter(s => s.estado.startsWith('pendiente')).length
  const isManager       = ['encargado_taller','jefe_zona','responsable_oficina','admin'].includes(empleado.rol)

  const pendientesAprobacion = solicitudes.filter(s => {
    if (empleado.rol === 'encargado_taller')    return s.estado === 'pendiente_encargado'
    if (empleado.rol === 'jefe_zona')           return s.estado === 'pendiente_jefe_zona'
    if (empleado.rol === 'responsable_oficina') return s.estado === 'pendiente_responsable'
    if (empleado.rol === 'admin')               return s.estado.startsWith('pendiente')
    return false
  })

  const pct = Math.round((empleado.diasDisponibles / DIAS_ANUALES) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>Mis vacaciones 2026</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1E3A5F', marginTop: 2 }}>{empleado.nombre}</div>
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', textAlign: 'right' }}>
            {ROLE_LABELS[empleado.rol]}<br />
            <span style={{ color: '#9CA3AF' }}>{empleado.codigoEmpleado}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <Stat label="Días disponibles" value={empleado.diasDisponibles} color="#1E3A5F" />
          <Stat label="Días tomados"     value={diasTomados}              color="#10B981" />
          <Stat label="En trámite"       value={pendientesCount}          color="#F59E0B" />
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ height: 8, background: '#F3F4F6', borderRadius: 99 }}>
            <div style={{ height: '100%', background: '#1E3A5F', borderRadius: 99, width: `${pct}%`, transition: 'width .4s' }} />
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, textAlign: 'right' }}>
            {empleado.diasDisponibles} / {DIAS_ANUALES} días restantes
          </div>
        </div>
      </Card>

      {isManager && pendientesAprobacion.length > 0 && (
        <Card style={{ border: '1.5px solid #F59E0B33', background: '#FFFBEB' }}>
          <div style={{ fontWeight: 700, color: '#92400E', marginBottom: 12 }}>
            ⏳ Pendientes de tu aprobación ({pendientesAprobacion.length})
          </div>
          {pendientesAprobacion.slice(0, 3).map(s => (
            <div key={s.id} onClick={() => onSelectSolicitud(s)} style={{
              background: '#fff', border: '1px solid #FDE68A', borderRadius: 8,
              padding: '10px 14px', marginBottom: 8, cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.empleado_nombre}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {fmtDate(s.fechaInicio)} → {fmtDate(s.fechaFin)} · {s.dias} días
                </div>
              </div>
              <Badge estado={s.estado} />
            </div>
          ))}
          {pendientesAprobacion.length > 3 && (
            <button onClick={onViewGestion} style={{ background: 'none', border: 'none', color: '#1E3A5F', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              Ver todas →
            </button>
          )}
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card onClick={onNewRequest} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28 }}>📅</div>
          <div style={{ fontWeight: 600, fontSize: 14, marginTop: 8 }}>Nueva solicitud</div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>Pedir días</div>
        </Card>
        <Card onClick={onViewSolicitudes} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28 }}>📋</div>
          <div style={{ fontWeight: 600, fontSize: 14, marginTop: 8 }}>Mis solicitudes</div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>Ver historial</div>
        </Card>
        {isManager && (
          <Card onClick={onViewGestion} style={{ textAlign: 'center', gridColumn: 'span 2' }}>
            <div style={{ fontSize: 28 }}>🗂️</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 8 }}>
              Panel de gestión {pendientesAprobacion.length > 0 && `(${pendientesAprobacion.length} pendientes)`}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Gestiona a tu equipo</div>
          </Card>
        )}
      </div>

      {misSolicitudes.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, color: '#1E3A5F', marginBottom: 10, fontSize: 15 }}>Últimas solicitudes</div>
          {misSolicitudes.slice(0, 3).map(s => (
            <Card key={s.id} onClick={() => onSelectSolicitud(s)} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{fmtDate(s.fechaInicio)} → {fmtDate(s.fechaFin)}</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>{s.dias} días · {s.motivo || 'Sin motivo'}</div>
                </div>
                <Badge estado={s.estado} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
