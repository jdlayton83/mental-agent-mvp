## Mantenimiento de la documentación de arquitectura

Cuando se cree, modifique, sustituya o retire un ADR, Codex deberá actualizar también:

`README.md`

El README raíz contiene el índice de arquitectura y deberá actualizarse cuando se cree, modifique, sustituya o retire un ADR.

El índice de arquitectura deberá:

- incluir únicamente ADR existentes;
- reflejar el estado vigente de cada ADR;
- utilizar rutas relativas correctas;
- mantener la numeración en orden;
- eliminar enlaces a documentos retirados;
- indicar cuando un ADR haya sido sustituido por otro.

Codex no deberá considerar completada una tarea que afecte a decisiones arquitectónicas hasta haber comprobado y, cuando corresponda, actualizado dicho README raíz.

## Flujo de especificación y contexto

Antes de editar, Codex deberá inspeccionar el contexto vigente del proyecto que sea relevante para la tarea, incluyendo documentación, especificaciones, planificación, esquema de base de datos, migraciones e implementación existente cuando corresponda.

Para cambios funcionales no triviales, Codex no deberá implementar sin una especificación de funcionalidad aprobada. La especificación deberá actuar como contrato de implementación y revisión: objetivo, alcance, criterios de aceptación, restricciones, impacto en datos, impacto en IA, pruebas y documentación afectada.

Si los requisitos cambian durante el trabajo, Codex deberá actualizar primero la especificación aplicable y confirmar el nuevo alcance antes de continuar con la implementación.

Codex deberá detenerse y pedir aclaración cuando la especificación activa sea ambigua, contradictoria o insuficiente para implementar con seguridad. No deberá resolver ambigüedades importantes mediante suposiciones silenciosas.

Codex deberá mantener actualizada la documentación que sea fuente de verdad del proyecto cuando una tarea cambie conocimiento estable del sistema, sin reescribir documentos históricos salvo que el cambio lo requiera explícitamente.

Codex deberá guiar al usuario paso a paso, explicar las decisiones técnicas de forma sencilla y no avanzar al siguiente paso mayor hasta que el usuario indique "ok".

La interacción con el usuario podrá ser en inglés, pero la aplicación final deberá mantenerse orientada primero al español.
