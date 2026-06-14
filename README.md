# Arquitectura del proyecto

Esta carpeta contiene la documentación técnica y las decisiones de arquitectura del MVP.

Su objetivo es definir cómo se construirá el sistema, qué tecnologías se utilizarán, qué principios arquitectónicos deberán respetarse y qué decisiones técnicas han sido aprobadas.

La documentación de esta carpeta complementa las especificaciones funcionales del producto, pero no las sustituye.

## Contenido

### Architecture Decision Records

Los Architecture Decision Records, o ADR, documentan decisiones técnicas relevantes del proyecto.

Cada ADR debe dejar constancia de:

- el contexto de la decisión;
- la decisión adoptada;
- las alternativas consideradas;
- los motivos de la elección;
- las consecuencias positivas y negativas;
- el estado actual de la decisión.

ADR disponibles:

- [ADR-0001 — Stack tecnológico del MVP](docs/architecture/adr/0001-stack-tecnologico-mvp.md)

## Estructura de la carpeta

```text
README.md
docs/
└── architecture/
    ├── adr/
    │   └── 0001-stack-tecnologico-mvp.md
    ├── database-schema.md
    ├── incident-response.md
    ├── llm-provider-abstraction.md
    ├── local-first-cloud-ready.md
    ├── privacy-and-compliance.md
    └── security-architecture.md
```
