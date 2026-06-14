# Informe de optimización de especificaciones

## Resultado

Se han reescrito las once especificaciones como un sistema coherente y orientado a ejecución. Se ha reducido el volumen, eliminado numeración artificial y trasladado cada requisito a su documento propietario.

## Cambios estructurales

- `mvp.md` queda como fuente de alcance, validación y puertas de fase.
- `agent-behavior.md` describe únicamente conducta visible.
- `safety-guardrails.md` concentra seguridad conversacional.
- `security-architecture.md` concentra ciberseguridad técnica.
- `privacy-and-compliance.md` concentra privacidad y obligaciones.
- `memory-system.md` define ciclo de vida de memoria.
- `credit-system.md` separa ledger, medición y experimentos comerciales.
- `database-schema.md` reduce el esquema a entidades justificadas por el MVP.
- `llm-provider-abstraction.md` fija el gateway y los contratos de proveedor.
- `local-first-cloud-ready.md` elimina infraestructura prematura.
- `incident-response.md` se convierte en procedimiento ejecutable y playbooks.

## Inconsistencias corregidas

- memoria semántica tratada como mecanismo de recuperación, no como verdad separada;
- eliminación del campo redundante `total_balance` en la cartera;
- separación de preferencias y consentimientos;
- archivo/multimodalidad aplazados hasta implementación real;
- RLS definida como segunda barrera antes de beta, no como posibilidad indefinida;
- créditos declarados hipótesis de negocio y no precios;
- seguridad y privacidad disponibles sin depender del saldo;
- menor repetición de cámara, micrófono, biometría y proveedores futuros;
- criterios de aceptación y puertas de fase más concretos;
- responsabilidades claras entre documentos.

## Pendientes que requieren decisión de negocio o técnica

- segmento inicial y problema principal;
- umbrales de validación;
- proveedor y modelos;
- autenticación y ORM;
- política de retención;
- bases jurídicas y DPIA;
- modelo comercial a experimentar;
- RPO/RTO y observabilidad de producción.
