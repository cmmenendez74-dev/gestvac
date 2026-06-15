import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export function useAuth() {
  const [user,     setUser]     = useState(null)
  const [empleado, setEmpleado] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const fetchEmpleado = async (uid) => {
    try {
      const q = query(collection(db, 'empleados'), where('uid', '==', uid))
      const snap = await getDocs(q)
      if (snap.empty) { setError('Perfil no encontrado. Contacta con el administrador.'); setLoading(false); return }
      const doc = snap.docs[0]
      setEmpleado({ id: doc.id, ...doc.data() })
    } catch (e) {
      setError('Error al cargar el perfil.')
    }
    setLoading(false)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (u) fetchEmpleado(u.uid)
      else { setEmpleado(null); setLoading(false) }
    })
    return unsub
  }, [])

  const login = async (codigoEmpleado, pin) => {
    setError(null)
    try {
      // Email interno ficticio basado en el código de empleado
      const email = `${codigoEmpleado.trim().toLowerCase()}@gestvac.interno`
      await signInWithEmailAndPassword(auth, email, pin)
    } catch {
      setError('Código o PIN incorrecto')
    }
  }

  const logout = async () => {
    await signOut(auth)
    setEmpleado(null)
  }

  return { user, empleado, loading, error, login, logout, setError }
}
