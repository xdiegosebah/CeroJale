# CeroJale — cuentas personales con Supabase

Esta versión permite registrarse e iniciar sesión con correo y contraseña. Cada cuenta de estudiante ve sus propias reservas; cada asesor administra su perfil, sus horarios y las solicitudes dirigidas a él. Las contraseñas las administra Supabase Auth.

**Antes de usarla, ejecuta el paso 1.** La URL y la clave publicable ya están en `.env.local`. No se incluyen claves administrativas ni contraseñas de la base de datos.

## 1. Activar las tablas (una vez)

1. Abre tu proyecto en Supabase.
2. Entra al **SQL Editor** (icono `>_` de la barra lateral).
3. Pulsa **New query**.
4. Abre `supabase/setup.sql` de este proyecto, copia todo y pégalo en el editor.
5. Pulsa **Run**. Debe terminar sin errores.

El script crea únicamente los objetos `cj_`, las políticas de lectura y las funciones que validan los cambios. No borra tus otras tablas y se puede ejecutar otra vez sin borrar las reservas.

La clave publicable no permite ejecutar este script: debe hacerlo el dueño del proyecto en el SQL Editor. No es necesario compartir una clave secret o service_role.

## 2. Configurar los enlaces de correo

En **Authentication → URL Configuration**:

- Para probar en tu PC, agrega `http://localhost:5173` como **Site URL** y en **Redirect URLs**.
- Si usas otra dirección o puerto, agrega exactamente esa dirección.
- Cuando publiques CeroJale, cambia Site URL al dominio final y agrega también su URL a Redirect URLs.

En **Authentication → Sign In / Providers → Email** comprueba que Email esté habilitado. Esta implementación admite confirmación por correo; no modifica esa configuración del proyecto.

### Envío de correos y pruebas con compañeros

Con confirmación activada, el usuario debe abrir el correo recibido antes de ingresar. Para enviar confirmaciones y recuperar contraseñas a direcciones de tus compañeros, configura un proveedor de envío en **Authentication → SMTP Settings**. El correo incorporado de Supabase tiene restricciones y solo envía a direcciones autorizadas del equipo; no es un servicio de envío general.

Para una prueba de clase sin configurar correo, puedes desactivar temporalmente **Confirm email** en el proveedor Email: los usuarios podrán registrarse e ingresar directamente, pero sus direcciones **no estarán verificadas**. Recuperar contraseñas por correo seguirá necesitando un envío de correos configurado. Antes de abrir el registro a público real, configura SMTP y activa de nuevo la confirmación.

Documentación oficial:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/redirect-urls

## 3. Ejecutar en tu computadora

Instala Node.js 24 LTS. Descomprime el proyecto y abre una terminal dentro de la carpeta que contiene `package.json`.

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` (o la dirección indicada por Vite). Mantén la terminal abierta. No abras index.html con doble clic.

En el alojamiento o en Figma Make configura también las variables de `.env.local` como variables de entorno si no las importa. Son la URL y la clave **publicable**; no uses una clave secret/service_role en el navegador.

## 4. Probar con dos personas

1. Crea una cuenta con tipo **Asesor** y confirma el correo si corresponde.
2. Entra a **Mi perfil** y completa especialidad, cursos (uno por línea), precio y metodología.
3. Entra a **Mi disponibilidad** y publica una fecha futura. Los horarios se interpretan en Lima.
4. Cierra sesión. Crea otra cuenta con tipo **Estudiante** y otro correo.
5. Busca el curso, revisa el perfil y reserva un horario indicando tu consulta.
6. Entra como asesor para aceptar la reserva.
7. Como estudiante, revisa **Mis asesorías** y **Calendario**. También podrás proponer un nuevo horario.
8. El asesor acepta o rechaza las reprogramaciones. Después de terminar la sesión puede marcarla realizada y el alumno puede dejar una única reseña.

Puedes usar dos navegadores o una ventana incógnita para tener ambas cuentas abiertas. Las contraseñas y los correos los elige cada persona. Ya no se usan los accesos fijos de demostración.

Cada cuenta conserva el rol elegido al registrarse. Cambiar los metadatos del usuario no cambia sus permisos. No se añaden reseñas, reservas ni perfiles de ejemplo a las tablas reales. El catálogo empezará vacío hasta que se registren asesores y completen su perfil.

## Funciones

- Registro, ingreso, cierre de sesión y recuperación de contraseña.
- Sesión persistente y panel según rol guardado en la base de datos.
- Catálogo por curso, precio y modalidad; perfiles y reseñas de sesiones realizadas.
- Oferta editable y disponibilidad personal del asesor.
- Reservas, aceptación, cancelación de pendientes y reprogramación con aceptación.
- Control de cruces tanto para el asesor como para el estudiante.
- La tarifa de una reserva la toma el servidor del perfil del asesor.
- No se puede finalizar una sesión antes de su hora de término.
- Datos compartidos entre dispositivos; actualización al abrir la ventana, con el botón Actualizar y cada 15 segundos mientras está visible.
- Políticas de acceso en Supabase y mutaciones validadas en PostgreSQL.

No se integraron pagos, videollamadas, archivos adjuntos ni videos. Los participantes deben acordar el lugar/enlace y los detalles del pago. Los asesores son cuentas registradas, no asesores verificados por USIL; no se afirma una afiliación oficial.

## Verificación

```bash
npm run build
npm test
npm run test:db
```

`test:db` ejecuta el esquema y sus pruebas en PostgreSQL local mediante PGlite. No modifica el proyecto remoto ni crea usuarios reales. Comprueba permisos entre cuentas, acceso anónimo, rol inmutable, reservas superpuestas, reprogramaciones con conflicto y reseñas.

El código anterior de demostración se conserva en `src/app/DemoApp.tsx` como referencia, pero la entrada actual usa `ConnectedApp.tsx`. Los datos antiguos del navegador no se importan a las cuentas reales.
