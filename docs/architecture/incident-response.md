# Incident Response Specification

## 1. Propósito

Establecer un proceso ejecutable para detectar, contener, investigar, recuperar y aprender de incidentes de seguridad, privacidad, IA y continuidad.

## 2. Alcance

Incluye aplicación, APIs, identidad, base de datos, memoria, embeddings, créditos, archivos, proveedores, repositorio, CI/CD, secretos, infraestructura y respuestas inseguras de IA.

## 3. Principios

- proteger primero a las personas;
- contener sin destruir evidencias;
- separar hechos, hipótesis y decisiones;
- mínimo acceso;
- cronología inmutable;
- comunicación controlada;
- cumplimiento de plazos;
- recuperación verificada;
- análisis de causa raíz y mejora.

## 4. Evento, incidente y brecha

- **Evento:** actividad observada, normal o anómala.
- **Incidente:** evento con impacto o amenaza real para confidencialidad, integridad, disponibilidad, seguridad de IA o cumplimiento.
- **Brecha de datos personales:** incidente que produce destrucción, pérdida, alteración, acceso o divulgación no autorizada de datos personales.

Cada incidente se evaluará explícitamente para determinar si es una brecha.

## 5. Categorías prioritarias

- compromiso de cuenta;
- acceso no autorizado o escalada;
- fuga o mezcla entre usuarios;
- exposición de secretos;
- malware/ransomware;
- prompt injection o memory poisoning;
- respuesta insegura de IA;
- incidente de proveedor;
- fraude de créditos o consumo;
- fallo de base de datos/backups;
- archivo malicioso;
- denegación de servicio;
- error de configuración;
- amenaza interna;
- privacidad o cumplimiento.

## 6. Severidad

| Nivel | Criterio orientativo | Activación |
|---|---|---|
| SEV-0 | alerta no confirmada o bloqueada | verificar y cerrar/reclasificar |
| SEV-1 | impacto limitado y sin datos sensibles confirmados | atención ordinaria priorizada |
| SEV-2 | posible acceso, varios usuarios o degradación relevante | responsable y contención rápida |
| SEV-3 | acceso confirmado, datos sensibles o guardrail grave | equipo inmediato y análisis jurídico |
| SEV-4 | brecha masiva, compromiso total o riesgo inmediato | suspensión, dirección y máxima prioridad |

La mezcla de datos entre usuarios tendrá severidad mínima SEV-3.

## 7. Roles

- Incident Lead: coordinación y decisiones;
- Técnico/Seguridad: investigación, contención y recuperación;
- Privacidad: evaluación de datos y plazos;
- Legal: obligaciones y comunicaciones;
- Producto/IA: comportamiento, modelos y guardrails;
- Comunicación: mensajes internos, usuarios y público.

En el MVP una persona puede asumir varios roles, pero las responsabilidades y suplencias deberán constar.

## 8. Flujo operativo

1. detectar y registrar;
2. acusar recibo;
3. asignar Incident Lead;
4. clasificar severidad y privacidad;
5. preservar evidencias;
6. contener;
7. investigar alcance y causa;
8. erradicar;
9. recuperar y validar;
10. comunicar y notificar cuando proceda;
11. monitorizar;
12. cerrar y realizar postmortem.

## 9. Registro inicial

Campos mínimos:

- identificador `INC-AAAA-NNNN`;
- fecha/hora y zona;
- origen del reporte;
- descripción;
- sistemas, usuarios y datos potencialmente afectados;
- categoría y severidad provisional;
- estado y responsable;
- acciones inmediatas;
- correlation IDs y evidencias.

La cronología se añadirá, no se reescribirá.

## 10. Investigación

Responder:

- qué ocurrió y cuándo;
- si continúa activo;
- vector de entrada;
- sistemas, usuarios, datos y proveedores afectados;
- acceso real frente a potencial;
- persistencia;
- logs y evidencias disponibles;
- controles que fallaron;
- medidas seguras inmediatas.

## 11. Evidencias

- preservar logs, snapshots, configuraciones, alertas y artefactos;
- registrar origen, hash, custodio, acceso y ubicación en incidentes graves;
- no borrar, alterar timestamps ni copiar a dispositivos personales;
- la preservación no retrasará contención necesaria para proteger usuarios.

## 12. Contención

Acciones posibles:

- revocar sesiones y cuentas;
- rotar secretos;
- cerrar endpoints o funciones;
- bloquear recuperación de memoria;
- desactivar proveedor/modelo/herramienta;
- aislar infraestructura;
- limitar tráfico;
- retirar despliegue;
- poner mantenimiento;
- suspender procesamiento de archivos o multimodalidad.

La función se suspenderá si no puede garantizarse aislamiento o seguridad.

## 13. Erradicación y causa raíz

Eliminar vulnerabilidad, persistencia, permisos excesivos, claves, archivos, prompts o memorias contaminadas. Diferenciar causa raíz, desencadenante, síntoma e impacto.

Toda corrección urgente deberá quedar documentada y recibir prueba de regresión.

## 14. Recuperación

Antes de reapertura:

- vulnerabilidad corregida;
- credenciales rotadas;
- integridad y aislamiento verificados;
- datos restaurados y consistentes;
- pruebas críticas superadas;
- logs, alertas y backups operativos;
- riesgo residual aprobado.

Reactivar progresivamente y monitorizar indicadores específicos.

## 15. Playbooks mínimos

### Fuga de secreto

Revocar/rotar, revisar uso y costes, eliminar exposición e historial cuando proceda, escanear copias y documentar. Borrar el secreto del último commit no es suficiente.

### Compromiso de cuenta

Bloquear, revocar sesiones, restaurar cambios, revisar actividad, informar al usuario y reforzar autenticación.

### Mezcla entre usuarios

Desactivar función, preservar consultas, identificar alcance, revisar autorización/RLS/caché/vector search, eliminar contaminación, probar aislamiento y evaluar notificación.

### Incidente de memoria/embedding

Bloquear recuperación, invalidar embedding, corregir/borrar memoria, revisar fuentes, regenerar índice y localizar sesiones afectadas.

### Prompt injection o herramienta

Determinar instrucciones ejecutadas, datos accedidos, acciones externas, memorias creadas y persistencia; revocar permisos y bloquear fuente.

### Respuesta insegura de IA

Conservar versión de modelo/prompt, clasificador y contexto mínimo; detener política afectada, activar respuesta segura, evaluar daño y crear regresión.

### Proveedor de IA

Suspender o cambiar a fallback, rotar claves, limitar contexto, solicitar alcance/borrado y revisar transferencias y usuarios afectados.

### Ransomware o malware

Aislar, preservar evidencias, no restaurar sobre sistemas comprometidos, validar backups y coordinar asesoramiento especializado.

### Fallo de backup o datos borrados que reaparecen

Detener restauraciones, identificar copia y fecha, aplicar lista de supresión, corregir proceso y verificar borrado derivado.

## 16. Datos personales

Para cada incidente se evaluará:

- categorías y volumen;
- personas afectadas;
- facilidad de identificación;
- cifrado;
- consecuencias físicas, económicas, reputacionales o emocionales;
- probabilidad y gravedad;
- medidas y riesgo residual.

Toda brecha se documentará aunque no se notifique.

## 17. Notificación y comunicación

El responsable de privacidad y asesoría jurídica decidirán obligaciones y autoridad competente. Se registrará la fecha de conocimiento.

Cuando proceda, se trabajará con el plazo legal aplicable —incluido el referente de 72 horas del RGPD— sin esperar certeza absoluta si ya existe conocimiento suficiente.

Las comunicaciones a usuarios serán claras, factuales y accionables: qué ocurrió, datos, riesgos, medidas, recomendaciones y contacto.

## 18. Comunicación interna y pública

- necesidad de conocer;
- canales autorizados;
- sin especulación ni datos personales innecesarios;
- declaraciones públicas solo por responsables designados;
- hechos confirmados y límites de incertidumbre;
- coordinación con legal y proveedores.

## 19. Estados

`reported`, `acknowledged`, `investigating`, `contained`, `eradication_in_progress`, `recovering`, `monitoring`, `resolved`, `closed`, `reopened`.

## 20. Cierre y postmortem

El informe final incluirá:

- resumen ejecutivo;
- cronología;
- alcance e impacto;
- causa raíz;
- controles fallidos;
- acciones de contención/recuperación;
- decisiones de privacidad y comunicación;
- costes;
- acciones correctoras con propietario y fecha;
- pruebas de regresión;
- riesgo residual.

El postmortem será sin culpabilización y se centrará en controles y decisiones.

## 21. Métricas

- tiempo a detección, acuse, contención y recuperación;
- incidentes por categoría/severidad;
- usuarios y datos afectados;
- reincidencia;
- acciones correctoras vencidas;
- restauraciones exitosas;
- incidentes de proveedor;
- falsos positivos de alertas.

## 22. Preparación y simulacros

Antes de beta:

- contactos y suplencias;
- canal de seguridad;
- inventario de sistemas/proveedores;
- acceso a logs y backups;
- plantillas de comunicación;
- simulacro de fuga entre usuarios y secreto expuesto.

Realizar simulacros periódicos y tras cambios arquitectónicos relevantes.

## 23. Criterios de aceptación

- todo incidente tiene ID, severidad, responsable y cronología;
- existe evaluación explícita de datos personales;
- se puede revocar sesiones, secretos y proveedores;
- la recuperación exige pruebas;
- las comunicaciones están controladas;
- las acciones correctoras se siguen hasta cierre;
- los playbooks críticos están probados.
