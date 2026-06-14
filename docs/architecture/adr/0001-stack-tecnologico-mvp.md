# ADR-001 — Stack tecnológico definitivo del MVP

**Estado:** Aprobado  
**Fecha:** 12 de junio de 2026  
**Ámbito:** MVP local-first y cloud-ready

## 1. Decisión

El MVP se desarrollará como una **aplicación monolítica modular** con el siguiente stack:

| Capa | Tecnología elegida |
|---|---|
| Lenguaje | TypeScript |
| Framework principal | Next.js con App Router |
| Frontend | React mediante Next.js |
| Backend inicial | Route Handlers, Server Actions y servicios internos de Next.js |
| Base de datos | PostgreSQL |
| Búsqueda vectorial | pgvector |
| ORM y migraciones | Drizzle ORM + Drizzle Kit |
| Validación | Zod |
| Autenticación | Auth.js |
| Proveedor LLM inicial | OpenAI, siempre detrás de un gateway propio |
| API de IA | Responses API |
| Embeddings | Modelo configurable mediante variables de entorno |
| Streaming | Streaming desde backend al cliente |
| Contenedores locales | Docker y Docker Compose |
| Pruebas unitarias | Vitest |
| Pruebas end-to-end | Playwright |
| Calidad | ESLint, TypeScript strict y Prettier |
| Repositorio y CI | GitHub + GitHub Actions |
| Logs iniciales | Logging estructurado en JSON |
| Despliegue inicial | Local |
| Despliegue posterior | Contenedor o plataforma compatible con Next.js y PostgreSQL |

## 2. Arquitectura elegida

Se utilizará un único repositorio y una única aplicación desplegable, dividida internamente en módulos.

```text
src/
├── app/
├── components/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── agents/
│   ├── conversations/
│   ├── sessions/
│   ├── memory/
│   ├── goals/
│   ├── habits/
│   ├── credits/
│   ├── safety/
│   ├── ai/
│   ├── usage/
│   ├── consent/
│   └── audit/
├── db/
│   ├── schema/
│   ├── migrations/
│   └── repositories/
├── lib/
├── prompts/
├── config/
└── tests/
```

Cada módulo tendrá como mínimo:

- tipos y esquemas de validación;
- servicios de aplicación;
- repositorios o acceso a persistencia;
- políticas y reglas de negocio;
- pruebas;
- interfaz pública explícita.

La lógica de negocio no se implementará directamente en componentes React, Route Handlers ni Server Actions.

## 3. Decisiones concretas

### 3.1 Next.js con App Router

Se utilizará App Router y no Pages Router.

Motivos:

- permite frontend y backend iniciales en una misma aplicación;
- reduce infraestructura y despliegues;
- soporta componentes de servidor y streaming;
- permite aplicar el patrón Backend for Frontend;
- mantiene abierta la posibilidad de extraer el backend posteriormente.

No se utilizará Next.js como excusa para mezclar interfaz, persistencia y lógica de negocio.

### 3.2 PostgreSQL y pgvector

PostgreSQL será la única base de datos operativa del MVP.

pgvector almacenará los embeddings necesarios para la memoria semántica.

No se incorporarán inicialmente:

- Pinecone;
- Weaviate;
- Qdrant;
- Elasticsearch;
- Redis como vector store;
- una segunda base de datos documental.

La recuperación vectorial deberá filtrar por `user_id` dentro de la consulta SQL antes de ordenar por similitud.

### 3.3 Drizzle ORM

Se elige Drizzle frente a Prisma para este MVP.

Motivos:

- mayor proximidad a SQL;
- soporte directo de tipos y operaciones de PostgreSQL;
- compatibilidad con pgvector;
- migraciones controlables;
- menor riesgo de que el ORM oculte consultas críticas;
- facilidad para implementar filtros, índices y transacciones explícitas.

Las migraciones que creen extensiones, políticas RLS o funciones PostgreSQL podrán contener SQL manual.

### 3.4 Auth.js

Auth.js será la capa inicial de autenticación.

El MVP soportará:

- inicio de sesión por correo y contraseña o enlace mágico;
- sesión segura mediante cookie;
- verificación de correo cuando el producto deje de ser estrictamente local;
- revocación de sesiones;
- protección de rutas;
- separación entre autenticación y autorización.

La autorización de recursos seguirá siendo responsabilidad del backend y no de Auth.js.

Para el primer entorno estrictamente local podrá existir un usuario de desarrollo sembrado mediante `seed`, pero no se mantendrá una bifurcación arquitectónica de “autenticación simulada” incompatible con producción.

### 3.5 OpenAI como primer proveedor

OpenAI será el primer proveedor de IA por velocidad de implementación y cobertura de capacidades.

La aplicación no importará su SDK fuera de:

```text
src/modules/ai/providers/openai/
```

Todas las operaciones pasarán por interfaces propias:

- `generateText`;
- `generateStructured`;
- `classify`;
- `createEmbedding`;
- `streamText`.

No se implementarán Anthropic, Google u OpenRouter en la primera iteración. Solo se construirá la interfaz que permita añadirlos posteriormente.

### 3.6 Responses API

Las nuevas llamadas conversacionales se implementarán mediante Responses API.

El sistema deberá:

- enviar únicamente el contexto seleccionado por la aplicación;
- no delegar la memoria persistente al proveedor;
- registrar modelo, tokens, latencia y coste estimado;
- utilizar salidas estructuradas para clasificación, resúmenes y extracción de memoria;
- aplicar timeout y cancelación;
- impedir reintentos ilimitados.

### 3.7 Zod

Zod validará:

- variables de entorno;
- entradas de API;
- Server Actions;
- configuraciones;
- respuestas estructuradas de IA;
- metadata JSON;
- contratos entre módulos.

La validación del cliente se utilizará para usabilidad, pero toda validación de seguridad o negocio se repetirá en servidor.

### 3.8 Docker

Docker Compose levantará inicialmente:

- PostgreSQL;
- pgvector;
- servicios auxiliares estrictamente necesarios.

La aplicación Next.js podrá ejecutarse fuera de Docker durante desarrollo para acelerar la iteración.

Se mantendrá un Dockerfile válido para verificar portabilidad y preparar el despliegue posterior.

### 3.9 Pruebas

Vitest cubrirá reglas y servicios internos.

Playwright cubrirá:

- onboarding;
- creación del agente;
- inicio de conversación;
- sesión guiada;
- visualización y borrado de memoria;
- consumo simulado de créditos;
- cierre de sesión;
- aislamiento entre usuarios;
- respuestas seguras ante escenarios críticos.

Las pruebas de aislamiento, créditos y memoria serán obligatorias antes de considerar completa una funcionalidad.

## 4. Alcance técnico de la primera versión

La primera versión implementará:

1. usuario y autenticación;
2. onboarding;
3. selección de Nora, Leo o Alma;
4. personalización básica;
5. conversación libre por texto;
6. un modo guiado: “Tomar una decisión”;
7. historial de conversaciones;
8. resumen al finalizar sesión;
9. extracción de candidatos a memoria;
10. consulta, edición y borrado de recuerdos;
11. memoria semántica limitada;
12. clasificación de riesgo;
13. política de respuesta segura;
14. saldo y consumo simulado de créditos;
15. registro de uso y coste técnico;
16. consentimientos mínimos;
17. auditoría de acciones críticas.

## 5. Elementos expresamente aplazados

No se desarrollarán en la primera versión:

- aplicación móvil nativa;
- microservicios;
- Kubernetes;
- Redis;
- colas distribuidas;
- múltiples proveedores de IA implementados;
- audio;
- voz;
- cámara;
- vídeo;
- análisis emocional;
- reconocimiento facial;
- biometría;
- pagos reales;
- Stripe;
- planes de suscripción;
- panel administrativo completo;
- intervención humana;
- RAG documental general;
- ejecución de herramientas externas;
- recordatorios automáticos;
- calendario;
- agentes autónomos;
- marketplace;
- aprendizaje o fine-tuning con conversaciones.

## 6. Seguridad mínima obligatoria desde el primer incremento

Aunque el MVP sea local, deberán existir desde el inicio:

- validación de variables de entorno;
- secretos fuera del repositorio;
- autorización por propietario;
- filtrado por `user_id`;
- consultas parametrizadas;
- cookies seguras según entorno;
- limitación de tamaño de entrada;
- rate limiting básico para llamadas de IA;
- redacción de secretos y contenido sensible en logs;
- identificadores de correlación;
- transacciones para créditos;
- idempotencia en reservas y consumos;
- borrado coherente de memoria y embeddings;
- pruebas de acceso horizontal;
- timeout en llamadas externas;
- presupuesto máximo por sesión.

## 7. Decisiones que no deben reabrirse sin nueva evidencia

Durante la construcción inicial no se reabrirán:

- Next.js frente a un frontend y backend separados;
- PostgreSQL frente a una base de datos NoSQL;
- pgvector frente a una base vectorial externa;
- monolito modular frente a microservicios;
- Drizzle frente a Prisma;
- TypeScript como lenguaje principal;
- Docker Compose para servicios locales;
- un único proveedor LLM inicialmente.

Una decisión podrá revisarse si aparece:

- un bloqueo técnico demostrado;
- un riesgo de seguridad no mitigable;
- una limitación contractual;
- evidencia de rendimiento;
- un coste desproporcionado;
- un requisito validado con usuarios que no pueda satisfacerse.

## 8. Consecuencias

### Positivas

- menor tiempo hasta la primera validación;
- una sola base de código;
- costes iniciales reducidos;
- despliegue sencillo;
- persistencia y vectores en una única base;
- menor acoplamiento con proveedores de IA;
- arquitectura suficientemente portable;
- trazabilidad técnica desde el inicio.

### Negativas aceptadas

- el backend queda inicialmente ligado al runtime de Next.js;
- algunas migraciones requerirán SQL manual;
- el primer proveedor de IA constituye una dependencia operativa temporal;
- el monolito necesitará disciplina modular;
- PostgreSQL asumirá varias responsabilidades durante el MVP.

Estas desventajas son asumibles para la fase de validación.

## 9. Siguiente entregable

El siguiente documento será el backlog ejecutable del MVP, dividido en:

- épicas;
- historias de usuario;
- criterios de aceptación;
- dependencias;
- prioridad;
- pruebas requeridas;
- puerta de finalización de cada incremento.
