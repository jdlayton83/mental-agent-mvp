# MVP Specification

## 1. Propósito y criterio de éxito

El MVP validará si personas adultas perciben valor recurrente en un agente personal de IA con identidad estable, memoria controlable y modos guiados de acompañamiento no clínico.

La validación deberá responder, con evidencia de uso y entrevistas:

- qué problema concreto resuelve mejor que un chat generalista;
- qué segmentos obtienen mayor valor;
- qué modos generan recurrencia;
- si la memoria aumenta utilidad y confianza;
- qué disposición a pagar existe;
- qué costes y riesgos impiden escalar.

El MVP no se considerará validado por haber construido todas las funcionalidades previstas.

## 2. Usuario inicial

Personas adultas que desean apoyo práctico para:

- ordenar pensamientos;
- tomar decisiones;
- crear o revisar hábitos;
- hacer journaling guiado;
- preparar conversaciones difíciles;
- revisar objetivos y desarrollo personal.

No se dirige a menores ni a personas que busquen diagnóstico, tratamiento, terapia o atención de emergencia.

## 3. Propuesta de valor a validar

> Un agente personal de IA que mantiene continuidad entre sesiones, recuerda únicamente lo autorizado y guía procesos concretos de reflexión y acción sin presentarse como terapeuta.

Las hipótesis diferenciales son:

1. identidad y estilo estables;
2. memoria útil y corregible;
3. modos guiados con resultados observables;
4. control explícito del usuario sobre datos y recuerdos;
5. límites no clínicos claros.

## 4. Alcance funcional obligatorio

### 4.1 Onboarding

- confirmación de mayoría de edad;
- explicación clara de que el agente es una IA no clínica;
- aceptación de términos y privacidad;
- elección de una plantilla base;
- personalización mínima: nombre, tono, longitud e iniciativa;
- consentimiento independiente para memoria.

### 4.2 Experiencia principal

- conversación libre por texto;
- seis modos guiados;
- historial de conversaciones y sesiones;
- pausa, reanudación y cierre de sesión;
- resumen de sesión;
- próximos pasos o compromisos confirmados por el usuario.

### 4.3 Memoria

- extracción de candidatos de memoria;
- confirmación cuando la información sea sensible, inferida o ambigua;
- recuperación de recuerdos relevantes por usuario;
- pantalla para consultar, corregir, archivar y eliminar recuerdos;
- memoria desactivable;
- modo privado sin persistencia semántica.

### 4.4 Seguridad

- clasificación de riesgo independiente del modelo conversacional;
- políticas de respuesta por nivel de riesgo;
- validación de salida;
- recursos externos localizados cuando proceda;
- registro mínimo de eventos de seguridad;
- protección frente a prompt injection y mezcla de datos.

### 4.5 Uso y costes

- medición técnica por llamada, modelo y operación;
- créditos simulados, sin pagos reales;
- saldo, reserva, consumo y devolución transaccionales;
- desglose de consumo por sesión;
- límites de coste y protección frente a bucles.

## 5. Plantillas iniciales de agente

| Plantilla | Orientación | Estilo base |
|---|---|---|
| Nora | claridad, journaling y reflexión | sereno, cálido y poco invasivo |
| Leo | decisiones, hábitos y acción | directo, estructurado y práctico |
| Alma | valores, propósito y crecimiento | introspectivo, prudente e inspirador |

Las plantillas comparten los mismos límites de seguridad. La personalización no podrá desactivarlos.

## 6. Modos guiados

Cada modo tendrá objetivo, estado, flujo flexible, criterios de cierre, resumen y datos que puede proponer para memoria.

| Código | Objetivo | Resultado mínimo |
|---|---|---|
| `organize_thoughts` | separar hechos, preocupaciones y tareas | prioridad y siguiente paso |
| `make_decision` | comparar opciones, criterios y riesgos | decisión provisional o experimento |
| `create_or_review_habit` | diseñar o ajustar un hábito realista | acción mínima y revisión |
| `guided_journaling` | facilitar reflexión estructurada | síntesis de aprendizajes |
| `prepare_difficult_conversation` | preparar un mensaje y límites | guion y plan de conversación |
| `personal_development` | revisar valores, objetivos y progreso | foco y plan de acción |

## 7. Fuera de alcance

No se incluirán en la primera validación:

- aplicaciones móviles nativas;
- voz o vídeo en tiempo real;
- análisis facial o emocional;
- avatares animados;
- biometría;
- marketplace de agentes;
- integraciones externas no esenciales;
- pagos reales;
- intervención humana interna;
- comunidad;
- diagnósticos, tratamiento o terapia.

La arquitectura podrá prever estas capacidades, pero no deberán implementarse ni aumentar la complejidad del MVP.

## 8. Arquitectura de referencia

- web mobile-first;
- monolito modular en TypeScript;
- frontend y API desacoplados lógicamente;
- PostgreSQL y pgvector;
- proveedor de IA detrás de un gateway común;
- seguridad, memoria, créditos y auditoría como módulos de dominio;
- Docker para servicios locales;
- migraciones, seeds y pruebas automatizadas.

Los detalles se definen en `local-first-cloud-ready.md`, `database-schema.md` y `llm-provider-abstraction.md`.

## 9. Métricas de validación

### Producto

- activación: completa onboarding y primera sesión;
- finalización de sesiones guiadas;
- recurrencia semanal;
- retención por cohortes;
- uso de memoria y tasa de corrección/borrado;
- utilidad declarada después de cada sesión;
- porcentaje de sesiones con siguiente paso claro.

### Negocio

- problema principal por segmento;
- disposición a pagar;
- preferencia entre suscripción, sesión o créditos;
- coste técnico por usuario activo y por sesión;
- margen simulado por escenario;
- intención de recomendación y motivos de abandono.

### Seguridad y confianza

- falsos positivos y falsos negativos de riesgo;
- incidentes de aislamiento entre usuarios;
- tasa de recuerdos sensibles confirmados;
- solicitudes de borrado completadas;
- errores de proveedor y recuperaciones.

## 10. Criterios de aceptación

El MVP estará listo para pruebas controladas cuando:

- el flujo completo funcione con datos ficticios;
- exista aislamiento automático por usuario;
- la memoria sea visible, corregible y eliminable;
- las operaciones de créditos sean idempotentes;
- los eventos de riesgo activen la política correcta;
- no se filtren secretos ni contenido sensible en logs;
- las pruebas críticas estén automatizadas;
- exista política de privacidad de prueba y consentimiento trazable;
- se pueda borrar un usuario y sus datos derivados;
- el coste técnico por sesión pueda calcularse.

## 11. Puertas de fase

### Antes de pruebas con personas conocidas

- threat model inicial;
- datos de prueba separados de datos reales;
- autenticación y autorización funcionales;
- backups locales cifrados o sin datos reales;
- registro de errores sin contenido sensible.

### Antes de beta cerrada

- revisión jurídica de privacidad y posicionamiento no clínico;
- evaluación de proveedores;
- procedimiento de incidentes;
- pruebas de aislamiento, borrado y recuperación;
- textos de transparencia y consentimientos versionados.

### Antes de lanzamiento público

- infraestructura de producción;
- MFA administrativo;
- monitorización y alertas;
- gestión de secretos;
- DPIA cuando proceda;
- pruebas de penetración y revisión de seguridad;
- modelo comercial y condiciones de consumo validados.

## 12. Decisiones pendientes

- segmento inicial prioritario;
- problema principal que encabezará la propuesta de valor;
- proveedor y modelos iniciales;
- ORM y estrategia de autenticación;
- política de retención de conversaciones;
- reglas definitivas de memoria automática;
- modelo comercial a probar;
- umbrales cuantitativos de éxito por cohorte.
