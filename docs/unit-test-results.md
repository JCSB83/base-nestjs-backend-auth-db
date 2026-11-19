# Resultado de pruebas unitarias

Fecha de verificación: **18 de noviembre de 2026**.

## Resultado

| Indicador | Resultado |
| --- | --- |
| Suites | 61 aprobadas, 0 fallidas |
| Pruebas | 455 aprobadas, 0 fallidas |
| Pruebas pendientes / todo | 0 / 0 |
| Snapshots | 0 |
| Código de salida | 0 |
| Duración informada por Jest | 29,088 segundos |

| Métrica de cobertura | Resultado | Umbral global |
| --- | --- | --- |
| Sentencias | 99,83 % | 80 % |
| Ramas | 97,10 % | 80 % |
| Funciones | 100 % | 80 % |
| Líneas | 99,82 % | 80 % |

Los umbrales no se modificaron. Los resultados corresponden al árbol de trabajo local revisado, incluidos los cambios sin confirmar en Git.

## Comando ejecutado

```powershell
pnpm.cmd test:cov --runInBand --json --outputFile=coverage/test-results.json
```

Se utilizó `pnpm.cmd` por la restricción local de ejecución de scripts de PowerShell. En otros entornos puede utilizarse `pnpm` con los mismos argumentos. Jest ejecutó toda la suite y comprobó los umbrales de cobertura. El aviso experimental de Node sobre VM Modules no impidió finalizar correctamente.

Artefactos generados en `coverage/`:

- `test-results.json`: resultados por suite y prueba.
- `coverage-final.json`: cobertura detallada.
- `lcov.info`: informe LCOV.
- `lcov-report/index.html`: informe HTML.

En esta actualización no se ejecutaron build, lint, comprobación independiente de tipos ni e2e. Las validaciones de versiones anteriores de este documento no se presentan como verificaciones del estado actual.

## Distribución de pruebas

| Área | Suites | Pruebas aprobadas |
| --- | --- | --- |
| Configuración y arranque (`src/`) | 4 | 34 |
| `src/modules/auth-db/` | 42 | 314 |
| `src/modules/health/` | 2 | 5 |
| `src/modules/metrics/` | 4 | 19 |
| `src/modules/shared/` | 9 | 83 |
| **Total** | **61** | **455** |

## Alcance

La suite cubre configuración y validación del entorno, inicialización y cierre, controladores, métricas, middleware, interceptor, loggers, DTO, errores y utilidades.

`auth-db` añade pruebas de configuración PostgreSQL/JWT, login, renovación y validación de tokens, consulta de usuario y sesiones, logout, revocación, limpieza de expirados, permisos, repositorios, entidades y migraciones.

Las dependencias externas se simulan. No se inicia un servidor HTTP, no se conecta PostgreSQL, no se ejecutan migraciones reales ni se comprueba el transporte de Loki o la rotación de archivos Log4js. Las pruebas unitarias de JWT no equivalen a un flujo HTTP completo con tokens reales.

## Cambios respecto de la verificación anterior

La revisión anterior aprobó 457 pruebas en 62 suites. Desde entonces se eliminaron `JwtStrategy`, su registro en `AuthDbModule` y la suite `jwt.strategy.spec.ts` con sus dos pruebas. La ejecución actual aprueba **455 pruebas en 61 suites**; `auth-db` aporta **314 pruebas en 42 suites**. Se mantienen `JwtAuthGuard` y `ValidateTokenUseCase`.

Se conservan las correcciones previas que permitieron ejecutar la suite:

- `jest.config.ts`: transformación JavaScript separada con `useESM: true`, conservando CommonJS para las pruebas TypeScript. Corrige `exports is not defined` al cargar dependencias ESM de NestJS.
- `src/app.config.module.spec.ts`: datos de PostgreSQL y JWT añadidos al caso válido del esquema combinado de configuración.

La ejecución completa con cobertura confirma que las 61 suites actuales pasan. Esta actualización documental no añade ni modifica pruebas, dependencias o código de producción.

## Cobertura pendiente

| Archivo relativo a `src/modules/` | Pendiente |
| --- | --- |
| `auth-db/presentation/controllers/me.controller.ts` | Línea 87: conversión de errores dentro del `catch`; el caso de uso se ejecuta antes del `try`. |
| `auth-db/infrastructure/persistence/typeorm/repositories/session.repository.ts` | Ramas de selección del repositorio según `EntityManager` en 155, 165 y 186. |
| `metrics/metrics.service.ts` | Alternativas `?? []` de los mapas de etiquetas en 41 y 84. |
| `shared/services/log4jsLogger.service.ts` | Línea 20: retorno defensivo cuando la configuración ya existe. |

Todas las funciones contabilizadas tienen cobertura. Los porcentajes no garantizan que todos los contratos, escenarios de autorización o integraciones estén comprobados. La [auditoría](unit-test-audit.md) desarrolla los límites, hallazgos y acciones pendientes.

## Inventario de suites ejecutadas

Inventario extraído de `coverage/test-results.json`; todas estas suites finalizaron correctamente. Las rutas son relativas a la raíz del proyecto y no representan una lista de archivos creados en esta actualización.

- `src/app.config.module.spec.ts`
- `src/app.config.spec.ts`
- `src/app.module.spec.ts`
- `src/main.spec.ts`
- `src/modules/auth-db/application/dto/user.dto.spec.ts`
- `src/modules/auth-db/application/use-cases/deletedExpiredSessions.use-case.spec.ts`
- `src/modules/auth-db/application/use-cases/deleteExpiredRefreshTokens.use-case.spec.ts`
- `src/modules/auth-db/application/use-cases/getSessions.use-case.spec.ts`
- `src/modules/auth-db/application/use-cases/getUser.use-case.spec.ts`
- `src/modules/auth-db/application/use-cases/login.use-case.spec.ts`
- `src/modules/auth-db/application/use-cases/logout.use-case.spec.ts`
- `src/modules/auth-db/application/use-cases/logoutAll.use-case.spec.ts`
- `src/modules/auth-db/application/use-cases/refreshToken.use-case.spec.ts`
- `src/modules/auth-db/application/use-cases/revokeSession.use-case.spec.ts`
- `src/modules/auth-db/application/use-cases/validateToken.use-case.spec.ts`
- `src/modules/auth-db/auth-db.config.module.spec.ts`
- `src/modules/auth-db/auth-db.config.spec.ts`
- `src/modules/auth-db/auth-db.module.spec.ts`
- `src/modules/auth-db/infrastructure/decorators/permissions.decorator.spec.ts`
- `src/modules/auth-db/infrastructure/guards/jwt.authguard.spec.ts`
- `src/modules/auth-db/infrastructure/guards/permissions.guard.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/entities/profile.entity.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/entities/profileOption.entity.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/entities/user.entity.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/migrations/1763596800000-createOptionTable.migration.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/migrations/1763596800001-createProfileTable.migration.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/migrations/1763596800002-createProfileOptionTable.migration.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/migrations/1763596800003-createUserTable.migration.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/migrations/1763596800004-createRefreshTokenTable.migration.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/migrations/1763596800005-createSessionTable.migration.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/migrations/1763596800006-insertDataTable.migration.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/repositories/option.repository.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/repositories/refreshToken.repository.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/repositories/session.repository.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/repositories/typeorm.repository.spec.ts`
- `src/modules/auth-db/infrastructure/persistence/typeorm/repositories/user.repository.spec.ts`
- `src/modules/auth-db/infrastructure/utils/utils.spec.ts`
- `src/modules/auth-db/jobs/deleteExpiredRefreshTokens.cron.spec.ts`
- `src/modules/auth-db/jobs/deleteExpiredSessions.cron.spec.ts`
- `src/modules/auth-db/presentation/controllers/login.controller.spec.ts`
- `src/modules/auth-db/presentation/controllers/logout.controller.spec.ts`
- `src/modules/auth-db/presentation/controllers/me.controller.spec.ts`
- `src/modules/auth-db/presentation/controllers/refresh.controller.spec.ts`
- `src/modules/auth-db/presentation/controllers/session.controller.spec.ts`
- `src/modules/auth-db/presentation/dto/login.dto.spec.ts`
- `src/modules/auth-db/presentation/dto/refreshToken.dto.spec.ts`
- `src/modules/health/health.controller.spec.ts`
- `src/modules/health/health.module.spec.ts`
- `src/modules/metrics/metrics.controller.spec.ts`
- `src/modules/metrics/metrics.middleware.spec.ts`
- `src/modules/metrics/metrics.module.spec.ts`
- `src/modules/metrics/metrics.service.spec.ts`
- `src/modules/shared/controllers/common.controller.spec.ts`
- `src/modules/shared/dto/response.dto.spec.ts`
- `src/modules/shared/errors/repository.error.spec.ts`
- `src/modules/shared/errors/usecase.error.spec.ts`
- `src/modules/shared/interceptors/log-request.interceptor.spec.ts`
- `src/modules/shared/services/log4jsLogger.service.spec.ts`
- `src/modules/shared/services/lokiLogger.service.spec.ts`
- `src/modules/shared/shared.module.spec.ts`
- `src/modules/shared/utils/utils.spec.ts`
