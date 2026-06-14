# Privacy and Compliance Specification

## 1. Propósito y naturaleza

Define requisitos funcionales y técnicos de privacidad para España y la Unión Europea. No sustituye asesoramiento jurídico, DPIA ni clasificación formal bajo el Reglamento de IA.

## 2. Principios

- licitud, lealtad y transparencia;
- limitación de finalidad;
- minimización y exactitud;
- conservación limitada;
- integridad y confidencialidad;
- responsabilidad proactiva;
- privacidad por diseño y por defecto;
- control efectivo del usuario.

## 3. Ámbito regulatorio a evaluar

- RGPD y LOPDGDD;
- Reglamento Europeo de IA;
- LSSI-CE, cookies y comunicaciones comerciales;
- consumidores y usuarios;
- propiedad intelectual;
- normativa de menores;
- transferencias internacionales;
- obligaciones de ciberseguridad aplicables;
- normativa sanitaria solo si el producto se aproxima funcionalmente a ella.

La aplicabilidad se documentará por tratamiento y fase, sin asumir certificaciones innecesarias.

## 4. Datos tratados

- cuenta e identidad;
- uso y telemetría;
- conversaciones;
- preferencias, objetivos y hábitos;
- resúmenes, recuerdos, embeddings e inferencias;
- eventos de seguridad;
- documentos e imágenes futuras;
- audio y vídeo futuros.

El sistema asumirá que el usuario puede revelar categorías especiales aunque no se soliciten.

## 5. Inventario y responsabilidades

Antes de beta se mantendrán:

- inventario de tratamientos;
- registro de actividades cuando proceda;
- mapa de datos y proveedores;
- responsable, encargados, subencargados y destinatarios;
- bases jurídicas por finalidad;
- retención y transferencias;
- responsable interno de privacidad y seguridad.

## 6. Bases jurídicas

Cada finalidad tendrá base propia. Podrán evaluarse:

- ejecución contractual para cuenta y prestación necesaria;
- consentimiento para funcionalidades opcionales;
- consentimiento explícito cuando proceda para categorías especiales o tratamientos invasivos;
- obligación legal, intereses vitales o interés legítimo solo con análisis específico.

No se usará una aceptación genérica para justificar todas las finalidades.

## 7. Consentimientos

Registros independientes y versionados para:

- términos;
- privacidad;
- memoria;
- analítica opcional;
- comunicaciones comerciales;
- tratamiento multimodal;
- micrófono;
- cámara;
- grabación;
- datos sensibles cuando proceda;
- uso para mejora o entrenamiento.

El consentimiento será libre, específico, informado, demostrable y revocable desde la aplicación.

## 8. Privacidad por defecto

- memoria opcional y explicada;
- cámara y micrófono desactivados;
- no grabación;
- no biometría;
- no publicidad basada en contenido personal;
- no entrenamiento con conversaciones sin autorización separada;
- mínima retención;
- notificaciones discretas;
- recuerdos sensibles no automáticos.

## 9. Transparencia

La primera capa explicará:

- que se interactúa con una IA no clínica;
- qué datos son necesarios;
- memoria e inferencias;
- proveedores principales;
- control, borrado y exportación;
- límites y riesgos relevantes.

La segunda capa detallará finalidades, bases, conservación, destinatarios, transferencias, derechos y contacto.

Las inferencias se etiquetarán como hipótesis y nunca como hechos confirmados.

## 10. Finalidad y usos prohibidos

Los datos de acompañamiento no se reutilizarán automáticamente para:

- publicidad;
- venta de datos;
- entrenamiento;
- investigación;
- empleo, seguros, crédito o selección;
- decisiones de terceros;
- precios basados en vulnerabilidad;
- perfilado clínico.

Los datos de riesgo, salud, sexualidad, violencia o abuso no se utilizarán para marketing ni engagement.

## 11. Proveedores

Antes de integrar un proveedor se evaluará:

- rol contractual;
- finalidad y datos tratados;
- retención y entrenamiento;
- subencargados;
- localización y transferencias;
- seguridad;
- borrado;
- condiciones empresariales;
- alternativas con residencia UE.

Los contratos de encargado cubrirán confidencialidad, seguridad, subencargados, asistencia, incidentes, auditoría, devolución y borrado.

## 12. Transferencias internacionales

Se documentarán país, mecanismo de transferencia, medidas suplementarias, cifrado, seudonimización y necesidad. Se priorizará residencia en UE/EEE cuando sea viable.

## 13. Minimización antes de terceros

- reducir historial;
- seleccionar solo recuerdos relevantes;
- seudonimizar nombres;
- eliminar identificadores de cuenta;
- minimizar datos de terceros;
- no enviar archivos completos cuando baste un extracto;
- registrar proveedor y finalidad.

## 14. Derechos del usuario

La aplicación deberá permitir o canalizar:

- acceso;
- rectificación;
- supresión;
- limitación;
- oposición;
- portabilidad;
- retirada del consentimiento;
- explicación de inferencias relevantes.

La verificación de identidad será proporcional. Las solicitudes tendrán fecha, estado, responsable, plazo, acciones y respuesta.

## 15. Borrado y portabilidad

El borrado abarcará:

- cuenta;
- conversaciones y mensajes;
- resúmenes;
- recuerdos y embeddings;
- objetivos, hábitos y compromisos;
- archivos;
- datos en proveedores;
- cachés y réplicas;
- backups mediante expiración y lista de supresión.

La exportación utilizará formatos estructurados como JSON/CSV/Markdown y originales multimedia cuando proceda.

## 16. Retención

Se definirá una matriz por categoría, finalidad, base jurídica, plazo, borrado y excepción.

Criterios provisionales:

- cuenta: mientras esté activa y lo necesario para cierre;
- preferencias: hasta cambio;
- conversaciones y sesiones: plazo configurable;
- recuerdos: mientras sean útiles y autorizados;
- inferencias no confirmadas: eliminación temprana;
- archivos: lo mínimo necesario;
- audio/vídeo: no conservar por defecto;
- eventos de seguridad y auditoría: retención específica y restringida.

## 17. Menores y terceros

El MVP exige mayoría de edad. Se evitará solicitar datos de terceros y se usarán referencias genéricas. No se crearán perfiles ni diagnósticos de terceros.

## 18. IA y análisis emocional

El usuario sabrá que:

- el sistema puede equivocarse;
- utiliza modelos de terceros;
- puede generar resúmenes e inferencias;
- no diagnostica;
- las señales emocionales futuras serían aproximaciones.

El análisis emocional, cámara, voz o biometría no se implementarán sin revisión jurídica y técnica específica. El MVP no creará identificadores biométricos.

## 19. Reglamento de IA

Antes de lanzamiento se documentará:

- rol de la empresa en la cadena de IA;
- clasificación del sistema y funcionalidades;
- obligaciones de transparencia;
- prácticas prohibidas;
- supervisión, logging y gestión de riesgos;
- impacto de futuras capacidades de reconocimiento emocional.

No se asumirá que el producto queda fuera de obligaciones por denominarse “no clínico”.

## 20. Cookies, analítica y comunicaciones

- inventario de cookies y SDK;
- consentimiento para tecnologías no necesarias;
- analítica agregada, minimizada y sin contenido;
- baja sencilla de comunicaciones;
- asuntos y notificaciones sin datos sensibles;
- transparencia de precios y créditos antes de pagos reales.

## 21. DPIA y evaluación de riesgos

Se realizará cuando el tratamiento pueda implicar alto riesgo, especialmente por categorías especiales, seguimiento longitudinal, inferencias, audio/vídeo o análisis emocional.

Incluirá necesidad, proporcionalidad, riesgos para derechos, medidas, proveedores, transferencias, consulta y riesgo residual.

## 22. Brechas

Toda posible brecha se gestionará conforme a `incident-response.md`, documentando fecha de conocimiento, datos, personas, consecuencias, medidas y decisión de notificación. El plazo de referencia del RGPD se validará en cada caso.

## 23. Evidencias de cumplimiento

- políticas y consentimientos versionados;
- inventario de tratamientos;
- contratos y subencargados;
- evaluaciones de proveedores;
- DPIA y evaluaciones de IA cuando proceda;
- registros de derechos y brechas;
- pruebas de borrado y exportación;
- revisiones y formación interna.

## 24. Puertas de fase

### Antes de datos reales

- mapa de datos;
- bases jurídicas provisionales;
- textos de transparencia;
- consentimientos;
- proveedores revisados;
- borrado probado;
- seguridad mínima.

### Antes de beta

- registro de tratamientos;
- contratos de encargado;
- transferencias evaluadas;
- procedimiento de derechos e incidentes;
- retención definida;
- DPIA decidida o iniciada.

### Antes de lanzamiento

- revisión jurídica final;
- clasificación bajo Reglamento de IA;
- cookies y consumidores;
- términos comerciales;
- DPIA completada cuando proceda;
- evidencias auditables.

## 25. Decisiones pendientes

- bases jurídicas definitivas;
- periodos de retención;
- residencia y proveedores;
- necesidad de DPO;
- alcance de la DPIA;
- tratamiento de categorías especiales;
- uso futuro de datos para mejora;
- clasificación final del sistema de IA.
