import { initializeApp } from 'firebase/app'
import { getAuth }       from 'firebase/auth'
import { getFirestore }  from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)

export const ROLE_LABELS = {
  tecnico:             'Técnico de Taller',
  encargado_taller:    'Encargado de Taller',
  jefe_zona:           'Jefe de Zona',
  oficinista:          'Personal de Oficina',
  responsable_oficina: 'Responsable de Oficina',
  admin:               'Administrador',
}

export const ESTADO_CONFIG = {
  pendiente_encargado:   { label: 'Pte. Encargado',   color: '#F59E0B' },
  pendiente_jefe_zona:   { label: 'Pte. Jefe Zona',   color: '#3B82F6' },
  pendiente_responsable: { label: 'Pte. Responsable', color: '#3B82F6' },
  aprobada:              { label: 'Aprobada',          color: '#10B981' },
  rechazada:             { label: 'Rechazada',         color: '#EF4444' },
  cancelada:             { label: 'Cancelada',         color: '#6B7280' },
}

export const DIAS_ANUALES = 22
