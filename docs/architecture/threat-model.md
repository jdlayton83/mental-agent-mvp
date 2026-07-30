# Threat model inicial del MVP local

## 1. Propósito

Este documento registra el modelo de amenazas inicial del MVP local de Mental Agent. Sirve para revisar si una prueba piloto pequeña, controlada y reversible puede hacerse con datos ficticios o explícitamente autorizados.

No declara preparación para producción, beta cerrada ni tratamiento amplio de datos reales. Deberá revisarse cuando cambien autenticación, autorización, memoria, proveedores de IA, despliegue, datos tratados, integraciones o controles de privacidad.

## 2. Alcance actual

Incluye:

- aplicación Next.js local;
- autenticación con credenciales y sesión JWT;
- PostgreSQL local en Docker;
- esquema Drizzle y migraciones manuales;
- conversación libre;
- modos guiados;
- memoria confirmable;
- compromisos;
- créditos simulados;
- consentimientos;
- exportación y borrado local;
- eventos de uso, seguridad y auditoría;
- proveedor de IA detrás del gateway;
- repositorio y CI.

No incluye:

- producción cloud;
- pagos reales;
- usuarios menores;
- terapia, diagnóstico o tratamiento;
- voz, vídeo, cámara o biometría;
- archivos subidos por usuarios;
- administración multirol;
- RLS como segunda barrera;
- backups gestionados.

## 3. Activos principales

| Activo | Riesgo principal | Sensibilidad |
|---|---|---|
| Cuenta y sesión | acceso no autorizado | confidencial |
| Conversaciones y mensajes | exposición o mezcla entre usuarios | confidencial |
| Recuerdos y resúmenes | inferencias persistentes incorrectas o sensibles | confidencial |
| Eventos de seguridad | exposición de situaciones de riesgo | altamente confidencial |
| Consentimientos y auditoría | pérdida de trazabilidad | confidencial |
| Claves y secretos | compromiso de proveedor o base de datos | altamente confidencial |
| Créditos y uso técnico | fraude, coste o métricas incorrectas | interna/confidencial |
| Código y migraciones | cambios inseguros o inconsistentes | interna |

## 4. Actores y capacidades

| Actor | Capacidades relevantes |
|---|---|
| Usuario autenticado legítimo | accede a sus datos, conversa, modifica recuerdos, exporta y borra su cuenta |
| Usuario anónimo | intenta acceder a rutas privadas o forzar acciones |
| Usuario malicioso autenticado | manipula IDs, formularios, prompts y contenido para acceder a datos ajenos o romper reglas |
| Proveedor de IA | procesa contexto minimizado enviado por el gateway |
| Desarrollador local | accede al repositorio, `.env`, base local y consola |
| Atacante externo remoto futuro | fuera del alcance local actual, pero relevante antes de cloud/beta |
| Dependencia comprometida | puede introducir código malicioso durante instalación o build |

## 5. Límites de confianza

| Límite | Control actual |
|---|---|
| Navegador a servidor Next.js | rutas protegidas con sesión centralizada y consentimiento obligatorio |
| Server actions a base de datos | usuario derivado de sesión y filtros por `user_id` |
| Aplicación a proveedor de IA | gateway central, adaptador OpenAI aislado y variables validadas |
| Memoria a contexto de IA | recuperación limitada, confirmación y modo privado sin memoria persistente |
| Repositorio a secretos locales | `.env` ignorado, `.env.example` ficticio y escaneo de secretos |
| Migraciones a base de datos | migraciones manuales registradas y `db:check` |
| CI a calidad mínima | `npm run ci` agrupa typecheck, lint, tests, checks, formato y build |

## 6. Amenazas y mitigaciones actuales

| Amenaza | Mitigaciones actuales | Riesgo residual |
|---|---|---|
| Robo de cuenta o sesión | contraseñas con hash, cookies de sesión, `session_version`, cierre de sesión, rutas protegidas | falta verificación de correo, recuperación segura, rate limiting y MFA administrativa |
| Acceso horizontal | consultas server-side filtradas por `user_id`, checks de rutas protegidas y pruebas/reglas de presentación | RLS aún no está activado como segunda barrera |
| Manipulación de formularios o IDs | validación Zod, server actions autenticadas, ownership checks y acciones idempotentes | falta cobertura de pruebas de integración multiusuario más amplia |
| SQL injection | Drizzle, consultas parametrizadas y ausencia de SQL construido con entrada de usuario | revisar todo SQL manual nuevo antes de fusionar |
| Prompt injection | clasificador local, output validator, respuestas seguras, contexto trata datos externos como no confiables | detección local es básica y deberá reforzarse antes de usuarios reales amplios |
| Respuesta insegura de IA | límites no clínicos, safety router, output validation, eventos de seguridad y pruebas de regresión | falsos negativos siguen siendo posibles; piloto debe ser controlado |
| Mezcla o contaminación de memoria | recuerdos por usuario, estados confirmables, modo privado, borrado/archivo excluidos de recuperación normal | embeddings avanzados y RLS deberán revisarse antes de ampliar memoria semántica |
| Exposición de secretos | `.env` fuera de Git, secret scan, env centralizado, proveedor aislado | el usuario no deberá pegar claves reales en prompts, issues ni documentos |
| Logs con datos sensibles | eventos minimizados y checks de privacidad/exportación | consola local y capturas manuales siguen siendo responsabilidad operativa |
| Borrado incompleto | borrado local de cuenta y datos derivados, export sin `password_hash`, auditoría mínima | no hay backups gestionados; proveedores externos pueden requerir proceso manual |
| Dependencia comprometida | lockfile, `npm run ci`, secret scan y dependencia limitada | falta SCA avanzada y política formal de actualización |
| Coste o abuso del proveedor | créditos simulados, uso técnico, errores normalizados y métricas | no hay rate limiting real ni presupuestos automáticos de proveedor |
| Base local expuesta | Docker local, credenciales de desarrollo, sin comandos Docker desde Codex | el entorno local no debe exponerse a red pública |
| Migración inconsistente | `drizzle-kit generate` desactivado en este entorno, migraciones manuales con journal y `db:check` | las migraciones manuales requieren revisión cuidadosa |
| Fallo de CI/build en Windows | build con webpack, checks dedicados y fallback `dev:local` | `.next` puede quedar bloqueado por procesos locales |

## 7. Riesgos no aceptables para piloto

No deberá iniciarse un piloto, ni siquiera limitado, si ocurre cualquiera de estas condiciones:

- `npm run ci` falla;
- hay secretos reales en archivos versionados;
- el login o las rutas protegidas fallan;
- se detecta acceso a datos de otro usuario;
- los guardrails no interrumpen señales obvias de riesgo;
- exportación, borrado o consentimientos no funcionan;
- la app se usa como terapia, diagnóstico, tratamiento o emergencia;
- la base local se expone a red pública;
- se usarán datos reales sin consentimiento explícito y revisión adicional.

## 8. Riesgos aceptables solo para prueba local controlada

Estos riesgos podrán aceptarse temporalmente solo para pruebas locales con datos ficticios o controlados:

- ausencia de RLS como segunda barrera;
- ausencia de MFA administrativa;
- ausencia de backups gestionados;
- ausencia de rate limiting real;
- secret management basado en `.env` local;
- dependencias revisadas por CI básico, sin SCA empresarial;
- proveedor de IA configurado por clave local.

## 9. Controles requeridos antes de datos reales amplios

Antes de pasar a beta cerrada o datos reales no triviales deberán revisarse como mínimo:

- RLS o barrera equivalente probada;
- rate limiting por identidad y operación;
- verificación y recuperación segura de cuenta;
- MFA para administración;
- gestión de secretos fuera de `.env`;
- backups cifrados y restauración probada;
- contrato y revisión de proveedor de IA;
- retención definida;
- DPIA decidida o iniciada;
- pruebas de aislamiento multiusuario;
- simulacro de incidente de fuga entre usuarios o secreto expuesto.

## 10. Mantenimiento

El threat model deberá actualizarse cuando:

- se cree o cambie una tabla sensible;
- se añada proveedor externo;
- se modifique autenticación, autorización o sesiones;
- se amplíe memoria, embeddings o recuperación;
- se añada archivo, voz, vídeo, cámara o biometría;
- cambie el despliegue local a cloud;
- se produzca un incidente o casi incidente;
- una prueba revele un nuevo riesgo relevante.
