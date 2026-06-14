# Credit and Usage System Specification

## 1. Propósito

Medir consumo técnico y simular modelos comerciales sin introducir pagos reales ni confundir coste operativo con precio al usuario.

## 2. Principios

- coste técnico y precio comercial separados;
- reglas configurables y versionadas;
- historial inmutable;
- consistencia transaccional;
- idempotencia;
- estimación comprensible;
- devolución por fallos técnicos;
- ausencia de presión emocional;
- seguridad disponible aunque no haya saldo.

## 3. Modelo del MVP

El MVP utilizará créditos internos simulados. El saldo inicial recomendado es 100, configurable.

| Tipo de sesión | Coste base inicial | Uso incluido |
|---|---:|---:|
| Conversación libre breve | 5 | 10 mensajes del usuario |
| Sesión guiada estándar | 10 | 20 mensajes del usuario |
| Sesión profunda experimental | 20 | 30 mensajes del usuario |

Regla provisional: 1 crédito por cada 2 mensajes adicionales. Todos los valores son hipótesis de producto, no precios definitivos.

## 4. Flujo transaccional

### Inicio

1. validar usuario y saldo;
2. calcular estimación;
3. reservar el coste base con clave de idempotencia;
4. crear la sesión;
5. confirmar la reserva al producirse la primera interacción válida.

### Durante la sesión

- registrar mensajes y operaciones técnicas;
- avisar antes de consumo adicional;
- impedir sesiones principales simultáneas no controladas;
- aplicar presupuesto máximo por sesión.

### Cierre

1. calcular consumo real;
2. crear transacción de consumo;
3. liberar saldo reservado no utilizado;
4. registrar coste técnico;
5. mostrar desglose y saldo restante.

## 5. Cartera

Cada usuario tendrá una cartera con:

- saldo disponible;
- saldo reservado;
- estado;
- timestamps;
- versión para control de concurrencia.

Los saldos no podrán ser negativos. Se permitirá un margen técnico interno únicamente para cerrar de forma segura una respuesta o sesión; nunca se mostrará como deuda.

## 6. Transacciones

Tipos:

- `initial_balance`;
- `reservation`;
- `consumption`;
- `release`;
- `adjustment`;
- `promotion`;
- `refund`;
- `expiration`;
- `simulated_top_up`;
- `administrative_correction`.

Cada movimiento incluirá saldo anterior y posterior, motivo, origen, sesión y clave de idempotencia cuando proceda. No se editarán transacciones; los errores se corrigen con un movimiento compensatorio.

## 7. Reserva y concurrencia

Las reservas tendrán estados `pending`, `active`, `confirmed`, `released`, `cancelled` o `expired`.

Toda modificación de cartera se ejecutará en una transacción de base de datos con bloqueo o control optimista. La misma petición no podrá consumir dos veces.

## 8. Sesiones pausadas o abandonadas

- pausa manual: no consume por tiempo;
- inactividad inicial: 30 minutos configurables;
- reanudación: hasta 24 horas, configurable;
- cierre automático: cobra solo consumo válido y libera la reserva restante.

## 9. Saldo insuficiente

- no iniciará una nueva sesión de pago simulado;
- conservará acceso a historial, privacidad y borrado;
- permitirá cerrar y resumir una sesión activa;
- ejecutará respuestas de seguridad sin coste adicional;
- podrá ofrecer recarga simulada neutral.

Quedan prohibidos mensajes que vinculen afecto, abandono o ayuda urgente con la compra de créditos.

## 10. Medición técnica

Cada operación registrará:

- proveedor y modelo;
- tipo de operación;
- modalidad;
- tokens o unidades de entrada/salida;
- latencia y duración;
- precio vigente versionado;
- coste estimado;
- usuario, sesión, mensaje y correlation ID;
- estado, error y reintentos.

Componentes mínimos: chat, clasificación, moderación, resumen, extracción de memoria, embeddings y reintentos. Las futuras modalidades se añadirán sin cambiar el ledger.

## 11. Fallos y regeneraciones

No se cobrará por:

- timeout o indisponibilidad del proveedor;
- respuesta vacía o inválida;
- duplicado del sistema;
- bloqueo de seguridad;
- error interno;
- regeneración causada por un fallo atribuible al producto.

Una regeneración voluntaria podrá consumir créditos solo después de informar al usuario.

## 12. Límites de coste

Cada sesión tendrá límites configurables de:

- créditos;
- coste monetario interno;
- mensajes;
- llamadas;
- tokens;
- duración.

Al aproximarse al límite, el sistema podrá reducir contexto, resumir, cambiar a un modelo más económico o cerrar ordenadamente. Nunca ejecutará reintentos infinitos.

## 13. Experimentos de negocio

La lógica comercial se representará mediante planes y reglas versionadas, no mediante constantes dispersas.

Modelos a probar:

- suscripción con límites;
- paquetes de créditos;
- pago por sesión;
- modelo híbrido;
- freemium;
- precio diferencial por modalidad.

Antes de pagos reales deberán validarse disposición a pagar, margen, fiscalidad, consumidores, devoluciones, caducidad y transparencia.

## 14. Paneles

### Usuario

- saldo y reserva;
- sesiones recientes;
- coste estimado y final;
- mensajes incluidos y adicionales;
- ajustes y devoluciones.

### Operación

- coste por usuario, sesión, modo, proveedor y modelo;
- margen simulado;
- errores y devoluciones;
- consumo anómalo;
- latencia y reintentos.

## 15. Pruebas críticas

- creación de saldo inicial una sola vez;
- doble petición idempotente;
- reserva concurrente;
- consumo y liberación;
- devolución por fallo;
- saldo insuficiente;
- cierre seguro sin saldo;
- corrección administrativa auditable;
- sesión abandonada;
- protección frente a bucles.

## 16. Criterios de aceptación

- saldo nunca negativo;
- cada cambio genera transacción;
- las reservas y consumos son atómicos;
- los fallos técnicos no penalizan al usuario;
- el coste técnico puede reconstruirse históricamente;
- el modelo comercial puede cambiar sin migrar el ledger;
- seguridad y derechos de privacidad no dependen del saldo.
