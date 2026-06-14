# Database Schema Specification

## 1. Propósito

Definir el modelo relacional mínimo para el MVP en PostgreSQL con pgvector. El esquema prioriza aislamiento, integridad, trazabilidad y capacidad de borrado.

## 2. Convenciones

- tablas y columnas en inglés y `snake_case`;
- UUID para entidades principales;
- `TIMESTAMPTZ` en UTC;
- `created_at` y `updated_at` cuando proceda;
- `deleted_at` solo donde el borrado lógico sea funcionalmente necesario;
- estados como texto validado inicialmente, con `CHECK` o catálogo;
- `JSONB` solo para metadatos no esenciales y con esquema documentado.

## 3. Principios de diseño

- toda entidad propiedad del usuario contiene `user_id`;
- toda consulta de usuario filtra por `user_id` en la base de datos;
- las relaciones sensibles no dependen de IDs difíciles de adivinar;
- conversación, memoria, auditoría y seguridad permanecen separadas;
- operaciones financieras simuladas usan ledger inmutable;
- el borrado lógico no impide el borrado físico exigible;
- los embeddings siempre referencian a su memoria de origen.

## 4. Entidades obligatorias del MVP

### Identidad y configuración

- `users`;
- `user_profiles`;
- `user_preferences`;
- `agent_templates`;
- `agents`;
- `guided_modes`;
- `consent_records`.

### Conversación

- `conversations`;
- `sessions`;
- `messages`;
- `session_summaries`.

### Memoria y seguimiento

- `memories`;
- `memory_embeddings`;
- `memory_versions`;
- `goals`;
- `habits`;
- `habit_checkins`;
- `commitments`.

### Créditos y costes

- `credit_wallets`;
- `credit_transactions`;
- `session_reservations`;
- `usage_events`;
- `provider_prices`.

### Seguridad y operación

- `safety_events`;
- `audit_events`;
- `prompt_versions`;
- `system_settings`.

`uploaded_files` y `multimodal_analyses` se crearán solo cuando se implemente carga real de archivos.

## 5. Tablas núcleo

### `users`

Campos esenciales:

- `id UUID PK`;
- `email_normalized VARCHAR(320) UNIQUE`;
- `password_hash TEXT NULL`;
- `auth_provider VARCHAR(50)`;
- `auth_provider_user_id TEXT NULL`;
- `status VARCHAR(30)`;
- `is_adult_confirmed BOOLEAN`;
- `locale VARCHAR(20)`;
- `timezone VARCHAR(100)`;
- `last_login_at`, `created_at`, `updated_at`, `deleted_at`.

Restricción única por proveedor cuando exista identidad externa. Nunca se almacena contraseña sin hash.

### `user_profiles`

- `id UUID PK`;
- `user_id UUID UNIQUE FK`;
- `display_name`, `preferred_name`;
- `country_code`, `language_code`, `timezone`;
- `onboarding_completed`, `onboarding_completed_at`;
- timestamps.

No se almacenará fecha de nacimiento completa salvo justificación futura.

### `user_preferences`

- `user_id UUID UNIQUE FK`;
- `response_length`;
- `preferred_tone`;
- `preferred_style`;
- `initiative_level`;
- `memory_enabled`;
- `private_mode_default`;
- `notifications_enabled`;
- `preferences JSONB`;
- timestamps.

Consentimientos jurídicos no se almacenan aquí; pertenecen a `consent_records`.

### `agent_templates`

- `id`, `code UNIQUE`, `name`, `description`;
- `base_tone`, `base_style`;
- `base_prompt_version_id`;
- `is_active`, `sort_order`;
- timestamps.

### `agents`

- `id`, `user_id`, `template_id`;
- `custom_name`, `tone`, `response_style`, `initiative_level`;
- `main_goal`, `topics_of_interest`, `topics_to_avoid`;
- `status`, `is_primary`;
- timestamps y `deleted_at`.

Índice único parcial: un agente principal activo por usuario.

### `guided_modes`

- `id`, `code UNIQUE`, `name`, `description`;
- `session_type`;
- `base_credit_cost`, `included_user_messages`;
- `prompt_version_id`, `flow_definition`;
- `is_active`, `sort_order`;
- timestamps.

## 6. Conversaciones y sesiones

### `conversations`

- `id`, `user_id`, `agent_id`;
- `title`, `conversation_type`, `status`;
- `last_message_at`;
- timestamps y `deleted_at`.

### `sessions`

- `id`, `user_id`, `agent_id`;
- `conversation_id NULL`, `guided_mode_id NULL`;
- `session_type`, `status`;
- `started_at`, `ended_at`, `paused_at`, `last_activity_at`;
- `active_duration_seconds`, `total_duration_seconds`;
- `base_credit_cost`, `included_user_messages`, `extra_credit_cost`, `total_credit_cost`;
- `estimated_technical_cost`;
- `risk_level`, `private_mode`;
- `pricing_rule_version`;
- `metadata`, timestamps.

### `messages`

- `id`, `user_id`, `agent_id`, `conversation_id`, `session_id NULL`;
- `role`, `content`, `content_format`;
- `sequence_number`;
- `provider`, `model`;
- `input_tokens`, `output_tokens`, `estimated_cost`;
- `safety_status`, `is_regenerated`, `parent_message_id`;
- timestamps y `deleted_at`.

Índice único por `(conversation_id, sequence_number)`. Los mensajes eliminados no se usarán en memoria.

### `session_summaries`

- `id`, `user_id`, `session_id`;
- `summary`, `main_topic`;
- `key_points`, `decisions`, `next_steps`;
- `memory_candidates`, `safety_summary`;
- `provider`, `model`, `prompt_version_id`;
- `status`, timestamps.

Un único resumen principal activo por sesión.

## 7. Memoria

### `memories`

- `id`, `user_id`, `agent_id NULL`, `session_id NULL`;
- `memory_type`, `title`, `content`, `normalized_content`;
- `source`, `status`, `confidence`, `sensitivity`;
- `relevance_score`;
- `is_confirmed_by_user`, `is_available_for_retrieval`;
- `expires_at`, `archived_at`, `deleted_at`;
- timestamps y `metadata`.

### `memory_embeddings`

- `id`, `memory_id`, `user_id`;
- `embedding VECTOR(n)`;
- `provider`, `model`, `dimension`, `embedding_version`;
- `is_active`, `estimated_cost`;
- timestamps.

Único por `(memory_id, embedding_version)` cuando esté activo. Toda consulta vectorial filtra `user_id` y estado antes de devolver resultados.

### `memory_versions`

- `id`, `memory_id`, `user_id`, `version_number`;
- contenido/estado anterior y nuevo;
- `change_source`, `change_reason`, `created_at`.

Único por `(memory_id, version_number)`.

### `goals`, `habits`, `habit_checkins`, `commitments`

Mantendrán `user_id`, origen, estado, confirmación, fechas y borrado. `progress_percentage` estará entre 0 y 100. Las revisiones de hábitos no se sobrescribirán.

## 8. Créditos y costes

### `credit_wallets`

- `id`, `user_id UNIQUE`;
- `available_balance`, `reserved_balance`;
- `status`, `lock_version`;
- timestamps.

No se almacenará `total_balance`; se calculará para evitar inconsistencias.

### `credit_transactions`

- `id`, `wallet_id`, `user_id`, `session_id NULL`;
- `transaction_type`, `amount`;
- `available_before`, `available_after`;
- `reserved_before`, `reserved_after`;
- `reason`, `source`, `idempotency_key UNIQUE NULL`;
- `metadata`, `created_at`.

Tabla inmutable.

### `session_reservations`

- `id`, `user_id`, `wallet_id`, `session_id UNIQUE`;
- `reserved_amount`, `consumed_amount`, `released_amount`;
- `status`, `idempotency_key UNIQUE`, `expires_at`;
- timestamps.

### `usage_events`

- `id`, `user_id`, `session_id NULL`, `message_id NULL`;
- `provider`, `model`, `operation_type`, `modality`;
- `input_units`, `output_units`, `duration_seconds`;
- `estimated_cost`, `credits_assigned`, `status`;
- `correlation_id`, `metadata`, `created_at`.

### `provider_prices`

- proveedor, modelo, operación y unidad;
- precio de entrada/salida, moneda;
- vigencia desde/hasta;
- fuente y timestamps.

Índice único para impedir intervalos duplicados incompatibles.

## 9. Seguridad, privacidad y auditoría

### `safety_events`

Almacena categoría, nivel, resumen mínimo, clasificador, política, acción, recursos y estado. No duplica el mensaje completo.

### `audit_events`

Almacena actor, acción, entidad, resultado, correlation ID y metadatos minimizados. No almacena secretos ni contenido de conversación.

### `consent_records`

- `user_id`, `consent_type`, `policy_version`, `status`;
- `granted_at`, `revoked_at`, `source`, `metadata`.

Se conserva historial; no se actualiza destructivamente una aceptación previa.

### `prompt_versions`

Código, versión, tipo, estado, contenido o referencia segura, checksum, autor y fechas. El acceso estará restringido.

## 10. Claves foráneas y borrado

- entidades propiedad del usuario: `ON DELETE RESTRICT` durante operación normal;
- proceso de eliminación de cuenta: job transaccional/orquestado que borra en orden y registra resultado;
- embeddings: `ON DELETE CASCADE` desde memoria;
- versiones y check-ins: cascada desde entidad principal cuando el borrado físico sea válido;
- ledger y auditoría: retención o seudonimización según obligación, nunca cascada accidental.

## 11. Índices prioritarios

- todos los `user_id` combinados con estado/fecha de consulta;
- mensajes por conversación y secuencia;
- sesiones por usuario y actividad;
- memorias por usuario, estado, tipo, expiración y recuperación;
- índice vectorial condicionado a embeddings activos;
- objetivos/hábitos por usuario y estado;
- transacciones por cartera y fecha;
- uso por sesión/proveedor/modelo;
- eventos de seguridad por nivel y fecha;
- auditoría por entidad y correlation ID.

## 12. Row-Level Security

Se implementará antes de beta como segunda barrera en tablas de usuario. La aplicación seguirá validando autorización en backend. Las conexiones administrativas y migraciones usarán roles separados.

## 13. Transacciones críticas

- crear cartera y saldo inicial;
- reservar/consumir/liberar créditos;
- completar sesión y generar resumen;
- crear/corregir/borrar memoria y embedding;
- revocar consentimiento y desactivar tratamiento;
- borrar usuario;
- registrar evento de seguridad de alta prioridad.

## 14. Retención y borrado

Las políticas se aplicarán por categoría. El borrado deberá alcanzar datos derivados, embeddings, archivos y proveedores. Los backups se gestionarán mediante expiración y restauraciones con lista de supresión.

## 15. Migraciones y seeds

- migraciones revisables y reproducibles;
- sin cambios manuales en producción;
- seeds idempotentes para plantillas, modos, prompts y datos ficticios;
- migraciones destructivas con plan de rollback o backup;
- validación en CI contra base vacía y base actualizada.

## 16. Pruebas críticas

- acceso horizontal entre usuarios;
- RLS y autorización de backend;
- concurrencia de cartera;
- idempotencia;
- borrado de memoria y embedding;
- expiración;
- eliminación de cuenta;
- reconstrucción de precios históricos;
- integridad de secuencia de mensajes;
- exportación de datos.

## 17. Decisiones pendientes

- ORM y estrategia exacta para pgvector;
- dimensión del embedding inicial;
- alcance inicial de RLS;
- política de particionado para mensajes/uso;
- cifrado de aplicación para campos altamente sensibles;
- plazos definitivos de retención.
