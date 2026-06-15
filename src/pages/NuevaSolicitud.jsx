import { useState } from 'react'
import { Card, Btn, Input, calcDias, today } from '../components/UI'

export default function NuevaSolicitud({ empleado, onSubmit, onCancel }) {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin,    setFechaFin]    = useState('')
  const [motivo,      setMotivo]      = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  const dias    = calcDias(fechaInicio, fechaFin)
  const excede  = dias > empleado.diasDisponibles
  const canSend = fechaInicio && fechaFin && dias > 0 && !excede

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    const result = await onSubmit({ fechaInicio, fechaFin, dias, motivo })
    if (result?.error) setError(result.error)
    setLoading(false)
  }

  const flujo = empleado.area === 'taller'
    ? 'Encargado de taller → Jefe de zona'
    : 'Responsable de oficina'

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 18, color: '#1E3A5F', marginBottom: 20 }}>
        📅 Nueva solicitud de vacaciones
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="Fecha de inicio" type="date" min={today()}
          value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        <Input label="Fecha de fin" type="date" min={fechaInicio || today()}
          value={fechaFin} onChange={e => setFechaFin(e.target.value)} />

        {dias > 0 && (
          <div style={{
            background: excede ? '#FEF2F2' : '#EFF6FF',
            border: `1px solid ${excede ? '#FECACA' : '#BFDBFE'}`,
            borderRadius: 8, padding: 12, fontSize: 14,
          }}>
            {excede
              ? `⚠️ Necesitas ${dias} días pero solo tienes ${empleado.diasDisponibles} disponibles`
              : `📊 ${dias} días laborables · Te quedarán ${empleado.diasDisponibles - dias} días`}
          </div>
        )}

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
            Motivo (opcional)
          </label>
          <textarea
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, height: 80, resize: 'vertical' }}
            placeholder="Vacaciones de verano, asuntos personales…"
            value={motivo} onChange={e => setMotivo(e.target.value)}
          />
        </div>

        <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#6B7280' }}>
          📍 Flujo de aprobación: <strong>{flujo}</strong>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#DC2626' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
          <Btn onClick={handleSubmit} disabled={!canSend || loading}>
            {loading ? 'Enviando…' : 'Enviar solicitud'}
          </Btn>
        </div>
      </div>
    </Card>
  )
}
