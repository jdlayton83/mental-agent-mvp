# Backlog ejecutable del MVP

**Estado:** Propuesto para ejecución  
**Fecha:** 12 de junio de 2026  
**Documento relacionado:** ADR-0001 — Stack tecnológico del MVP

## 1. Objetivo

Este backlog convierte las especificaciones del producto y las decisiones arquitectónicas aprobadas en un plan de construcción ejecutable.

El orden de implementación prioriza:

1. validación temprana del producto;
2. reducción de riesgo técnico;
3. seguridad y privacidad desde el inicio;
4. dependencias reales entre funcionalidades;
5. entrega incremental;
6. capacidad de probar el producto con usuarios piloto cuanto antes.

## 2. Principios de ejecución

- No se iniciará una épica dependiente hasta completar su base técnica.
- Cada historia deberá incluir pruebas.
- La documentación afectada deberá actualizarse en la misma tarea.
- Las funcionalidades no incluidas en el MVP no deberán introducirse por anticipado.
- Ninguna tarea se considerará completada si rompe aislamiento, trazabilidad o control del usuario.
- Se priorizará una experiencia usable frente a una arquitectura sobredimensionada.

## 3. Orden de ejecución

| Fase | Nombre | Resultado principal |
|---|---|---|
| 0 | Base del proyecto | Repositorio ejecutable y entorno local reproducible |
| 1 | Identidad y acceso | Usuario autenticado y onboarding mínimo |
| 2 | Agente y conversación | Chat básico funcional con personalidad estable |
| 3 | Sesiones y créditos | Sesiones medibles y consumo simulado |
| 4 | Seguridad conversacional | Clasificación de riesgo y respuestas seguras |
| 5 | Memoria | Resumen, extracción, consulta y recuperación |
| 6 | Modo guiado | Primer flujo guiado completo |
| 7 | Privacidad y control | Consentimientos, borrado y control de datos |
| 8 | Validación piloto | Producto preparado para pruebas con usuarios |

---

# ÉPICA 0 — Base técnica del proyecto

## Objetivo

Disponer de un entorno local reproducible, con estructura modular, base de datos, validación y automatización mínima.

## Historia 0.1 — Inicializar el repositorio

**Como** equipo de desarrollo  
**Quiero** una estructura de proyecto coherente con el ADR-0001  
**Para** evitar decisiones técnicas inconsistentes.

### Criterios de aceptación

- Proyecto Next.js con App Router.
- TypeScript en modo estricto.
- ESLint y Prettier configurados.
- Estructura modular creada.
- No existe lógica de negocio en componentes visuales.
- Existe `.env.example`.
- `.env` está en `.gitignore`.
- El proyecto compila sin errores.

### Prioridad

Crítica.

### Dependencias

Ninguna.

### Pruebas

- `npm run lint`
- `npm run typecheck`
- `npm run build`

---

## Historia 0.2 — Configurar PostgreSQL y pgvector

**Como** desarrollador  
**Quiero** levantar PostgreSQL con pgvector mediante Docker Compose  
**Para** disponer de persistencia local reproducible.

### Criterios de aceptación

- Docker Compose levanta PostgreSQL.
- La extensión pgvector está disponible.
- Existe health check.
- Las credenciales se configuran por variables.
- Los datos persisten en volumen local.
- Existe comando documentado para reiniciar el entorno.

### Prioridad

Crítica.

### Dependencias

Historia 0.1.

### Pruebas

- Conexión desde la aplicación.
- Verificación de extensión `vector`.
- Reinicio sin pérdida accidental de datos.

---

## Historia 0.3 — Configurar Drizzle y migraciones

**Como** desarrollador  
**Quiero** gestionar el esquema mediante migraciones  
**Para** asegurar trazabilidad y portabilidad.

### Criterios de aceptación

- Drizzle configurado.
- Primera migración ejecutable.
- Historial de migraciones disponible.
- No se requieren cambios manuales fuera de migraciones.
- Se admite SQL manual para pgvector, índices y RLS cuando proceda.

### Prioridad

Crítica.

### Dependencias

Historia 0.2.

### Pruebas

- Aplicar migración desde cero.
- Repetir despliegue en una base vacía.
- Validar rollback cuando sea seguro.

---

## Historia 0.4 — Configurar validación y configuración centralizada

**Como** sistema  
**Quiero** validar variables y entradas  
**Para** fallar de forma segura y predecible.

### Criterios de aceptación

- Variables de entorno validadas con Zod.
- Configuración centralizada.
- Error claro si falta una variable obligatoria.
- No hay accesos dispersos a `process.env`.
- Existen valores seguros para desarrollo.

### Prioridad

Alta.

### Dependencias

Historia 0.1.

---

## Puerta de salida de la fase 0

La fase se considera completada cuando:

- el proyecto arranca con un comando documentado;
- la base de datos está disponible;
- las migraciones se ejecutan;
- lint, typecheck y build son correctos;
- existe una estructura modular coherente.

---

# ÉPICA 1 — Usuario, autenticación y onboarding

## Objetivo

Permitir que una persona acceda al sistema y configure su agente inicial.

## Historia 1.1 — Modelo de usuario y perfil

**Como** sistema  
**Quiero** almacenar cuenta, perfil y preferencias  
**Para** personalizar la experiencia.

### Criterios de aceptación

- Tablas `users`, `user_profiles` y `user_preferences`.
- Identificadores UUID.
- Fechas en UTC.
- Restricción de unicidad donde corresponda.
- Sin fecha de nacimiento completa.
- Confirmación de mayoría de edad registrada.

### Prioridad

Crítica.

### Dependencias

Fase 0.

---

## Historia 1.2 — Autenticación inicial

**Como** usuario  
**Quiero** iniciar y cerrar sesión  
**Para** acceder de forma segura a mis datos.

### Criterios de aceptación

- Auth.js integrado.
- Sesión mediante cookie segura.
- Inicio y cierre de sesión.
- Protección de rutas privadas.
- Revocación de sesión.
- Usuario de desarrollo mediante seed.
- La autorización no depende del frontend.

### Prioridad

Crítica.

### Dependencias

Historia 1.1.

### Pruebas

- Acceso autenticado.
- Acceso anónimo bloqueado.
- Sesión invalidada tras cierre.
- Usuario A no accede a recursos de usuario B.

---

## Historia 1.3 — Onboarding

**Como** usuario nuevo  
**Quiero** configurar mi agente  
**Para** comenzar con una experiencia personalizada.

### Criterios de aceptación

- Selección entre Nora, Leo y Alma.
- Nombre personalizado opcional.
- Selección de tono.
- Selección de estilo de respuesta.
- Preferencia de longitud.
- Nivel de iniciativa.
- Objetivo principal opcional.
- Confirmación de que el agente es una IA y no un profesional sanitario.
- Onboarding reanudable si queda incompleto.

### Prioridad

Alta.

### Dependencias

Historia 1.2.

---

## Puerta de salida de la fase 1

- usuario autenticado;
- onboarding completado;
- agente principal creado;
- preferencias persistidas;
- aislamiento entre usuarios probado.

---

# ÉPICA 2 — Agente y conversación básica

## Objetivo

Permitir una conversación de texto útil, coherente y trazable.

## Historia 2.1 — Modelo de agentes y plantillas

### Criterios de aceptación

- Tablas `agent_templates` y `agents`.
- Seeds de Nora, Leo y Alma.
- Un único agente principal activo por usuario.
- Personalidad y tono persistidos.
- Configuración separada de la memoria del usuario.

### Prioridad

Crítica.

### Dependencias

Fase 1.

---

## Historia 2.2 — Gateway de IA

**Como** aplicación  
**Quiero** centralizar todas las llamadas al proveedor  
**Para** evitar acoplamiento directo.

### Criterios de aceptación

- Interfaz común para texto, salida estructurada, clasificación y embeddings.
- Adaptador OpenAI aislado.
- Ningún módulo externo importa el SDK de OpenAI.
- Timeouts configurables.
- Máximo de reintentos limitado.
- Errores normalizados.
- Registro de modelo, latencia, tokens y coste.
- Identificador de correlación.

### Prioridad

Crítica.

### Dependencias

Fase 0.

---

## Historia 2.3 — Constructor de contexto

**Como** sistema  
**Quiero** construir el contexto de forma controlada  
**Para** mantener personalidad, seguridad y eficiencia.

### Criterios de aceptación

- Jerarquía de instrucciones definida.
- Identidad del agente aplicada.
- Preferencias aplicadas.
- Memoria todavía opcional.
- No se incluye historial completo indiscriminadamente.
- Contenido externo tratado como no confiable.
- Presupuesto de contexto configurable.

### Prioridad

Crítica.

### Dependencias

Historia 2.2.

---

## Historia 2.4 — Conversación libre

**Como** usuario  
**Quiero** conversar por texto con mi agente  
**Para** recibir acompañamiento personal no clínico.

### Criterios de aceptación

- Crear conversación.
- Enviar mensaje.
- Recibir respuesta en streaming.
- Guardar mensajes por orden.
- Mostrar errores seguros.
- Cancelar una respuesta.
- Reanudar una conversación.
- Historial visible.
- La personalidad permanece estable.

### Prioridad

Crítica.

### Dependencias

Historias 2.1, 2.2 y 2.3.

### Pruebas

- Conversación completa.
- Cancelación.
- Error del proveedor.
- Reintento limitado.
- Aislamiento entre usuarios.

---

## Puerta de salida de la fase 2

- chat de texto funcional;
- respuesta en streaming;
- proveedor desacoplado;
- historial persistido;
- costes y uso registrados;
- pruebas de aislamiento superadas.

---

# ÉPICA 3 — Sesiones, uso y créditos

## Objetivo

Medir cada interacción y simular el futuro modelo comercial sin pagos reales.

## Historia 3.1 — Modelo de sesiones

### Criterios de aceptación

- Tablas `conversations`, `sessions` y `messages`.
- Estados de sesión validados.
- Inicio, pausa, reanudación y cierre.
- Duración activa y total.
- Última actividad.
- Cierre por inactividad configurable.

### Prioridad

Alta.

### Dependencias

Fase 2.

---

## Historia 3.2 — Cartera y transacciones

### Criterios de aceptación

- Tablas `credit_wallets` y `credit_transactions`.
- Saldo inicial configurable.
- Historial inmutable.
- Correcciones mediante transacción compensatoria.
- No existe saldo negativo ordinario.
- Operaciones protegidas por transacción de base de datos.

### Prioridad

Alta.

### Dependencias

Historia 3.1.

---

## Historia 3.3 — Reserva y consumo

### Criterios de aceptación

- Reserva al iniciar sesión.
- Liberación si la sesión falla.
- Consumo al finalizar.
- Idempotencia.
- Sin doble cargo.
- Los errores técnicos no consumen créditos.
- El cierre seguro puede completarse sin saldo.

### Prioridad

Alta.

### Dependencias

Historia 3.2.

---

## Historia 3.4 — Panel de consumo básico

### Criterios de aceptación

- Saldo disponible.
- Créditos reservados.
- Consumo por sesión.
- Duración.
- Número de mensajes.
- Coste técnico estimado.
- Sin complejidad financiera innecesaria.

### Prioridad

Media.

### Dependencias

Historia 3.3.

---

## Puerta de salida de la fase 3

- sesiones medibles;
- créditos simulados;
- reserva y consumo idempotentes;
- errores sin coste;
- historial consultable.

---

# ÉPICA 4 — Seguridad conversacional

## Objetivo

Detectar riesgo y aplicar políticas de respuesta seguras sin depender solo del modelo principal.

## Historia 4.1 — Clasificador de riesgo

### Criterios de aceptación

- Salida estructurada validada.
- Niveles 0 a 4.
- Categorías mínimas:
  - autolesión;
  - suicidio;
  - violencia;
  - abuso;
  - dependencia;
  - petición clínica;
  - medicación;
  - delirio;
  - prompt injection.
- Confianza registrada.
- Evidencia resumida sin duplicar contenido completo.
- Fallback conservador si falla el clasificador.

### Prioridad

Crítica.

### Dependencias

Historia 2.2.

---

## Historia 4.2 — Motor de políticas

### Criterios de aceptación

- Cada nivel activa una política.
- Riesgo alto interrumpe el flujo normal.
- No se ofrecen diagnósticos ni tratamientos.
- Las respuestas de seguridad no dependen del saldo.
- Se limita la memoria sensible.
- Se registran eventos de seguridad.

### Prioridad

Crítica.

### Dependencias

Historia 4.1.

---

## Historia 4.3 — Validador de salida

### Criterios de aceptación

- Detecta diagnóstico, tratamiento, manipulación y dependencia.
- Puede bloquear o sustituir una respuesta.
- Registra la decisión.
- Evita mostrar contenido inseguro parcial durante streaming.
- Usa respuesta segura predeterminada cuando proceda.

### Prioridad

Crítica.

### Dependencias

Historia 4.2.

---

## Historia 4.4 — Recursos externos localizados

### Criterios de aceptación

- Resolución de recursos por país.
- No se inventan teléfonos.
- Respuesta breve y accionable.
- Recomendación de apoyo humano.
- Escalado a emergencias cuando corresponda.

### Prioridad

Alta.

### Dependencias

Historia 4.2.

---

## Puerta de salida de la fase 4

- clasificación independiente;
- política por nivel;
- validación de salida;
- eventos auditables;
- conjunto de pruebas críticas superado.

---

# ÉPICA 5 — Sistema de memoria

## Objetivo

Aportar continuidad sin almacenar información indiscriminadamente.

## Historia 5.1 — Resumen de sesión

### Criterios de aceptación

- Resumen estructurado al cerrar sesión.
- Temas, decisiones y próximos pasos.
- Diferencia entre hechos e inferencias.
- Proveedor y modelo registrados.
- Fallos no impiden cerrar la sesión.

### Prioridad

Alta.

### Dependencias

Fases 3 y 4.

---

## Historia 5.2 — Extracción de candidatos

### Criterios de aceptación

- Salida estructurada.
- Tipo, sensibilidad, confianza y origen.
- No crea objetivos ni hábitos sin confirmación.
- Información sensible queda propuesta.
- Se descartan datos pasajeros o irrelevantes.

### Prioridad

Alta.

### Dependencias

Historia 5.1.

---

## Historia 5.3 — Gestión de recuerdos

### Criterios de aceptación

- Consultar recuerdos.
- Confirmar.
- Editar.
- Rechazar.
- Archivar.
- Eliminar.
- Versionado.
- Trazabilidad.
- El borrado elimina el embedding asociado.

### Prioridad

Crítica.

### Dependencias

Historia 5.2.

---

## Historia 5.4 — Embeddings y recuperación

### Criterios de aceptación

- Embedding por recuerdo recuperable.
- Consulta filtrada por `user_id`.
- Filtros por estado, sensibilidad y expiración.
- Recuperación limitada entre 3 y 8 recuerdos.
- Ranking por similitud, recencia y confianza.
- No se usa búsqueda global con filtrado posterior.

### Prioridad

Alta.

### Dependencias

Historia 5.3.

---

## Historia 5.5 — Uso visible y prudente de memoria

### Criterios de aceptación

- Solo se incorpora memoria relevante.
- Las inferencias se presentan como hipótesis.
- No se utilizan recuerdos eliminados.
- No se muestran recuerdos sensibles sin contexto.
- El usuario puede desactivar memoria.

### Prioridad

Alta.

### Dependencias

Historia 5.4.

---

## Puerta de salida de la fase 5

- resumen funcional;
- candidatos a memoria;
- confirmación del usuario;
- edición y borrado;
- recuperación semántica aislada;
- memoria opcional.

---

# ÉPICA 6 — Primer modo guiado

## Objetivo

Validar si una experiencia estructurada aporta más valor que el chat libre.

## Historia 6.1 — Catálogo de modos

### Criterios de aceptación

- Tabla `guided_modes`.
- Configuración versionada.
- Estado activo o inactivo.
- Coste y mensajes incluidos configurables.
- No se codifica el flujo íntegro en la interfaz.

### Prioridad

Alta.

### Dependencias

Fase 3.

---

## Historia 6.2 — Modo “Tomar una decisión”

### Criterios de aceptación

El flujo permite:

1. definir la decisión;
2. identificar opciones;
3. identificar criterios;
4. revisar riesgos;
5. revisar consecuencias;
6. diferenciar miedo y evidencia;
7. elegir siguiente paso;
8. resumir.

Además:

- una pregunta principal cada vez;
- el usuario puede salir;
- el agente no decide por el usuario;
- el progreso se conserva;
- se genera resumen final;
- los recuerdos requieren las mismas reglas de confirmación.

### Prioridad

Crítica.

### Dependencias

Fases 2, 3, 4 y 5.

---

## Historia 6.3 — Comparación entre chat libre y modo guiado

### Criterios de aceptación

- Se registra tipo de sesión.
- Se mide finalización.
- Se mide duración.
- Se mide satisfacción.
- Se mide intención de reutilización.
- Se mide coste técnico.
- No se altera la experiencia para forzar una métrica.

### Prioridad

Alta.

### Dependencias

Historia 6.2.

---

## Puerta de salida de la fase 6

- modo guiado completo;
- progresión persistida;
- resumen final;
- métricas comparables con conversación libre.

---

# ÉPICA 7 — Privacidad, consentimiento y control

## Objetivo

Permitir al usuario comprender y controlar sus datos.

## Historia 7.1 — Consentimientos mínimos

### Criterios de aceptación

- Términos.
- Privacidad.
- Memoria.
- Analítica opcional separada.
- Versión y fecha registradas.
- Revocación disponible.
- No se agrupan finalidades distintas.

### Prioridad

Crítica.

### Dependencias

Fase 1.

---

## Historia 7.2 — Exportación de datos

### Criterios de aceptación

- Exportación de perfil, conversaciones, sesiones, recuerdos, objetivos y consentimientos.
- Formato JSON estructurado.
- Verificación de identidad.
- Registro de la acción.
- No incluye datos de otros usuarios.

### Prioridad

Media.

### Dependencias

Fases 1, 2 y 5.

---

## Historia 7.3 — Borrado de cuenta y datos

### Criterios de aceptación

- Borrar conversación.
- Borrar sesión.
- Borrar recuerdo.
- Borrar historial.
- Borrar cuenta.
- Eliminar embeddings.
- Revocar sesiones.
- Registrar la operación sin conservar contenido innecesario.
- Informar sobre cualquier retención técnica obligatoria.

### Prioridad

Crítica.

### Dependencias

Fases 1, 2 y 5.

---

## Historia 7.4 — Modo privado básico

### Criterios de aceptación

- No crea recuerdos.
- No genera embeddings.
- No actualiza objetivos o hábitos.
- Puede eliminar la conversación al cerrar.
- El usuario conoce el comportamiento antes de empezar.

### Prioridad

Media.

### Dependencias

Fase 5.

---

## Puerta de salida de la fase 7

- consentimientos versionados;
- memoria revocable;
- exportación;
- borrado;
- modo privado básico;
- auditoría de acciones críticas.

---

# ÉPICA 8 — Preparación del piloto

## Objetivo

Preparar una versión suficientemente estable para validar utilidad, recurrencia y disposición a pagar.

## Historia 8.1 — Instrumentación de métricas

### Criterios de aceptación

Se registran, sin contenido sensible:

- usuarios que completan onboarding;
- primera conversación;
- sesiones completadas;
- retorno a 7 días;
- retorno a 30 días;
- uso de chat libre;
- uso del modo guiado;
- recuerdos confirmados;
- recuerdos eliminados;
- satisfacción;
- intención de pago;
- coste por sesión;
- errores;
- eventos de seguridad.

### Prioridad

Alta.

### Dependencias

Fases anteriores.

---

## Historia 8.2 — Feedback dentro del producto

### Criterios de aceptación

- Valoración simple tras sesión.
- Pregunta opcional abierta.
- Registro separado del contenido íntimo.
- Posibilidad de omitir.
- No interrumpe respuestas de seguridad.

### Prioridad

Alta.

### Dependencias

Fase 2.

---

## Historia 8.3 — Datos de demostración y seeds

### Criterios de aceptación

- Usuarios ficticios.
- Conversaciones ficticias.
- Recuerdos ficticios.
- Escenarios de seguridad.
- Escenarios de créditos.
- Idempotencia del seed.
- Ningún dato personal real.

### Prioridad

Alta.

### Dependencias

Todas las entidades principales.

---

## Historia 8.4 — Checklist de lanzamiento piloto

### Criterios de aceptación

- Pruebas críticas superadas.
- No existen secretos en Git.
- Dependencias revisadas.
- Borrado validado.
- Aislamiento validado.
- Logs sin contenido sensible.
- Presupuesto de uso configurado.
- Mensajes legales mínimos visibles.
- Canal de feedback disponible.
- Procedimiento de incidentes accesible.
- Backups probados si se usan datos reales.

### Prioridad

Crítica.

### Dependencias

Todas las fases.

---

# 4. Priorización global

## Must have

- Base técnica.
- Autenticación.
- Onboarding.
- Agente.
- Chat.
- Sesiones.
- Créditos simulados.
- Clasificación de riesgo.
- Respuesta segura.
- Resumen.
- Memoria confirmable.
- Borrado.
- Primer modo guiado.
- Métricas del piloto.

## Should have

- Panel de consumo.
- Exportación.
- Modo privado.
- Feedback integrado.
- Recuperación semántica avanzada.

## Could have

- Más modos guiados.
- Recordatorios.
- Seguimiento de hábitos.
- Objetivos longitudinales.
- Panel técnico avanzado.

## Won’t have en este MVP

- Voz.
- Vídeo.
- Cámara.
- Avatares.
- Pagos reales.
- Marketplace.
- Microservicios.
- Agentes autónomos.
- Integraciones externas amplias.
- Analítica emocional.

# 5. Definición general de terminado

Una historia solo estará terminada cuando:

- cumple sus criterios de aceptación;
- tiene pruebas unitarias o de integración apropiadas;
- no rompe aislamiento entre usuarios;
- registra errores de forma segura;
- no expone secretos;
- actualiza documentación cuando corresponda;
- supera lint, typecheck y build;
- no introduce funcionalidades fuera de alcance;
- tiene revisión de seguridad cuando afecte a datos, IA, memoria o autorización.

# 6. Recomendación de primer incremento

El primer incremento demostrable deberá incluir:

1. levantar el entorno;
2. crear usuario de desarrollo;
3. completar onboarding;
4. elegir agente;
5. abrir conversación;
6. enviar un mensaje;
7. recibir respuesta;
8. guardar conversación;
9. ver consumo técnico básico.

Este incremento permitirá validar la columna vertebral antes de incorporar memoria, créditos completos y guardrails avanzados.
