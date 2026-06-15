import { useState } from 'react'
import { Btn, Input } from '../components/UI'

export default function LoginPage({ onLogin, error, setError }) {
  const [codigo,  setCodigo]  = useState('')
  const [pin,     setPin]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!codigo || !pin) return
    setLoading(true)
    await onLogin(codigo.trim().toUpperCase(), pin)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#1E3A5F',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 36,
        width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏖️</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1E3A5F', letterSpacing: -.5 }}>GestVac</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Gestión de vacaciones</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Código de empleado"
            placeholder="Ej: T001, E001, O001…"
            value={codigo}
            onChange={e => { setCodigo(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoCapitalize="characters"
          />
          <Input
            label="PIN"
            type="password"
            placeholder="Tu PIN personal"
            value={pin}
            onChange={e => { setPin(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            inputMode="numeric"
            maxLength={8}
          />

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#DC2626',
            }}>⚠️ {error}</div>
          )}

          <Btn onClick={handleSubmit} disabled={loading || !codigo || !pin} style={{ marginTop: 4 }}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Btn>
        </div>

        <div style={{ marginTop: 24, fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
          ¿Olvidaste tu PIN? Contacta con tu encargado o responsable.
        </div>
      </div>
    </div>
  )
}
