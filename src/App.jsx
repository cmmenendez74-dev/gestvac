import { useState, useEffect } from 'react'
import { useAuth }        from './hooks/useAuth'
import { useSolicitudes } from './hooks/useSolicitudes'
import LoginPage          from './pages/LoginPage'
import Dashboard          from './pages/Dashboard'
import NuevaSolicitud     from './pages/NuevaSolicitud'
import DetalleSolicitud   from './pages/DetalleSolicitud'
import PanelGestion       from './pages/PanelGestion'
import AdminPanel         from './pages/AdminPanel'
import { Badge, Card, Toast, fmtDate } from './components/UI'
import { ROLE_LABELS } from './lib/firebase'

export default function App() {
  const { user, empleado, loading: authLoading, error: authError, login, logout, setError } = useAuth()
  const { solicitudes, loading: solLoading, fetchSolicitudes, fetchHistorial, crearSolicitud, accionarSolicitud } = useSolicitudes(empleado)

  const [view,     setView]     = useState('dashboard')
  const [selected, setSelected] = useState(null)
  const [toast,    setToast]    = useState(null)

  useEffect(() => { if (empleado) fetchSolicitudes() }, [empleado])

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleNewRequest = async (data) => {
    const result = await crearSolicitud(data)
    if (result?.ok) { showToast('Solicitud enviada correctamente'); setView('mis_solicitudes') }
    return result
  }

  const handleAccion = async (sol, accion, comentario) => {
    const result = await accionarSolicitud(sol, accion, comentario)
    if (result?.ok) { showToast('Acción realizada correctamente'); setView('gestion'); setSelected(null) }
  }

  const handleSelectSolicitud = (s) => { setSelected(s); setView('detalle') }

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1E3A5F' }}>
      <div style={{ color: '#fff', fontSize: 16 }}>Cargando…</div>
    </div>
  )

  if (!user || !empleado) return <LoginPage onLogin={login} error={authError} setError={setError} />

  const isManager = ['encargado_taller','jefe_zona','responsable_oficina','admin'].includes(empleado.rol)
  const isAdmin   = empleado.rol === 'admin'

  const misSolicitudes = solicitudes.filter(s => s.empleadoId === empleado.id)

  const pendientesCount = solicitudes.filter(s => {
    if (empleado.rol === 'encargado_taller')    return s.estado === 'pendiente_encargado'
    if (empleado.rol === 'jefe_zona')           return s.estado === 'pendiente_jefe_zona'
    if (empleado.rol === 'responsable_oficina') return s.estado === 'pendiente_responsable'
    if (empleado.rol === 'admin')               return s.estado.startsWith('pendiente')
    return false
  }).length

  const renderView = () => {
    if (view === 'nueva_solicitud') return (
      <NuevaSolicitud empleado={empleado} onSubmit={handleNewRequest} onCancel={() => setView('dashboard')} />
    )
    if (view === 'mis_solicitudes') return (
      <div>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#1E3A5F', marginBottom: 16 }}>📋 Mis solicitudes</div>
        {misSolicitudes.length === 0
          ? <Card><div style={{ textAlign: 'center', color: '#9CA3AF', padding: 32 }}>No tienes solicitudes aún.</div></Card>
          : misSolicitudes.map(s => (
            <Card key={s.id} onClick={() => handleSelectSolicitud(s)} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{fmtDate(s.fechaInicio)} → {fmtDate(s.fechaFin)}</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>{s.dias} días · {s.motivo || 'Sin motivo'}</div>
                </div>
                <Badge estado={s.estado} />
              </div>
            </Card>
          ))
        }
      </div>
    )
    if (view === 'gestion' && isManager) return (
      <PanelGestion solicitudes={solicitudes} empleado={empleado} onSelect={handleSelectSolicitud} onAccion={handleAccion} />
    )
    if (view === 'detalle' && selected) return (
      <DetalleSolicitud
        solicitud={solicitudes.find(s => s.id === selected.id) || selected}
        empleado={empleado}
        fetchHistorial={fetchHistorial}
        onAccion={handleAccion}
        onBack={() => setView(isManager ? 'gestion' : 'mis_solicitudes')}
      />
    )
    if (view === 'admin' && isAdmin) return <AdminPanel onBack={() => setView('dashboard')} />
    return (
      <Dashboard
        empleado={empleado} solicitudes={solicitudes}
        onNewRequest={() => setView('nueva_solicitud')}
        onViewSolicitudes={() => setView('mis_solicitudes')}
        onViewGestion={() => setView('gestion')}
        onSelectSolicitud={handleSelectSolicitud}
      />
    )
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#F3F4F6', minHeight: '100vh' }}>
      <div style={{ background: '#1E3A5F', color: '#fff' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => setView('dashboard')} style={{ cursor: 'pointer' }}>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>🏖️ GestVac</div>
            <div style={{ fontSize: 11, color: '#93C5FD' }}>{empleado.nombre} · {ROLE_LABELS[empleado.rol]}</div>
          </div>
          <button onClick={logout} style={{ background: 'none', border: '1px solid #ffffff44', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
            Salir
          </button>
        </div>
      </div>

      {view !== 'detalle' && view !== 'admin' && (
        <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', overflowX: 'auto' }}>
            {[
              { key: 'dashboard',       label: 'Inicio' },
              { key: 'mis_solicitudes', label: 'Mis solicitudes' },
              ...(isManager ? [{ key: 'gestion', label: `Gestión${pendientesCount ? ` (${pendientesCount})` : ''}` }] : []),
              ...(isAdmin   ? [{ key: 'admin',   label: '⚙️ Admin' }] : []),
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setView(key)} style={{
                background: 'none', border: 'none', padding: '14px 16px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                color: view === key ? '#1E3A5F' : '#6B7280',
                borderBottom: view === key ? '2.5px solid #1E3A5F' : '2.5px solid transparent',
              }}>{label}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 80px' }}>
        {solLoading && view === 'dashboard'
          ? <div style={{ textAlign: 'center', color: '#9CA3AF', padding: 40 }}>Cargando…</div>
          : renderView()
        }
      </div>

      <Toast toast={toast} />
    </div>
  )
}
