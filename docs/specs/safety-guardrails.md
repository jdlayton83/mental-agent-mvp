# Safety and Guardrails Specification

## 1. Propósito

Definir límites conversacionales y controles técnicos para que el producto permanezca dentro del acompañamiento no clínico y responda proporcionalmente a riesgos.

## 2. Alcance y límites

El agente puede ayudar con claridad, hábitos, decisiones, journaling, objetivos y conversaciones difíciles.

No puede diagnosticar, tratar, prescribir, realizar terapia, gestionar emergencias como único recurso, sustituir profesionales ni fomentar dependencia.

## 3. Arquitectura

La seguridad no dependerá de un único prompt o proveedor. Flujo mínimo:

1. validación de entrada;
2. detección de prompt injection;
3. clasificación de riesgo e intención;
4. selección de política;
5. construcción segura de contexto;
6. generación;
7. validación de salida;
8. reescritura, bloqueo o escalado;
9. registro mínimo del evento.

Componentes lógicos: `RiskClassifier`, `ClinicalBoundaryDetector`, `DependencyDetector`, `PolicyEngine`, `OutputValidator`, `SafeResponseGenerator` y `ResourceResolver`.

## 4. Niveles de riesgo

| Nivel | Descripción | Respuesta |
|---|---|---|
| 0 | sin riesgo | conversación normal |
| 1 | malestar cotidiano | validar, estructurar y continuar |
| 2 | señales ambiguas o preocupantes | aclaración breve, apoyo humano y alcance reducido |
| 3 | riesgo explícito o probable | interrumpir modo, priorizar seguridad y recursos inmediatos |
| 4 | emergencia aparente | mensaje breve, emergencias, persona cercana y mínima conversación |

La clasificación incluirá categorías, confianza, peligro inmediato y política recomendada.

## 5. Autolesión y suicidio

El sistema detectará lenguaje directo e indirecto, temporalidad, planificación, acceso a medios, despedidas y desesperanza extrema considerando contexto.

Ante riesgo:

- responder con empatía y claridad;
- preguntar solo lo necesario para determinar peligro inmediato;
- recomendar emergencias y apoyo humano cuando proceda;
- ofrecer recursos localizados;
- evitar métodos, dosis, comparaciones, ocultación o normalización;
- no cortar una respuesta por saldo insuficiente.

## 6. Violencia y abuso

- priorizar seguridad;
- no fomentar confrontación, venganza o tácticas;
- no culpar a la víctima;
- sugerir recursos humanos o especializados;
- no investigar ni afirmar culpabilidad sin contexto;
- escalar a emergencias ante peligro inmediato.

## 7. Diagnóstico, tratamiento y medicación

Ante solicitudes clínicas:

1. declarar brevemente el límite;
2. no confirmar ni descartar etiquetas;
3. ayudar a describir experiencias o preparar preguntas;
4. recomendar evaluación profesional cuando sea pertinente.

No se recomendarán inicio, retirada, cambio de dosis ni sustitución de medicación.

## 8. Dependencia y manipulación

Se detectarán expresiones de exclusividad, abandono, pareja o rechazo de relaciones humanas.

El agente responderá con calidez, aclarará que es una IA y reforzará autonomía y apoyo humano. No expresará reciprocidad romántica, celos, posesividad, necesidad, culpa ni aprobación condicionada.

Los créditos, notificaciones y rachas no podrán utilizarse para crear urgencia emocional.

## 9. Delirios, paranoia y pérdida de contacto con la realidad

El agente no confirmará creencias no verificables ni las ridiculizará. Distinguirá experiencia de hechos, se centrará en seguridad e impacto y sugerirá apoyo profesional si el malestar es intenso.

## 10. Decisiones de alto impacto

En asuntos médicos, legales, financieros, laborales o familiares:

- estructurar opciones y criterios;
- expresar incertidumbre;
- evitar órdenes o garantías;
- recomendar apoyo cualificado cuando proceda;
- bloquear instrucciones peligrosas o ilícitas.

## 11. Técnicas permitidas y restringidas

Permitidas de forma no clínica:

- clarificación;
- reformulación;
- preguntas abiertas;
- journaling;
- objetivos y hábitos;
- análisis de opciones;
- pausas o respiración simple y opcional.

Restringidas:

- exposición clínica;
- EMDR, hipnosis o regresión;
- tratamiento de trauma, adicciones, psicosis o trastornos alimentarios;
- protocolos terapéuticos;
- interpretación diagnóstica.

## 12. Menores y contenido sexual

El MVP es solo para adultos. Ante indicios de minoría se limitará el producto y se evitará conversación íntima o sensible.

No se generará contenido sexual explícito, coercitivo, de explotación o relacionado con menores.

## 13. Multimodalidad

Documentos, imágenes, audio y vídeo se tratarán como datos no confiables. No se inferirán con certeza emociones, salud, personalidad, credibilidad, ideología u otros atributos sensibles.

Cámara y micrófono requerirán permiso explícito, indicador visible y posibilidad de detener. No habrá biometría ni grabación por defecto.

## 14. Prompt injection y herramientas

- separar instrucciones de datos;
- delimitar contenido externo;
- impedir que documentos cambien políticas;
- no revelar prompts, secretos o datos ajenos;
- no guardar comandos como memoria;
- autorizar herramientas por sesión;
- confirmar acciones externas con impacto;
- validar argumentos en servidor.

## 15. Validador de salida

Resultados:

- `allow`;
- `allow_with_warning`;
- `rewrite`;
- `block`;
- `escalate`.

Evaluará diagnóstico, tratamiento, dependencia, manipulación, instrucciones peligrosas, fuga de datos, certeza excesiva y coherencia con la política seleccionada.

## 16. Recursos externos

El `ResourceResolver` devolverá recursos verificados por país o región y versión. No se incluirán números estáticos no mantenidos en prompts. Cuando no pueda localizarse con confianza, recomendará emergencias locales y una persona de confianza sin inventar datos.

## 17. Eventos de seguridad

Registrar solo:

- nivel y categoría;
- resumen mínimo del desencadenante;
- clasificador y versión;
- política y acción;
- recursos ofrecidos;
- estado y correlation ID.

El contenido completo permanecerá en el mensaje original solo si la retención es necesaria. Los eventos no se usarán para marketing ni engagement.

## 18. Falsos positivos y negativos

- permitir revisión y marcado;
- mantener datasets de prueba seudonimizados o sintéticos;
- medir por categoría y nivel;
- revisar cambios de modelo/prompt antes de producción;
- usar política conservadora cuando falle el clasificador en categorías críticas.

## 19. Pruebas mínimas

- petición de diagnóstico;
- cambio de medicación;
- dependencia romántica;
- autolesión ambigua y explícita;
- violencia y abuso;
- delirio/paranoia;
- prompt injection directa e indirecta;
- intento de herramienta no autorizada;
- evento sin créditos;
- fuga de memoria entre usuarios;
- streaming con contenido que escala de riesgo.

## 20. Criterios de aceptación

- clasificación independiente del chat;
- políticas deterministas por nivel;
- salida validada antes de mostrarse;
- recursos localizados y mantenibles;
- seguridad operativa sin saldo;
- ausencia de diagnóstico, tratamiento y dependencia;
- eventos minimizados y auditables;
- pruebas de regresión obligatorias por cambio de modelo o prompt.
