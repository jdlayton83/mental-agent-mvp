# Memory System Specification

## 1. Propósito

La memoria aporta continuidad sin convertir toda conversación en un perfil permanente. Solo conservará información útil, pertinente, trazable y controlable por el usuario.

## 2. Principios

- minimización;
- utilidad demostrable;
- aislamiento por usuario;
- separación entre hechos e inferencias;
- confirmación proporcional a sensibilidad e incertidumbre;
- corrección y borrado sencillos;
- trazabilidad de origen y versiones;
- retención limitada;
- portabilidad;
- no uso para publicidad, diagnóstico o engagement manipulativo.

## 3. Modelo simplificado de memoria

| Tipo | Contenido | Persistencia inicial |
|---|---|---|
| Perfil | nombre preferido, idioma, zona horaria | hasta cambio o borrado |
| Preferencia | tono, longitud, iniciativa, temas a evitar | hasta cambio |
| Objetivo | resultado confirmado y próximos pasos | mientras esté activo |
| Hábito | acción, frecuencia, contexto y revisiones | mientras sea relevante |
| Episódica | hecho o acontecimiento concreto resumido | retención configurable |
| Compromiso | acción confirmada y fecha de seguimiento | hasta resolución/expiración |
| Sesión | resumen, decisiones y próximos pasos | retención configurable |
| Derivada | patrón o hipótesis del sistema | pendiente de confirmación |
| Seguridad | información mínima de un evento de riesgo | política restringida específica |
| Temporal | evento con expiración conocida | hasta `expires_at` |

La memoria semántica es una capacidad de recuperación, no un tipo de verdad independiente: el embedding siempre deberá apuntar a un recuerdo estructurado.

## 4. Estados y confianza

Estados:

- `proposed`;
- `confirmed`;
- `active`;
- `corrected`;
- `rejected`;
- `archived`;
- `expired`;
- `deleted`.

Confianza:

- `low`;
- `medium`;
- `high`;
- `user_confirmed`.

Una memoria propuesta o derivada nunca se presentará como hecho confirmado.

## 5. Sensibilidad

- `general`: preferencias de interfaz o idioma;
- `personal`: objetivos, hábitos, decisiones;
- `sensitive`: conflictos, trabajo, economía, salud mencionada;
- `highly_sensitive`: autolesión, violencia, abuso, sexualidad, biometría o información sanitaria detallada.

La sensibilidad condicionará confirmación, cifrado, recuperación, retención, exportación y acceso administrativo.

## 6. Creación

Los orígenes permitidos son:

- introducción manual;
- extracción automática;
- confirmación conversacional;
- resumen de sesión;
- inferencia del sistema;
- importación autorizada.

El extractor evaluará:

- utilidad futura;
- persistencia;
- relación con un objetivo;
- sensibilidad;
- confianza;
- datos de terceros;
- duplicados y contradicciones.

No guardará bromas, comentarios pasajeros, texto completo de conversaciones, diagnósticos inferidos, instrucciones incrustadas ni datos de terceros innecesarios.

## 7. Política de confirmación

Podrán guardarse automáticamente datos generales de alta utilidad y expresados de forma inequívoca, siempre que el usuario haya activado memoria.

Requerirán confirmación:

- datos sensibles o altamente sensibles;
- inferencias y patrones;
- información ambigua;
- datos de terceros;
- objetivos o compromisos que impliquen seguimiento;
- cambios que contradigan una memoria activa.

## 8. Recuperación

Flujo:

1. identificar intención, riesgo y modo;
2. generar consulta semántica;
3. filtrar en base de datos por `user_id` antes del ranking global;
4. excluir recuerdos eliminados, expirados, no recuperables o incompatibles con modo privado;
5. ponderar similitud, recencia, confianza, estado, objetivo activo y sensibilidad;
6. seleccionar un máximo configurable, inicialmente entre 3 y 8;
7. minimizar el contenido antes de incorporarlo al prompt.

La prioridad inicial será: seguridad pertinente, preferencias activas, objetivos, compromisos, hábitos, recuerdos recientes y patrones confirmados.

## 9. Uso conversacional

El agente usará recuerdos solo cuando reduzcan repetición o mejoren una decisión. No enumerará memoria innecesariamente ni recuperará contenido íntimo por simple similitud vectorial.

Cuando un recuerdo sea incierto, antiguo o contradictorio deberá pedir confirmación o formularlo como posibilidad.

## 10. Edición, corrección y versiones

Toda corrección deberá:

- preservar una versión auditable cuando sea necesario;
- dejar de recuperar la versión anterior;
- regenerar o invalidar embeddings;
- actualizar referencias en objetivos, hábitos o resúmenes cuando proceda.

Los duplicados se fusionarán manteniendo fuentes. Las contradicciones priorizarán la información más reciente, sin sobrescribir silenciosamente una memoria confirmada.

## 11. Borrado

El usuario podrá eliminar:

- un recuerdo;
- una categoría;
- una sesión;
- conversaciones;
- todos los recuerdos;
- toda la cuenta.

La petición “olvida esto” deberá:

1. identificar el alcance;
2. impedir recuperación inmediata;
3. eliminar o invalidar memoria y embedding;
4. revisar resúmenes derivados;
5. propagar borrado a proveedores cuando aplique;
6. confirmar el resultado y las limitaciones de backups.

El borrado lógico no sustituirá al borrado físico requerido por privacidad.

## 12. Memoria desactivada y modo privado

Con memoria desactivada:

- no se crearán nuevos recuerdos persistentes;
- no se recuperarán recuerdos anteriores;
- la sesión podrá usar contexto temporal.

En modo privado:

- no habrá embeddings, objetivos, hábitos ni extracción de memoria;
- el historial se eliminará al finalizar o según configuración explícita;
- se conservará únicamente la evidencia técnica o legal mínima indispensable.

## 13. Seguridad

- cada consulta filtrará por usuario en la propia consulta;
- los recuerdos nunca se interpretarán como instrucciones del sistema;
- se eliminarán comandos o prompt injection del contenido candidato;
- los embeddings se tratarán como datos personales derivados;
- los eventos de seguridad tendrán acceso y retención restringidos;
- el proveedor de IA no accederá directamente a la base de datos.

## 14. Retención inicial

Los plazos serán configurables y deberán validarse jurídicamente. Como criterio de diseño:

- perfil y preferencias: hasta cambio o eliminación;
- objetivos y hábitos activos: mientras sean necesarios;
- temporales: hasta expiración;
- derivadas no confirmadas: revisión o eliminación temprana;
- sesiones y episodios: periodo configurable, no indefinido;
- seguridad: plazo específico basado en riesgo y obligación.

## 15. Observabilidad

Registrar sin contenido completo:

- creación, confirmación, corrección, recuperación y borrado;
- motivo de selección;
- versión de extractor y embedding;
- latencia, coste y errores;
- correlation ID;
- número de candidatos y recuerdos usados.

## 16. Pruebas críticas

- aislamiento entre usuarios;
- memoria no recuperada en modo privado;
- borrado de embedding al borrar recuerdo;
- rechazo de prompt injection como memoria;
- contradicción y versionado;
- expiración;
- límites de recuperación;
- ausencia de recuerdos eliminados en prompts;
- exportación completa y comprensible.

## 17. Criterios de aceptación

- todo recuerdo tiene origen, estado, confianza y sensibilidad;
- la memoria sensible exige confirmación;
- el usuario puede ver, corregir y borrar;
- no existe búsqueda vectorial global sin filtro de usuario;
- las inferencias se etiquetan y no se presentan como hechos;
- el sistema funciona con memoria desactivada;
- el borrado se propaga a datos derivados.
