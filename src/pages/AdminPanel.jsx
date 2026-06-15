import { useState, useRef } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc, query, where, getDocs, doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { Card, Btn } from '../components/UI'

const ROLES_VALIDOS = ['tecnico','encargado_taller','jefe_zona','oficinista','responsable_oficina']

export default function AdminPanel({ onBack }) {
  const [empleados, setEmpleados] = useState([])
  const [resultado, setResultado] = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const fileRef = useRef()

  const parseCsv = (text) => {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    return lines.slice(1).map((line, i) => {
      const vals = line.split(',').map(v => v.trim())
      const obj = {}
      headers.forEach((h, idx) => { obj[h] = vals[idx] || '' })
      obj._line = i + 2
      return obj
    }).filter(r => r.codigo_empleado)
  }

  const handleFile = (e) => {
    setError(null); setResultado(null)
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const rows = parseCsv(ev.target.result)
        const errores = []
        rows.forEach(r => {
          if (!r.codigo_empleado)                   errores.push(`Línea ${r._line}: código requerido`)
          if (!r.nombre)                            errores.push(`Línea ${r._line}: nombre requerido`)
          if (!ROLES_VALIDOS.includes(r.rol))       errores.push(`Línea ${r._line}: rol inválido "${r.rol}"`)
          if (!r.pin || r.pin.length < 4)           errores.push(`Línea ${r._line}: PIN mínimo 4 caracteres`)
          if (!['taller','oficina'].includes(r.area)) errores.push(`Línea ${r._line}: área debe ser taller u oficina`)
        })
        if (errores.length) { setError(errores.join('\n')); return }
        setEmpleados(rows)
      } catch { setError('Error al leer el archivo. Comprueba el formato.') }
    }
    reader.readAsText(file)
  }

  const crearEmpleados = async () => {
    setLoading(true); setError(null)
    const ok = [], errores = []

    // Guardamos el usuario admin actual para restaurarlo
    const adminUser = auth.currentUser

    for (const emp of empleados) {
      try {
        const email = `${emp.codigo_empleado.toLowerCase()}@gestvac.interno`

        // Crear usuario en Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, email, emp.pin)
        const uid  = cred.user.uid

        // Insertar perfil en Firestore usando el UID como ID del documento
        await setDoc(doc(db, 'empleados', uid), {
          uid,
          codigoEmpleado:  emp.codigo_empleado.toUpperCase(),
          nombre:          emp.nombre,
          rol:             emp.rol,
          area:            emp.area,
          tallerId:        emp.taller_id   || null,
          tallerNombre:    emp.taller_nombre || null,
          zonaId:          emp.zona_id     || null,
          responsableId:   emp.responsable_id || null,
          diasDisponibles: emp.dias_disponibles ? parseInt(emp.dias_disponibles) : 22,
          activo:          true,
          createdAt:       new Date(),
        })

        ok.push(emp.nombre)
      } catch (e) {
        errores.push(`${emp.nombre}: ${e.message}`)
      }
    }

    // Nota: Firebase Auth cambia la sesión al crear usuarios.
    // El admin debe volver a iniciar sesión después de la carga masiva.
    setResultado({ ok, errores, needsRelogin: ok.length > 0 })
    setEmpleados([])
    setLoading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <Btn variant="ghost" small onClick={onBack} style={{ marginBottom: 16 }}>← Volver</Btn>
      <div style={{ fontWeight: 700, fontSize: 18, color: '#1E3A5F', marginBottom: 20 }}>⚙️ Panel de administración</div>

      {/* Plantilla */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>📥 Plantilla CSV</div>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
          Descarga la plantilla, rellénala con tu equipo y súbela aquí.
        </div>
        <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 11, marginBottom: 12, overflowX: 'auto', lineHeight: 1.8 }}>
          codigo_empleado,nombre,rol,area,taller_id,taller_nombre,zona_id,responsable_id,pin,dias_disponibles<br/>
          T001,Carlos Ruiz,tecnico,taller,TALL01,Taller Central Madrid,ZONA01,,1234,22<br/>
          E001,Luis Fernández,encargado_taller,taller,TALL01,Taller Central Madrid,ZONA01,,5678,22<br/>
          JZ01,Pedro Sánchez,jefe_zona,taller,,,ZONA01,,9012,25<br/>
          O001,Elena Díaz,oficinista,oficina,,,,R001,2468,22<br/>
          R001,Carmen López,responsable_oficina,oficina,,,,,,8024,25
        </div>
        <Btn variant="ghost" small onClick={() => {
          const csv = [
            'codigo_empleado,nombre,rol,area,taller_id,taller_nombre,zona_id,responsable_id,pin,dias_disponibles',
            'T001,Carlos Ruiz,tecnico,taller,TALL01,Taller Central Madrid,ZONA01,,1234,22',
            'T002,Marta Gomez,tecnico,taller,TALL01,Taller Central Madrid,ZONA01,,5678,22',
            'E001,Luis Fernandez,encargado_taller,taller,TALL01,Taller Central Madrid,ZONA01,,9012,22',
            'JZ01,Pedro Sanchez,jefe_zona,taller,,,ZONA01,,3456,25',
            'O001,Elena Diaz,oficinista,oficina,,,,R001,2468,22',
            'R001,Carmen Lopez,responsable_oficina,oficina,,,,,,8024,25',
          ].join('\n')
          const a = document.createElement('a')
          a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
          a.download = 'plantilla_empleados.csv'
          a.click()
        }}>Descargar plantilla CSV</Btn>
      </Card>

      {/* Upload */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>📤 Carga masiva de empleados</div>

        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: 12, fontSize: 12, color: '#92400E', marginBottom: 14 }}>
          ⚠️ Tras la carga masiva tendrás que volver a iniciar sesión como admin. Firebase cambia la sesión activa al crear usuarios.
        </div>

        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ fontSize: 13, marginBottom: 12 }} />

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: 12, fontSize: 12, color: '#DC2626', whiteSpace: 'pre-line', marginBottom: 12 }}>
            {error}
          </div>
        )}

        {empleados.length > 0 && (
          <>
            <div style={{ fontSize: 13, marginBottom: 10 }}>✅ {empleados.length} empleados listos:</div>
            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
              {empleados.map((e, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13 }}>
                  <span><strong>{e.codigo_empleado}</strong> – {e.nombre}</span>
                  <span style={{ color: '#6B7280' }}>{e.rol} · {e.area}</span>
                </div>
              ))}
            </div>
            <Btn onClick={crearEmpleados} disabled={loading}>
              {loading ? 'Creando usuarios…' : `Crear ${empleados.length} empleados`}
            </Btn>
          </>
        )}
      </Card>

      {resultado && (
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Resultado</div>
          {resultado.ok.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#10B981', fontWeight: 600, marginBottom: 6 }}>✓ Creados ({resultado.ok.length})</div>
              {resultado.ok.map((n, i) => <div key={i} style={{ fontSize: 13 }}>• {n}</div>)}
            </div>
          )}
          {resultado.errores.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#EF4444', fontWeight: 600, marginBottom: 6 }}>✗ Errores ({resultado.errores.length})</div>
              {resultado.errores.map((e, i) => <div key={i} style={{ fontSize: 13, color: '#DC2626' }}>• {e}</div>)}
            </div>
          )}
          {resultado.needsRelogin && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: 12, fontSize: 13, color: '#92400E', marginTop: 10 }}>
              Vuelve a iniciar sesión como ADMIN para continuar gestionando la app.
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
