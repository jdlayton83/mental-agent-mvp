# Security Architecture Specification

## 1. Propósito

Definir los controles técnicos que protegen identidades, conversaciones, memoria, créditos, archivos, proveedores y operación del producto. La seguridad conversacional se detalla en `safety-guardrails.md`; privacidad y obligaciones jurídicas, en `privacy-and-compliance.md`.

## 2. Principios

- security and privacy by design/default;
- zero trust;
- deny by default;
- mínimo privilegio;
- defensa en profundidad;
- aislamiento por usuario;
- minimización;
- fail secure;
- trazabilidad;
- secretos fuera del código;
- controles proporcionales a datos altamente sensibles.

## 3. Alcance del MVP

Controles obligatorios antes de usar datos reales:

- autenticación mantenida y sesiones seguras;
- autorización de servidor por recurso;
- aislamiento automático por usuario;
- validación de entrada y salida;
- HTTPS en entornos remotos;
- secretos gestionados;
- consultas parametrizadas;
- protección de APIs y rate limiting;
- logs minimizados;
- backups y restauración probada;
- escaneo de dependencias y secretos;
- proceso de incidentes;
- pruebas críticas de seguridad.

Capacidades futuras como cámara, audio, biometría o procesamiento avanzado de archivos no forman parte del MVP y requerirán revisión específica.

## 4. Modelo de amenazas

El threat model se mantendrá versionado e incluirá:

- robo de cuenta y sesión;
- acceso horizontal y escalada de privilegios;
- inyecciones web, SQL, SSRF y ejecución remota;
- carga de malware y path traversal;
- fuga de secretos y supply chain;
- prompt injection y herramientas;
- memory poisoning y mezcla de embeddings;
- abuso de APIs, créditos y costes;
- configuraciones cloud inseguras;
- insiders y proveedores comprometidos;
- denegación de servicio;
- borrado incompleto o restauración de datos eliminados.

## 5. Clasificación de información

| Nivel | Ejemplos | Controles |
|---|---|---|
| Pública | landing y documentación comercial | integridad y disponibilidad |
| Interna | documentación técnica sin secretos | acceso interno |
| Confidencial | cuentas, conversaciones, objetivos, hábitos | cifrado y acceso restringido |
| Altamente confidencial | eventos de riesgo, salud, audio/vídeo, secretos | acceso excepcional, cifrado reforzado y retención mínima |

## 6. Identidad y sesiones

- proveedor o librería de autenticación mantenida;
- verificación de correo y recuperación segura;
- hash moderno con salt si hay contraseñas;
- protección frente a credential stuffing y fuerza bruta;
- MFA obligatorio para administradores antes de beta;
- tokens aleatorios, expiración, revocación y rotación;
- cookies `HttpOnly`, `Secure` y `SameSite` apropiado;
- invalidación tras cambio de contraseña, suspensión o borrado;
- registro de accesos y anomalías sin almacenar credenciales.

## 7. Autorización e aislamiento

Toda autorización se ejecutará en servidor y validará identidad, rol, propiedad, estado y alcance.

- UUID no sustituye autorización;
- consultas incluyen `user_id`;
- RLS se activará como segunda barrera antes de beta;
- roles de base de datos separados;
- pruebas automáticas de acceso horizontal;
- cachés y búsquedas vectoriales incluyen tenant/user scope;
- soporte y administración no acceden por defecto al contenido.

Acceso excepcional a contenido: justificado, temporal, mínimo, auditado y sujeto a política de privacidad.

## 8. API y aplicación web

- esquema, tipo, tamaño y rango validados en servidor;
- consultas parametrizadas;
- protección frente a mass assignment;
- autorización por objeto;
- paginación y límites;
- rate limiting por identidad, IP y operación;
- errores sin trazas, SQL, prompts o secretos;
- idempotencia en operaciones críticas;
- codificación de salida;
- CSP restrictiva, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y protección de framing;
- CSRF cuando el mecanismo de sesión lo requiera.

## 9. Transporte y cifrado

- HTTPS obligatorio fuera de localhost;
- TLS actual y certificados monitorizados;
- cifrado en reposo para base de datos, objetos, discos y backups;
- evaluación de cifrado de aplicación para campos altamente sensibles;
- claves en KMS/secret manager en cloud;
- rotación, versionado, revocación y auditoría de claves.

No se diseñará criptografía propia.

## 10. Secretos

Desarrollo:

- `.env` fuera de Git;
- `.env.example` ficticio;
- secretos distintos por entorno;
- secret scanning local y CI.

Producción:

- gestor de secretos;
- identidades de servicio y mínimo privilegio;
- claves de IA solo en backend;
- credenciales efímeras para tiempo real cuando proceda;
- rotación inmediata ante exposición.

## 11. Base de datos y pgvector

- red privada o acceso restringido;
- TLS y pool controlado;
- aplicación sin superusuario;
- roles separados para migraciones, aplicación, lectura y administración;
- RLS donde aplique;
- SQL parametrizado;
- backups cifrados;
- auditoría de accesos administrativos;
- búsqueda vectorial filtrada por `user_id`, estado, vigencia y sensibilidad antes de entregar resultados.

Embeddings se consideran datos personales derivados y se borran con su memoria.

## 12. IA, prompts y memoria

- gateway único para proveedores;
- prompts versionados y sin secretos;
- instrucciones separadas de datos externos;
- detección de prompt injection directa e indirecta;
- herramientas con allowlist, esquema y autorización;
- memoria validada, trazable y nunca ejecutada como instrucción;
- minimización antes de cada proveedor;
- registro de proveedor, modelo y región por operación;
- evaluación contractual y técnica de cada proveedor.

## 13. Archivos

Solo se habilitarán cuando sean necesarios.

Controles:

- allowlist de MIME y extensión;
- límite de tamaño y expansión;
- nombre aleatorio y checksum;
- análisis antimalware;
- almacenamiento privado;
- procesamiento aislado sin secretos y con timeout;
- prevención de zip bombs, path traversal y contenido activo;
- expiración y borrado.

No se admitirán inicialmente ejecutables, scripts, macros ni archivos cifrados no analizables.

## 14. Logs, auditoría y monitorización

Los logs incluirán timestamp, módulo, acción, resultado, duración y correlation ID.

No incluirán contraseñas, tokens, claves, conversaciones completas, recuerdos completos ni archivos.

La auditoría cubrirá accesos, cambios de permisos, memoria, consentimientos, créditos, archivos, configuración y acciones administrativas. Deberá protegerse contra modificación.

Alertas mínimas:

- autenticación anómala;
- errores de autorización;
- extracción masiva;
- consumo económico anómalo;
- exposición de secretos;
- fallos de backups;
- mezcla potencial de usuarios;
- degradación de guardrails;
- cambios críticos de configuración.

## 15. Dependencias y cadena de suministro

- lockfiles y versiones revisadas;
- actualizaciones periódicas;
- SCA y advisories;
- secret scanning;
- revisión de GitHub Actions y permisos mínimos;
- ramas protegidas y pull requests;
- artefactos reproducibles;
- prohibición de secretos en issues, prompts de asistentes o repositorio.

## 16. Entornos y despliegue

- development, test, staging y production separados;
- datos y secretos separados;
- configuración segura por defecto;
- imágenes/container sin privilegios;
- superficie de red mínima;
- despliegues auditables y reversibles;
- acceso de administración individual y con MFA.

## 17. Backups y recuperación

- frecuencia y retención según RPO/RTO definidos;
- cifrado y acceso restringido;
- pruebas periódicas de restauración;
- restauración en entorno aislado;
- lista de supresión para impedir reaparición de datos borrados;
- documentación de dependencias y orden de recuperación.

## 18. Gestión de vulnerabilidades

- canal de reporte;
- clasificación y SLA internos por severidad;
- parcheo y mitigación;
- pruebas de regresión;
- pentest antes de lanzamiento público y tras cambios relevantes;
- revisión del threat model.

## 19. Pruebas obligatorias

- acceso entre usuarios y manipulación de IDs;
- RLS y caché;
- SQL/XSS/CSRF/SSRF según superficie;
- prompt injection directa e indirecta;
- memory poisoning;
- herramienta no autorizada;
- secreto en Git;
- archivo malicioso;
- extracción masiva y rate limiting;
- sesión revocada;
- borrado y restauración;
- concurrencia de créditos.

## 20. Criterios de aceptación

### MVP local con datos ficticios

- secretos fuera de Git;
- base de datos no pública;
- autorización y aislamiento probados;
- logs minimizados;
- dependencias escaneadas;
- backups o reset reproducible;
- pruebas críticas en CI.

### Antes de datos reales

- threat model aprobado;
- MFA administrativa;
- cifrado y secretos gestionados;
- RLS o control equivalente probado;
- procedimiento de incidentes;
- restauración probada;
- revisión de proveedores y privacidad.

### Antes de lanzamiento

- pentest;
- monitorización y alertas;
- gestión de vulnerabilidades;
- recuperación ante desastres;
- revisión de permisos;
- evaluación jurídica y de impacto cuando proceda.

## 21. Decisiones pendientes

- proveedor de autenticación;
- alcance exacto de RLS;
- campos con cifrado de aplicación;
- herramienta antimalware;
- RPO/RTO;
- plataforma de secretos y observabilidad;
- SLA de vulnerabilidades.
