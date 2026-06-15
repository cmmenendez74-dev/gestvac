import { useState, useCallback } from 'react'
import {
  collection, query, where, getDocs, addDoc, updateDoc,
  doc, orderBy, Timestamp, getDoc
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useSolicitudes(empleado) {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  // Enriquece cada solicitud con datos del empleado
  const enrichSolicitud = async (solDoc) => {
    const data = { id: solDoc.id, ...solDoc.data() }
    // Fetch empleado si no tenemos los datos en caché
    if (data.empleadoId) {
      try {
        const empSnap = await getDoc(doc(db, 'empleados', data.empleadoId))
        if (empSnap.exists()) {
          const emp = empSnap.data()
          data.empleado_nombre  = emp.nombre
          data.empleado_rol     = emp.rol
          data.empleado_area    = emp.area
          data.codigo_empleado  = emp.codigoEmpleado
          data.taller_nombre    = emp.tallerNombre || null
          // Convertir Timestamps a strings ISO
          if (data.fechaInicio?.toDate) data.fechaInicio = data.fechaInicio.toDate().toISOString().slice(0, 10)
          if (data.fechaFin?.toDate)    data.fechaFin    = data.fechaFin.toDate().toISOString().slice(0, 10)
          if (data.createdAt?.toDate)   data.createdAt   = data.createdAt.toDate().toISOString().slice(0, 10)
        }
      } catch {}
    }
    return data
  }

  const fetchSolicitudes = useCallback(async () => {
    if (!empleado) return
    setLoading(true)
    setError(null)
    try {
      let q
      const { rol, id, tallerId, zonaId } = empleado

      if (rol === 'tecnico' || rol === 'oficinista') {
        q = query(collection(db, 'solicitudes'), where('empleadoId', '==', id), orderBy('createdAt', 'desc'))
      } else if (rol === 'encargado_taller') {
        q = query(collection(db, 'solicitudes'), where('tallerId', '==', tallerId), orderBy('createdAt', 'desc'))
      } else if (rol === 'jefe_zona') {
        q = query(collection(db, 'solicitudes'), where('zonaId', '==', zonaId), orderBy('createdAt', 'desc'))
      } else if (rol === 'responsable_oficina') {
        q = query(collection(db, 'solicitudes'), where('responsableId', '==', id), orderBy('createdAt', 'desc'))
      } else {
        // admin: todas
        q = query(collection(db, 'solicitudes'), orderBy('createdAt', 'desc'))
      }

      const snap = await getDocs(q)
      const enriched = await Promise.all(snap.docs.map(enrichSolicitud))
      setSolicitudes(enriched)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }, [empleado])

  const fetchHistorial = async (solicitudId) => {
    try {
      const q = query(
        collection(db, 'solicitudes', solicitudId, 'historial'),
        orderBy('createdAt', 'asc')
      )
      const snap = await getDocs(q)
      return snap.docs.map(d => {
        const data = { id: d.id, ...d.data() }
        if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString().slice(0, 10)
        return data
      })
    } catch { return [] }
  }

  const crearSolicitud = async ({ fechaInicio, fechaFin, dias, motivo }) => {
    setError(null)
    try {
      const estadoInicial = empleado.area === 'taller' ? 'pendiente_encargado' : 'pendiente_responsable'
      const now = Timestamp.now()

      // Crear solicitud
      const solRef = await addDoc(collection(db, 'solicitudes'), {
        empleadoId:    empleado.id,
        tallerId:      empleado.tallerId      || null,
        zonaId:        empleado.zonaId        || null,
        responsableId: empleado.responsableId || null,
        fechaInicio:   Timestamp.fromDate(new Date(fechaInicio)),
        fechaFin:      Timestamp.fromDate(new Date(fechaFin)),
        dias,
        motivo:        motivo || '',
        estado:        estadoInicial,
        createdAt:     now,
        updatedAt:     now,
      })

      // Historial inicial
      await addDoc(collection(db, 'solicitudes', solRef.id, 'historial'), {
        accion:      'Solicitud creada',
        comentario:  '',
        autorId:     empleado.id,
        autorNombre: empleado.nombre,
        createdAt:   now,
      })

      // Restar días al empleado
      await updateDoc(doc(db, 'empleados', empleado.id), {
        diasDisponibles: empleado.diasDisponibles - dias,
      })

      await fetchSolicitudes()
      return { ok: true }
    } catch (e) {
      return { error: e.message }
    }
  }

  const accionarSolicitud = async (solicitud, accion, comentario) => {
    const estadoMap = {
      aprobar_encargado:    'pendiente_jefe_zona',
      rechazar_encargado:   'rechazada',
      aprobar_jefe_zona:    'aprobada',
      rechazar_jefe_zona:   'rechazada',
      aprobar_responsable:  'aprobada',
      rechazar_responsable: 'rechazada',
      cancelar:             'cancelada',
    }
    const accionLabel = {
      aprobar_encargado:    'Aprobada por encargado',
      rechazar_encargado:   'Rechazada por encargado',
      aprobar_jefe_zona:    'Aprobada por jefe de zona',
      rechazar_jefe_zona:   'Rechazada por jefe de zona',
      aprobar_responsable:  'Aprobada por responsable',
      rechazar_responsable: 'Rechazada por responsable',
      cancelar:             'Cancelada por el empleado',
    }

    const nuevoEstado = estadoMap[accion]
    const now = Timestamp.now()

    try {
      // Actualizar estado
      await updateDoc(doc(db, 'solicitudes', solicitud.id), {
        estado: nuevoEstado, updatedAt: now,
      })

      // Añadir al historial
      await addDoc(collection(db, 'solicitudes', solicitud.id, 'historial'), {
        accion:      accionLabel[accion],
        comentario:  comentario || '',
        autorId:     empleado.id,
        autorNombre: empleado.nombre,
        createdAt:   now,
      })

      // Devolver días si se rechaza o cancela
      if (nuevoEstado === 'rechazada' || nuevoEstado === 'cancelada') {
        const empSnap = await getDoc(doc(db, 'empleados', solicitud.empleadoId))
        if (empSnap.exists()) {
          const dias = empSnap.data().diasDisponibles
          await updateDoc(doc(db, 'empleados', solicitud.empleadoId), {
            diasDisponibles: dias + solicitud.dias,
          })
        }
      }

      await fetchSolicitudes()
      return { ok: true }
    } catch (e) {
      return { error: e.message }
    }
  }

  return { solicitudes, loading, error, fetchSolicitudes, fetchHistorial, crearSolicitud, accionarSolicitud }
}
