# Checklist de lanzamiento piloto local

**Estado:** borrador operativo para piloto local  
**Fecha:** 25 de junio de 2026  
**Alcance:** MVP local con datos ficticios o usuarios controlados

Este checklist no declara preparación para producción. Sirve para decidir si el MVP está listo para una prueba piloto pequeña, controlada y reversible.

## 1. Condiciones de entrada

- [ ] El repositorio está en una rama conocida y sin cambios accidentales.
- [ ] La base de datos local de PostgreSQL está disponible.
- [ ] Todas las migraciones manuales registradas han sido aplicadas.
- [ ] El seed se ha ejecutado correctamente.
- [ ] El usuario de desarrollo puede iniciar sesión.
- [ ] La aplicación arranca en `http://localhost:3000`.

Comandos de verificación:

```powershell
node --env-file=.env .\node_modules\drizzle-kit\bin.cjs migrate
npm run db:seed
npm run dev
```

Notas:

- No usar `drizzle-kit generate` en este entorno si vuelve a provocar `spawn EPERM`.
- No ejecutar comandos Docker desde Codex si el acceso a Docker Desktop sigue fallando por permisos.

## 2. Calidad técnica mínima

- [ ] `npm run typecheck` pasa.
- [ ] `npm run lint` pasa.
- [ ] `npm run format:check` pasa.
- [ ] `npm run test` pasa.
- [ ] `npm run build -- --webpack` pasa en PowerShell local.

Comandos:

```powershell
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build -- --webpack
```

Si `.next` queda bloqueado en Windows, cerrar procesos de Node/Next y borrar `.next` manualmente antes de repetir el build.

## 3. Secretos y configuración

- [ ] `.env` no está versionado.
- [ ] `.env.local` no está versionado.
- [ ] `.env.example` contiene solo valores ficticios.
- [ ] `AUTH_SECRET` tiene al menos 32 caracteres.
- [ ] `OPENAI_API_KEY` no aparece en documentación, logs ni archivos versionados.
- [ ] `DATABASE_URL` apunta a la base local esperada.
- [ ] `APP_URL` y `NEXTAUTH_URL` apuntan a `http://localhost:3000` para el piloto local.

## 4. Autenticación y onboarding

- [ ] `/login` carga correctamente.
- [ ] `dev@example.local` puede iniciar sesión.
- [ ] Una contraseña incorrecta muestra error seguro.
- [ ] Rutas privadas redirigen a `/login` si no hay sesión.
- [ ] `/onboarding` permite seleccionar agente.
- [ ] El usuario puede completar onboarding.
- [ ] `/inicio` muestra agente, preferencias y créditos.

## 5. Conversación libre

- [ ] `/conversacion` carga después de iniciar sesión.
- [ ] Se puede enviar un mensaje normal.
- [ ] Se recibe respuesta del asistente.
- [ ] Se registra uso técnico reciente.
- [ ] Se puede cerrar sesión conversacional.
- [ ] Al cerrar, se libera o consume la reserva de créditos correctamente.
- [ ] Los errores de IA muestran mensaje seguro.
- [ ] `/historial` muestra conversaciones y sesiones recientes sin exponer mensajes completos.

## 6. Seguridad conversacional

- [ ] Un mensaje de autolesión activa respuesta segura.
- [ ] Una petición de medicación activa límite sanitario.
- [ ] Una petición diagnóstica activa límite no clínico.
- [ ] Un intento de prompt injection no revela reglas internas.
- [ ] `npm run test` confirma las regresiones de seguridad.
- [ ] La respuesta segura no depende de saldo disponible.
- [ ] Los eventos de seguridad quedan registrados sin duplicar contenido completo.

No inventar teléfonos ni recursos específicos. Los recursos localizados deberán resolverse dinámicamente cuando esa capacidad esté implementada.

## 7. Modos guiados

- [ ] `/modos/ordenar-cabeza` está disponible.
- [ ] `/modos/tomar-decision` está disponible.
- [ ] `/modos/habito` está disponible.
- [ ] `/modos/diario-guiado` está disponible.
- [ ] `/modos/conversacion-dificil` está disponible.
- [ ] `/modos/desarrollo-personal` está disponible.
- [ ] Cada flujo avanza paso a paso.
- [ ] Ningún modo decide por el usuario ni promete resultados clínicos o transformadores.
- [ ] El usuario puede completar o cerrar la sesión.
- [ ] Las sesiones guiadas aparecen en resúmenes recientes.
- [ ] El feedback de sesión puede guardarse.

## 8. Memoria

- [ ] La memoria está activada solo si el consentimiento lo permite.
- [ ] Una conversación normal puede generar recuerdos propuestos al cerrar sesión.
- [ ] `/memoria` muestra recuerdos por estado.
- [ ] El usuario puede confirmar un recuerdo.
- [ ] El usuario puede descartar un recuerdo.
- [ ] El usuario puede archivar un recuerdo confirmado.
- [ ] El usuario puede eliminar un recuerdo.
- [ ] Recuerdos archivados o eliminados no quedan disponibles para recuperación.
- [ ] Un recuerdo confirmado puede aportar continuidad en conversación normal sin aparecer en modo privado.
- [ ] Modo privado no crea recuerdos.

## 9. Privacidad y control

- [ ] `/privacidad` muestra consentimientos.
- [ ] Se puede conceder y revocar memoria.
- [ ] Se puede conceder y revocar analítica opcional.
- [ ] `/privacidad/exportar` descarga JSON.
- [ ] El export no incluye `password_hash`.
- [ ] El borrado de cuenta exige la frase exacta.
- [ ] Una frase incorrecta no borra datos.
- [ ] Una frase correcta borra datos locales y desactiva la cuenta.
- [ ] El usuario entiende que el MVP local no gestiona backups externos ni datos de proveedores.

## 10. Auditoría y métricas

- [ ] Los cambios de consentimiento generan eventos de auditoría.
- [ ] Confirmar, descartar, archivar o eliminar recuerdos genera eventos de auditoría.
- [ ] Exportar datos genera evento de auditoría.
- [ ] Borrar cuenta genera evidencia mínima de auditoría.
- [ ] `/metricas` carga para usuario autenticado.
- [ ] `/metricas` no muestra contenido de conversaciones ni recuerdos.
- [ ] `/metricas` muestra usuarios, sesiones, feedback, memoria, seguridad, auditoría y uso técnico.

## 11. Datos de prueba

- [ ] Los datos usados en piloto son ficticios o explícitamente autorizados.
- [ ] No se copian conversaciones reales sensibles al repositorio.
- [ ] No se pegan claves, tokens ni secretos en prompts o issues.
- [ ] El usuario piloto entiende que es un MVP no clínico.

## 12. Incidentes y soporte

- [ ] `docs/architecture/incident-response.md` está disponible.
- [ ] Existe una persona responsable de parar la prueba si algo falla.
- [ ] Existe un canal claro para reportar errores.
- [ ] Se sabe cómo revocar sesión o borrar la cuenta local.
- [ ] Se sabe cómo detener la app y la base local.
- [ ] Se sabe cómo rotar secretos si una clave se expone.

## 13. Criterios de no salida

No iniciar piloto si ocurre cualquiera de estas condiciones:

- fallan typecheck, lint, test o build;
- la app no puede iniciar sesión;
- la conversación no responde;
- los guardrails no interrumpen riesgos obvios;
- exportación o borrado fallan;
- los consentimientos no se registran;
- se detecta un secreto en archivos versionados;
- hay mezcla de datos entre usuarios;
- el usuario piloto espera terapia, diagnóstico o atención clínica.

## 14. Decisión final

Antes de invitar a usuarios piloto:

- [ ] Go: todos los puntos críticos están verificados.
- [ ] Go limitado: solo prueba interna con datos ficticios.
- [ ] No-go: corregir bloqueantes antes de continuar.

Responsable:

Fecha:

Notas:
