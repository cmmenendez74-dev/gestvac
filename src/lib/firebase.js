import { initializeApp } from 'firebase/app'
import { getAuth }       from 'firebase/auth'
import { getFirestore }  from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyCJ6vr0v7J6wRClgDiWPAlwI4_58iZddfo",
  authDomain:        "gestion-vacaciones-ff6b2.firebaseapp.com",
  projectId:         "gestion-vacaciones-ff6b2",
  storageBucket:     "gestion-vacaciones-ff6b2.firebasestorage.app",
  messagingSenderId: "487082338792",
  appId:             "1:487082338792:web:f646f25ab48ba6ebd59c5d",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db   = getFirestore(app)

// ── Constantes de la app ─────────────────────────────────────────────────────
export const ROLES = {
  TECNICO:             'tecnico',
  ENCARGADO_TALLER:    'encargado_taller',
  JEFE_ZONA:           'jefe_zona',
  OFICINISTA:          'oficinista',
  RESPONSABLE_OFICINA: 'responsable_oficina',
  ADMIN:               'admin',
}

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

// ── Colecciones Firestore ────────────────────────────────────────────────────
// empleados      → perfil de cada usuario
// solicitudes    → solicitudes de vacaciones
// historial      → subcolección de cada solicitud
// talleres       → catálogo de talleres
// zonas          → catálogo de zonas
