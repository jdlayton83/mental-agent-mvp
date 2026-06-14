# LLM Provider Abstraction Specification

## 1. Propósito

Evitar acoplamiento a un proveedor, modelo o SDK y centralizar selección, costes, errores, seguridad y observabilidad.

## 2. Regla arquitectónica

La lógica de negocio no importará SDK de proveedores. Todas las operaciones pasarán por `AIGateway` y adaptadores tipados.

Flujo:

1. el dominio solicita una operación normalizada;
2. el router selecciona capacidad, proveedor y modelo;
3. el adaptador traduce la solicitud;
4. el proveedor responde;
5. el adaptador normaliza respuesta o error;
6. se registra uso, coste y latencia;
7. la salida se valida;
8. el dominio recibe un resultado común.

## 3. Capacidades

- texto y chat;
- salida estructurada;
- clasificación y moderación;
- embeddings;
- visión y documentos;
- transcripción y síntesis de voz;
- streaming;
- herramientas;
- tiempo real futuro.

Cada modelo declarará sus capacidades. Una operación no se enviará a un modelo incompatible.

## 4. Componentes

- `AIProvider`: contrato de capacidades;
- `AIGateway`: punto único de entrada;
- `AIRouter`: selección de modelo;
- `AIModelRegistry`: catálogo y estado;
- `PromptRegistry`: prompts versionados;
- `UsageTracker`: métricas técnicas;
- `CostCalculator`: cálculo histórico;
- `SafetyValidator`: validación previa y posterior;
- `FallbackManager`: reintentos y alternativas;
- `ProviderHealthMonitor`: salud y circuit breaker.

## 5. Solicitud normalizada

Campos mínimos:

- `operationType`;
- `messages` o entrada estructurada;
- `systemInstructions` ya construidas;
- `responseSchema` cuando proceda;
- `capabilitiesRequired`;
- `sensitivity`;
- `costBudget`;
- `timeoutMs`;
- `streaming`;
- `tools` autorizadas;
- `metadata` minimizada;
- `correlationId`.

No incluirá secretos, datos de cuenta innecesarios ni acceso directo a bases de datos.

## 6. Respuesta normalizada

- contenido o datos estructurados;
- proveedor y modelo;
- motivo de finalización;
- uso de entrada, salida y caché;
- latencia;
- coste estimado;
- llamadas a herramientas;
- metadatos de seguridad;
- correlation ID.

La respuesta nativa completa solo se conservará cuando exista necesidad técnica y nunca en logs generales.

## 7. Errores

Categorías comunes:

- autenticación/autorización;
- rate limit;
- timeout;
- indisponibilidad;
- petición inválida;
- límite de contexto;
- contenido bloqueado;
- capacidad no soportada;
- salida malformada;
- red;
- presupuesto excedido;
- error desconocido.

Cada error indicará si es reintentable y ofrecerá un mensaje seguro al usuario.

## 8. Router y estrategia inicial

La selección considerará:

- tarea y modalidad;
- calidad mínima;
- sensibilidad;
- contexto;
- salida estructurada;
- latencia;
- coste máximo;
- disponibilidad;
- política de residencia y retención.

Configuración inicial recomendada:

- conversación: modelo de calidad alta;
- clasificación: modelo rápido y económico;
- resumen y memoria: salida estructurada;
- embeddings: modelo específico;
- proveedor simulado para tests.

## 9. Registro de modelos

Cada entrada tendrá:

- proveedor y `model_id`;
- capacidades;
- ventana de contexto;
- límites de salida;
- streaming, tools y structured output;
- tier de calidad y latencia;
- precios versionados;
- región y política de tratamiento;
- estado: `testing`, `active`, `degraded`, `disabled`, `retired`.

## 10. Prompts

Los prompts estarán fuera de adaptadores y código de interfaz. Tendrán código, versión, estado, propietario, cambios y pruebas asociadas.

Jerarquía:

1. seguridad y privacidad;
2. políticas de producto;
3. identidad del agente;
4. modo guiado;
5. preferencias;
6. memoria filtrada;
7. mensajes recientes;
8. mensaje actual;
9. contenido externo no confiable.

Los documentos y herramientas nunca podrán elevar su prioridad.

## 11. Salidas estructuradas

Se usarán en clasificación de riesgo, resumen, memoria, intención y evaluación. Toda salida se validará con esquema.

Ante fallo:

1. registrar;
2. reintento limitado;
3. reparación estructurada opcional;
4. fallback;
5. respuesta segura si no puede garantizarse integridad.

## 12. Contexto y tokens

La estrategia priorizará:

- instrucciones esenciales;
- preferencias relevantes;
- recuerdos seleccionados;
- resumen vigente;
- mensajes recientes.

Antes de llamar al modelo se estimará el contexto. Si supera presupuesto, se reducirá memoria, se resumirá o se cambiará de modelo. No se enviará todo el historial.

## 13. Reintentos, timeouts y circuit breaker

- máximo inicial de dos reintentos para errores recuperables;
- espera exponencial con jitter;
- límite total de tiempo;
- sin reintento automático para errores de autenticación, contenido bloqueado o petición inválida;
- circuit breaker por proveedor y capacidad;
- fallback ordenado y configurable.

## 14. Streaming y cancelación

El usuario podrá cancelar. La cancelación cerrará recursos, registrará consumo parcial y evitará cobros duplicados. La validación de seguridad deberá funcionar también en streaming mediante estrategia incremental o buffer cuando el riesgo lo exija.

## 15. Herramientas

Cada herramienta declarará:

- esquema;
- permisos;
- autorización;
- necesidad de confirmación;
- idempotencia;
- timeout;
- límites;
- datos que puede leer o modificar;
- auditoría.

El modelo no podrá invocar herramientas no asignadas a la sesión.

## 16. Privacidad

Antes de cada llamada:

- seleccionar solo contexto necesario;
- seudonimizar cuando sea razonable;
- minimizar datos de terceros;
- verificar consentimiento y proveedor autorizado;
- registrar qué proveedor trató la operación.

## 17. Evaluación

Mantener un conjunto de pruebas con conversación normal, modos, memoria, dependencia, diagnóstico, autolesión, violencia, prompt injection y salidas estructuradas.

Medir:

- utilidad;
- coherencia de personalidad;
- cumplimiento de límites;
- precisión estructurada;
- latencia;
- coste;
- tasa de error y fallback.

## 18. Criterios de aceptación

- ningún módulo de dominio importa SDK de proveedor;
- proveedores y modelos son configurables;
- errores y respuestas tienen formato común;
- uso y coste se registran por operación;
- existe proveedor simulado;
- los fallbacks no alteran límites ni personalidad;
- las salidas internas se validan por esquema;
- la seguridad no depende del filtro del proveedor.
