# GestVac – Guía de despliegue (versión Firebase)

## Estructura del proyecto

```
gestvac-firebase/
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml                ← Netlify lo usa para compilar
├── firestore.rules             ← Reglas de seguridad de Firestore
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── lib/
│   │   └── firebase.js         ← Credenciales ya configuradas ✅
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useSolicitudes.js
│   ├── components/
│   │   └── UI.jsx
│   └── pages/
│       ├── LoginPage.jsx
│       ├── Dashboard.jsx
│       ├── NuevaSolicitud.jsx
│       ├── DetalleSolicitud.jsx
│       ├── PanelGestion.jsx
│       └── AdminPanel.jsx
```

---

## PASO 1 — Activar Firebase Authentication

1. Firebase Console → tu proyecto **Gestion vacaciones**
2. Menú izquierdo → **Compilación → Authentication**
3. Pulsa **Comenzar**
4. Pestaña **Método de acceso** → **Correo electrónico/Contraseña** → Activar → Guardar

---

## PASO 2 — Crear Firestore Database

1. Firebase Console → **Compilación → Firestore Database**
2. Pulsa **Crear base de datos**
3. Selecciona **Comenzar en modo de producción**
4. Región: **europe-west1** (Bélgica, la más cercana a España)
5. Pulsa **Listo**

---

## PASO 3 — Aplicar reglas de seguridad

1. Firebase Console → Firestore → pestaña **Reglas**
2. Borra el contenido que hay y pega todo el contenido del archivo `firestore.rules`
3. Pulsa **Publicar**

---

## PASO 4 — Subir a GitHub

1. Crea un repositorio en **github.com** (ej: `gestvac`)
2. Sube todos los archivos de esta carpeta arrastrándolos desde el navegador de GitHub
   - Puedes subir carpetas enteras desde "uploading an existing file"

---

## PASO 5 — Desplegar en Netlify

1. **netlify.com** → Add new site → Import from GitHub
2. Selecciona el repo `gestvac`
3. Netlify detecta la config automáticamente:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Pulsa **Deploy site**
5. En 2-3 minutos tendrás la app publicada

---

## PASO 6 — Conectar tu dominio

1. Netlify → Domain settings → Add custom domain
2. Escribe tu dominio (ej: `vacaciones.tuempresa.com`)
3. Añade los registros DNS que te indique Netlify en tu proveedor

---

## PASO 7 — Crear el usuario ADMIN

Necesitas un admin para poder cargar empleados desde la app.

1. **Firebase Console → Authentication → Users → Agregar usuario**
   - Email: `admin@gestvac.interno`
   - Contraseña: (la que quieras, mínimo 6 caracteres)
   - Copia el **UID** que aparece (algo como `abc123xyz...`)

2. **Firebase Console → Firestore → Datos → Nueva colección**
   - ID de colección: `empleados`
   - ID del documento: **pega el UID del paso anterior** (exactamente igual)
   - Añade estos campos:

   | Campo           | Tipo    | Valor               |
   |-----------------|---------|---------------------|
   | uid             | string  | (el mismo UID)      |
   | codigoEmpleado  | string  | ADMIN               |
   | nombre          | string  | Administrador       |
   | rol             | string  | admin               |
   | area            | string  | oficina             |
   | diasDisponibles | number  | 22                  |
   | activo          | boolean | true                |

3. Entra en la app con:
   - Código: `ADMIN`
   - PIN: (la contraseña que pusiste)

---

## PASO 8 — Carga masiva de empleados

1. Entra como ADMIN → pestaña **⚙️ Admin**
2. Descarga la **plantilla CSV**
3. Rellénala con tu equipo:

| Campo           | Descripción                                            |
|-----------------|--------------------------------------------------------|
| codigo_empleado | Único, sin espacios (T001, E001…)                      |
| nombre          | Nombre completo                                        |
| rol             | tecnico / encargado_taller / jefe_zona / oficinista / responsable_oficina |
| area            | taller / oficina                                       |
| taller_id       | ID libre que identifica el taller (ej: TALL01)         |
| taller_nombre   | Nombre visible del taller (ej: Taller Central Madrid)  |
| zona_id         | ID de zona (solo para jefe_zona, ej: ZONA01)           |
| responsable_id  | codigo_empleado del responsable (solo oficinistas)     |
| pin             | Mínimo 4 caracteres                                    |
| dias_disponibles| Normalmente 22                                         |

4. Sube el CSV → revisa la lista → pulsa **Crear empleados**
5. ⚠️ Después de la carga tendrás que volver a iniciar sesión como ADMIN

---

## Flujos de aprobación

**Taller:**
```
Técnico → [pendiente_encargado] → Encargado aprueba
       → [pendiente_jefe_zona]  → Jefe de zona aprueba → [aprobada]
```

**Oficina:**
```
Oficinista → [pendiente_responsable] → Responsable aprueba → [aprobada]
```

---

## Actualizar la app

Edita cualquier archivo directamente en GitHub → Netlify redespliegue automático en 2-3 min.

---

## Preguntas frecuentes

**¿Qué pasa si un empleado olvida su PIN?**
Entra como admin → Firebase Console → Authentication → busca su email (`t001@gestvac.interno`) → Reset password → ponle un PIN nuevo.

**¿Puedo tener varios talleres y zonas?**
Sí, usa los campos `taller_id` y `zona_id` del CSV para agruparlos. El encargado del taller solo ve las solicitudes de su `taller_id`; el jefe de zona las de su `zona_id`.

**¿El plan Spark de Firebase tiene límites?**
Para una app interna con menos de 100 empleados, los límites del plan gratuito son más que suficientes (50.000 lecturas/día, 20.000 escrituras/día).
