# Local-First and Cloud-Ready Architecture

## 1. Propósito

Permitir desarrollar y validar localmente con bajo coste, conservando contratos y límites que faciliten migrar a cloud sin reescribir el núcleo.

## 2. Decisión arquitectónica

El MVP será un monolito modular. No se crearán microservicios, Kubernetes, colas distribuidas ni alta disponibilidad antes de que la carga o el riesgo lo justifiquen.

La portabilidad se obtiene mediante módulos, interfaces, configuración por entorno, migraciones y pruebas; no mediante infraestructura prematura.

## 3. Stack inicial

- Next.js y TypeScript;
- PostgreSQL con pgvector;
- Docker Compose para servicios locales;
- ORM o SQL tipado con soporte real para pgvector;
- validación con Zod o equivalente;
- Playwright para E2E;
- GitHub Actions para lint, tipos, tests, build y seguridad básica.

## 4. Módulos de dominio

- `auth`;
- `users`;
- `agents`;
- `conversations`;
- `sessions`;
- `memory`;
- `goals`;
- `habits`;
- `credits`;
- `safety`;
- `llm`;
- `usage`;
- `privacy`;
- `audit`.

Cada módulo expondrá casos de uso y contratos; la interfaz y rutas no contendrán lógica de negocio crítica.

## 5. Frontend

Responsable de onboarding, chat, modos, memoria, objetivos, hábitos, créditos, privacidad y configuración.

No contendrá:

- secretos;
- prompts internos;
- reglas de autorización definitivas;
- acceso directo a base de datos;
- cálculo confiable de créditos;
- claves de proveedor.

## 6. Backend

Responsable de autenticación, autorización, dominio, IA, memoria, seguridad, persistencia, auditoría y costes. Toda operación crítica se ejecutará en servidor.

## 7. Persistencia

PostgreSQL será la fuente de verdad. El esquema se gestionará mediante migraciones versionadas y seeds idempotentes.

La lógica de negocio dependerá de repositorios de dominio, no del ORM. El SQL específico de pgvector quedará encapsulado.

## 8. Servicios externos abstractos

Interfaces obligatorias:

- proveedor de IA;
- almacenamiento de archivos;
- notificaciones;
- reloj y generador de IDs para pruebas;
- resolución de recursos de seguridad;
- autenticación, cuando se use proveedor externo.

## 9. Archivos

En desarrollo podrán usarse directorios locales fuera del repositorio. La interfaz deberá permitir migrar a object storage.

Los archivos tendrán identificadores aleatorios, metadatos en base de datos, expiración y proceso de borrado. No se utilizarán rutas locales como contrato de dominio.

## 10. Configuración

Variables mínimas:

- entorno y URL de aplicación;
- conexión a base de datos;
- proveedor/modelos de IA;
- claves de proveedor;
- modelos de embedding;
- saldo inicial y límites de consumo;
- almacenamiento;
- logs;
- flags de funcionalidades.

`.env` estará excluido del repositorio. `.env.example` solo contendrá nombres y valores ficticios.

La configuración se validará al arrancar y se expondrá al código mediante un módulo tipado.

## 11. Entornos

- `development`;
- `test`;
- `staging` antes de beta;
- `production` antes de lanzamiento.

Cada entorno tendrá base de datos, secretos, proveedores y políticas propias. No existirán condiciones basadas en nombres de personas, máquinas o rutas locales.

## 12. Docker

Docker Compose levantará PostgreSQL/pgvector con volumen, health check e inicialización. La aplicación podrá ejecutarse fuera de Docker durante desarrollo y deberá verificarse periódicamente en contenedor.

Un comando documentado deberá permitir iniciar y otro resetear el entorno de prueba.

## 13. Migración a cloud

La primera migración deberá requerir principalmente:

- cambiar `DATABASE_URL` y configuración TLS/pool;
- sustituir almacenamiento local por un adaptador cloud;
- mover secretos a un gestor;
- desplegar la aplicación como contenedor o plataforma gestionada;
- activar observabilidad y backups gestionados.

No deberá cambiar contratos de dominio.

## 14. Seguridad local

- datos ficticios por defecto;
- secretos distintos de producción;
- base de datos no expuesta públicamente;
- logs sin conversaciones completas;
- dependencias bloqueadas y auditadas;
- permisos mínimos;
- escaneo de secretos;
- backups solo si son necesarios y protegidos.

## 15. Observabilidad

Desde el MVP se usarán:

- logs estructurados;
- correlation ID;
- métricas de latencia, error, uso y coste;
- auditoría de acciones sensibles.

La arquitectura será compatible con OpenTelemetry y un backend gestionado posterior, sin exigirlo en desarrollo inicial.

## 16. Pruebas

### Unitarias

Dominio de memoria, créditos, seguridad, autorización, costes y proveedores.

### Integración

Base de datos, migraciones, transacciones, pgvector, aislamiento, borrado y adaptadores.

### E2E

Onboarding, agente, chat, modo guiado, memoria, créditos, privacidad y respuestas de seguridad.

## 17. CI

Cada pull request ejecutará:

- formato y lint;
- type checking;
- unitarias e integración;
- build;
- validación de migraciones;
- auditoría de dependencias;
- secret scanning;
- pruebas de aislamiento críticas.

## 18. ADR y documentación

Las decisiones con impacto en portabilidad, seguridad, coste o datos se registrarán como ADR. Las specs definen el qué; los ADR y documentación de arquitectura definen el cómo.

## 19. Criterios de aceptación

- entorno reproducible con instrucciones breves;
- configuración validada y sin secretos en repositorio;
- monolito con límites modulares;
- PostgreSQL y pgvector migrables;
- proveedor de IA y almacenamiento abstraídos;
- migraciones y seeds idempotentes;
- pruebas críticas en CI;
- despliegue en contenedor verificable;
- ningún componente depende de una ruta o máquina concreta.
