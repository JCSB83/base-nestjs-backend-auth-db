# Auditoría de pruebas unitarias

Fecha de verificación: **18 de noviembre de 2026**.

La ejecución actual aprueba **455 pruebas en 61 suites**, sin fallos, pruebas pendientes ni snapshots. Las cuatro métricas globales de cobertura superan el umbral del 80 %. La auditoría corresponde al árbol de trabajo local, incluidos los cambios aún no confirmados en Git.

## Reproducción y evidencia

Desde la raíz del proyecto, con las dependencias instaladas:

```bash
pnpm test:cov --runInBand --json --outputFile=coverage/test-results.json
```

Se ejecutó con `pnpm.cmd` en PowerShell y terminó con código de salida **0**, en **29,088 segundos** según Jest. `pnpm.cmd` evita el bloqueo local de `pnpm.ps1` por la política de ejecución. La ejecución genera:

- `coverage/test-results.json`: resultados de suites y casos.
- `coverage/coverage-final.json`: cobertura detallada por archivo.
- `coverage/lcov.info`: cobertura en formato LCOV.
- `coverage/lcov-report/index.html`: informe navegable.

El [informe de resultados](unit-test-results.md) incluye el inventario completo de suites. Los porcentajes no demuestran por sí solos la suficiencia de las aserciones ni el funcionamiento de integraciones externas.

## Configuración comprobada

- [jest.config.ts](../jest.config.ts) configura entorno `node`, raíz del repositorio y descubrimiento mediante `(src|test)/.*\.spec\.ts$`.
- Las 61 suites están junto al código en `src/`: 42 en `modules/auth-db`, 9 en `modules/shared`, 4 en `modules/metrics`, 2 en `modules/health` y 4 en la raíz.
- Los alias `src/*` y `@/*` se resuelven con `moduleNameMapper`; también se resuelven imports relativos terminados en `.js`.
- `ts-jest` transforma las pruebas TypeScript con [tsconfig.spec.json](../tsconfig.spec.json) en CommonJS. Los archivos JavaScript tienen una transformación separada con `useESM: true` para conservar las dependencias ESM. Los scripts de Jest usan `--experimental-vm-modules`.
- `transformIgnorePatterns` contempla la estructura de pnpm y las dependencias `@nestjs/config`, `@nestjs/jwt` y `es-toolkit`.
- La cobertura incluye `src/**/*.ts` y excluye `*.d.ts` y `*.enum.ts`. El mínimo del 80 % es global para las cuatro métricas, no por archivo.
- [tsconfig.build.json](../tsconfig.build.json) excluye los tests de la compilación de producción.
- [.husky/pre-commit](../.husky/pre-commit) ejecuta `pnpm test`, sin cobertura. [.husky/commit-msg](../.husky/commit-msg) valida el mensaje con Commitlint. Esta revisión leyó los hooks; no ejecutó un commit.
- El script `test:e2e` apunta a `test/jest-e2e.json`, que no existe en el árbol revisado.

## Cobertura observada

| Métrica | Resultado | Umbral global |
| --- | --- | --- |
| Sentencias | 99,83 % | 80 % |
| Ramas | 97,10 % | 80 % |
| Funciones | 100 % | 80 % |
| Líneas | 99,82 % | 80 % |

Cuatro archivos tienen cobertura parcial. Las rutas son relativas a `src/modules/` y las líneas corresponden a esta revisión.

| Archivo | Sentencias | Ramas | Funciones | Líneas | Pendiente |
| --- | --- | --- | --- | --- | --- |
| `auth-db/presentation/controllers/me.controller.ts` | 94,44 % | 100 % | 100 % | 93,75 % | Línea 87. |
| `auth-db/infrastructure/persistence/typeorm/repositories/session.repository.ts` | 100 % | 81,25 % | 100 % | 100 % | Ramas en líneas 155, 165 y 186. |
| `metrics/metrics.service.ts` | 100 % | 84,61 % | 100 % | 100 % | Ramas en líneas 41 y 84. |
| `shared/services/log4jsLogger.service.ts` | 95 % | 75 % | 100 % | 94,73 % | Línea 20. |

El resto de los archivos incluidos alcanza el 100 % en las cuatro métricas. `SharedModule.onModuleInit()` está cubierto en la versión actual; el hallazgo anterior sobre ese método ya no aplica.

## Alcance comprobado

| Área | Suites | Pruebas | Comportamientos |
| --- | --- | --- | --- |
| Configuración y arranque (`src/`) | 4 | 34 | Getters y esquema Joi, configuración global, inicialización, opciones de arranque, errores y cierre. |
| `modules/health` | 2 | 5 | Liveness, readiness y configuración del módulo con indicadores simulados. |
| `modules/metrics` | 4 | 19 | Registro y reutilización de métricas, etiquetas, solicitudes finalizadas o abortadas y errores. |
| `modules/shared` | 9 | 83 | Selección de logger, niveles, serialización, transporte simulado, interceptor, errores, DTO y utilidades. |
| `modules/auth-db` | 42 | 314 | Configuración, autenticación, sesiones, persistencia simulada, permisos, DTO y limpieza. |
| **Total** | **61** | **455** | |

### Desglose de auth-db

Rutas relativas a `src/modules/auth-db/`:

| Grupo | Suites | Alcance |
| --- | --- | --- |
| `auth-db.config`, `auth-db.config.module`, `auth-db.module` | 3 | Getters, esquema requerido, registro de configuración y opciones de JWT, PostgreSQL, entidades y providers. |
| `application/use-cases/` | 10 | Login, refresh, validación de token, usuario, sesiones, logout, logout global, revocación y dos limpiezas de expirados. |
| `application/dto/` | 1 | Construcción del DTO de usuario. |
| `infrastructure/decorators/`, `guards/` | 3 | Metadatos de permisos y guards JWT y permisos. |
| `infrastructure/utils/` | 1 | Hash SHA-256 y generación de identificadores. |
| `infrastructure/persistence/typeorm/entities/` | 3 | Usuario, perfil y relación perfil-opción. |
| `infrastructure/persistence/typeorm/repositories/` | 5 | Repositorio base, opciones, usuarios, sesiones y refresh tokens. |
| `infrastructure/persistence/typeorm/migrations/` | 7 | Creación y reversión de tablas y datos iniciales mediante QueryRunner simulado. |
| `jobs/` | 2 | Delegación de limpieza y manejo de errores. |
| `presentation/controllers/` | 5 | Login, logout, usuario actual, refresh y sesiones. |
| `presentation/dto/` | 2 | Validación de login y refresh token. |

Las pruebas de Loki cubren filtrado por niveles, descarte con `OFF`, contenido enviado, serialización, errores de transporte y envíos concurrentes. `LokiLoggerService` conserva el 100 % en las cuatro métricas.

## Antecedentes y cambios de esta verificación

En la revisión anterior, la reproducción inicial tuvo **9 suites fallidas y 53 aprobadas**. Hubo 1 prueba fallida y 377 aprobadas; las suites que no pudieron cargarse no ejecutaron sus casos.

- En `jest.config.ts` se separó la transformación JavaScript con `useESM: true` de la transformación TypeScript CommonJS. Esto corrigió `ReferenceError: exports is not defined` al cargar dependencias ESM de NestJS.
- En `src/app.config.module.spec.ts` se añadieron las variables obligatorias de PostgreSQL y JWT al conjunto de datos válido del esquema combinado.

Después de esas correcciones pasaron 62 suites y 457 pruebas. Desde esa revisión se eliminaron `JwtStrategy`, su registro en `AuthDbModule` y `jwt.strategy.spec.ts`, que contenía dos pruebas. La ejecución actual verifica **61 suites y 455 pruebas**, de las cuales **42 suites y 314 pruebas** corresponden a `auth-db`. La autenticación conserva `JwtAuthGuard` y `ValidateTokenUseCase`; la estrategia eliminada ya no forma parte del alcance ni de la cobertura. Los umbrales permanecen sin cambios. Esta actualización solo modifica los informes y no altera tests ni lógica de producción.

## Aislamiento y límites

Las pruebas invocan clases y métodos con dependencias simuladas; no equivalen a ejecutar la aplicación completa.

- El arranque utiliza una aplicación Nest simulada: no abre un puerto y las señales y salidas de proceso se interceptan.
- Swagger y Terminus se simulan en las suites correspondientes; no se verifica el documento OpenAPI real ni la integración de indicadores.
- Axios y Log4js se sustituyen: no se comprueba un servidor Loki ni la escritura o rotación real de archivos de log.
- Interceptores, controladores y guards utilizan solicitudes y contextos simulados; no recorren el pipeline HTTP completo.
- La validación de DTO y las opciones de `ValidationPipe` se comprueban por separado, sin una petición HTTP real que conecte ambos comportamientos.
- Repositorios, transacciones, QueryRunner y métodos JWT se simulan. No se ejecutan migraciones contra PostgreSQL ni se verifica rollback real, concurrencia o un flujo de autenticación completo con firma y verificación reales.
- La cobertura de entidades y decoradores incluye código ejecutado al importar módulos; no equivale a comprobar restricciones de base de datos o persistencia real.

No se ejecutaron build de producción, lint, comprobación independiente de tipos ni e2e en esta actualización. La ejecución emitió el aviso experimental de Node sobre VM Modules y terminó correctamente.

## Hallazgos y acciones pendientes

| Prioridad | Evidencia | Acción propuesta |
| --- | --- | --- |
| Media | Persistencia y JWT simulados. | Añadir pruebas de integración con PostgreSQL y tokens reales para migraciones, transacciones, renovación y revocación. |
| Media | `test:e2e` referencia una configuración inexistente. | Incorporar configuración y casos HTTP, o retirar el script hasta disponer de ellos. |
| Media | En `MeController`, el caso de uso se ejecuta antes del `try`; sus errores se propagan sin pasar por `getHttpException`. La suite documenta ese comportamiento y la línea 87 queda sin cubrir. | Revisar el contrato HTTP esperado y el alcance del manejo de errores. |
| Media | `CommonController.getHttpException` usa el mensaje fijo `login failed` para errores inesperados, ignorando el mensaje de la operación. | Definir el mensaje público esperado para cada operación y cubrirlo. |
| Media | La revocación recibe `sessionId` y `logId`; no recibe la identidad del solicitante ni comprueba propiedad en el caso de uso. Las pruebas verifican delegación. | Definir la autorización de revocación y añadir un caso entre usuarios distintos. |
| Baja | `SessionRepository` deja sin ejecutar alternativas de selección de repositorio según `EntityManager` en 155, 165 y 186. | Evaluar su alcance desde operaciones públicas antes de añadir casos. |
| Baja | `MetricsService` no ejecuta las alternativas `?? []` de los mapas de etiquetas en 41 y 84. | Mantener pruebas de la API pública; no alterar mapas privados solo para subir cobertura. |
| Baja | El retorno defensivo de `Log4jsLoggerService.configure()` en la línea 20 no se ejecuta; el constructor evita esa llamada cuando ya está configurado. | Evaluar si la guardia sigue siendo necesaria. |
| Baja | El hook pre-commit ejecuta tests sin cobertura. | Si se desea exigir el umbral en cada cambio, ejecutar `test:cov` en la automatización correspondiente. |

Estos hallazgos quedan documentados; no se implementaron las acciones propuestas en esta actualización.
