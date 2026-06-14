# Iteración 01 — Foundation

**Estado:** Propuesta para ejecución  
**Fecha:** 12 de junio de 2026  
**Duración objetivo:** 1 iteración  
**Documento relacionado:**  
- `docs/architecture/adr/0001-stack-tecnologico-mvp.md`
- `docs/planning/backlog-ejecutable-mvp.md`

## 1. Objetivo

Construir la base técnica reproducible del MVP.

Al finalizar esta iteración, el repositorio deberá:

- arrancar localmente;
- utilizar Next.js con App Router;
- trabajar con TypeScript estricto;
- conectarse a PostgreSQL;
- disponer de pgvector;
- gestionar el esquema mediante Drizzle;
- ejecutar migraciones;
- cargar datos iniciales;
- validar configuración y variables de entorno;
- superar lint, typecheck, tests y build.

Esta iteración no incluirá todavía:

- autenticación funcional;
- onboarding;
- conversación con IA;
- memoria;
- créditos;
- guardrails;
- interfaz final.

## 2. Resultado esperado

El equipo deberá poder clonar el repositorio y levantar el entorno mediante un procedimiento documentado.

El flujo mínimo será:

```bash
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev