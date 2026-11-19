# Base NestJS Backend Auth DB

Base para desarrollar APIs HTTP con **NestJS y TypeScript**. Incluye autenticación JWT con persistencia PostgreSQL mediante TypeORM, configuración validada, logs mediante Log4js o Loki, monitoreo de salud, métricas Prometheus, Swagger y pruebas unitarias.

El módulo raíz carga `AppConfigModule`, `AuthDbModule`, `HealthModule`, `MetricsModule` y `SharedModule`. El módulo `auth-db` gestiona autenticación, renovación de tokens y sesiones persistidas en base de datos.

## Funciones principales

- **Configuración centralizada:** variables de entorno validadas con Joi y disponibles mediante `AppConfig`.
- **Validación HTTP:** `ValidationPipe` global con transformación, lista de propiedades permitidas y rechazo de propiedades adicionales en DTO validados.
- **Logs configurables:** consola y archivos rotativos con Log4js, o envío HTTP a Loki mediante el provider `LOGGER_SERVICE`.
- **Seguimiento HTTP:** `LogRequestInterceptor` registra identificador, ruta, estado, duración y cuerpo de respuesta; los controladores pueden omitir el cuerpo mediante `req.logData=false`.
- **Salud:** endpoints de vida y disponibilidad; en modo Loki, readiness verifica el servicio remoto.
- **Métricas:** métricas predeterminadas de `@prometheus-io/client`, contador de solicitudes e histograma de duración.
- **Autenticación:** access tokens y refresh tokens, consulta de usuario, listado y revocación de sesiones, cierre de sesión y cierre global.
- **Persistencia:** usuarios, perfiles, opciones de permisos, sesiones y refresh tokens con TypeORM, migraciones y limpieza programada.
- **Swagger:** documentación de autenticación, salud y métricas en `/swagger`.
- **Ciclo de vida:** manejo de errores de arranque y cierre por señales `SIGINT` y `SIGTERM`.

## Inicio rápido

Necesitas Node.js, pnpm y PostgreSQL accesible con la base de datos creada. Log4js permite ejecutar sin Loki; `auth-db` requiere conexión a PostgreSQL al arrancar.

```bash
pnpm install
```

Copia [`.env.example`](.env.example) como `.env` y configura los valores del entorno. Para usar logs locales:

```dotenv
PORT=3210
ENVIRONMENT=LOCAL
APP_NAME=base-nestjs-backend-auth-db
APP_DESCRIPTION=API base con NestJS
APP_VERSION=1.0.0
LOG_MODE=log4js
LOG_LEVEL=INFO
LOG_DIR=./logs
LOG_NAME=base-nestjs-backend-auth-db

AUTH_DATABASE_HOST=127.0.0.1
AUTH_DATABASE_PORT=5432
AUTH_DATABASE_USERNAME=postgresusr
AUTH_DATABASE_PASSWORD=postgrespwd
AUTH_DATABASE_NAME=auth
AUTH_DATABASE_SYNCRONIZE=false
AUTH_DATABASE_LOGGING=false
AUTH_DATABASE_MIGRATIONSRUN=true
AUTH_DATABASE_MAXEXECUTIONTIME=30000
JWT_SECRET=reemplazar-por-un-secreto-de-acceso
JWT_EXPIRESIN=900
JWT_REFRESH_SECRET=reemplazar-por-un-secreto-de-renovacion
JWT_REFRESH_EXPIRESIN=3600
```

El archivo de ejemplo selecciona `LOG_MODE=loki`. Si mantienes ese modo, configura `LOKI_URL` con la URL absoluta HTTP(S) de tu instancia de Loki, por ejemplo `http://127.0.0.1:3100`. Para cambiar a logs locales, reemplaza la asignación existente de `LOG_MODE`.

Ajusta el puerto PostgreSQL a tu instancia: `.env.example` usa `5423`, mientras que arriba se utiliza `5432`. Las duraciones JWT son **segundos**: `900` equivale a 15 minutos y `3600` a una hora. Los valores `900000` y `3600000` de `.env.example` no corresponden a los comentarios de duración que los acompañan.

```bash
pnpm start:dev
```

Con `PORT=3210`, abre [Swagger](http://localhost:3210/swagger) o consulta [la comprobación de vida](http://localhost:3210/health/live).

En PowerShell, utiliza `pnpm.cmd` si la política de ejecución bloquea `pnpm.ps1`.

## Variables de entorno

Los esquemas de [`src/app.config.ts`](src/app.config.ts) y [`auth-db.config.ts`](src/modules/auth-db/auth-db.config.ts) se combinan en `AppConfigModule`. La validación convierte valores del entorno, conserva variables ajenas al esquema e informa conjuntamente los errores encontrados.

| Variable          | Valor o requisito                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `PORT`            | Obligatoria; puerto entre 0 y 65535. Usa un puerto fijo para acceder mediante las URLs del ejemplo.          |
| `ENVIRONMENT`     | Obligatoria: `LOCAL`, `DEV`, `QA` o `PROD`.                                                                  |
| `APP_NAME`        | Por defecto: `base-nestjs-backend-auth-db`.                                                                          |
| `APP_DESCRIPTION` | Opcional; por defecto una cadena vacía.                                                                      |
| `APP_VERSION`     | Por defecto: `1.0.0`.                                                                                        |
| `LOG_MODE`        | Obligatoria: `log4js` o `loki`.                                                                              |
| `LOG_LEVEL`       | Obligatoria: `ALL`, `TRACE`, `DEBUG`, `INFO`, `MARK`, `WARN`, `ERROR`, `FATAL` u `OFF`.                      |
| `LOG_DIR`         | En Log4js, por defecto `./logs`; opcional en Loki.                                                           |
| `LOG_NAME`        | En Log4js, por defecto `base-nestjs-backend-auth-db`; el logger actual utiliza `APP_NAME` para el nombre de archivo. |
| `LOKI_URL`        | Obligatoria en modo Loki; URL absoluta HTTP(S). Opcional en Log4js.                                          |

### Variables de auth-db

Todas son obligatorias, incluso al usar Log4js.

| Variable | Uso |
| --- | --- |
| `AUTH_DATABASE_HOST` | Host de PostgreSQL. |
| `AUTH_DATABASE_PORT` | Puerto numérico de PostgreSQL. |
| `AUTH_DATABASE_USERNAME` | Usuario de conexión. |
| `AUTH_DATABASE_PASSWORD` | Contraseña de conexión. |
| `AUTH_DATABASE_NAME` | Nombre de la base de datos existente. |
| `AUTH_DATABASE_SYNCRONIZE` | Booleano para sincronizar entidades; conserva esta grafía en el código. |
| `AUTH_DATABASE_LOGGING` | Booleano para habilitar logs de TypeORM. |
| `AUTH_DATABASE_MIGRATIONSRUN` | Booleano para ejecutar migraciones pendientes al iniciar. |
| `AUTH_DATABASE_MAXEXECUTIONTIME` | Umbral en milisegundos para registrar consultas lentas. |
| `JWT_SECRET` | Secreto de firma del access token. |
| `JWT_EXPIRESIN` | Duración del access token en segundos; entero positivo. |
| `JWT_REFRESH_SECRET` | Secreto de firma del refresh token. |
| `JWT_REFRESH_EXPIRESIN` | Duración del refresh token en segundos; entero positivo. |

## Módulo auth-db

[`AuthDbModule`](src/modules/auth-db/auth-db.module.ts) organiza la autenticación en capas de dominio, aplicación, infraestructura y presentación. Incluye repositorios TypeORM, entidades y migraciones para usuarios, perfiles, opciones, relaciones perfil-opción, sesiones y refresh tokens.

El login valida las credenciales y el estado activo del usuario, genera ambos JWT y guarda la sesión y los datos del refresh token. La renovación verifica el refresh token y su registro, genera un nuevo `jti` y reemplaza los registros anteriores. `JwtAuthGuard` valida el access token, la sesión persistida y el usuario; añade `user`, `userId` y `sessionId` a la solicitud.

Las tareas programadas eliminan sesiones y refresh tokens expirados cada minuto. También se incluyen `Permissions` y `PermissionsGuard`, que comprueba los permisos de `request.user`; su aplicación debe configurarse explícitamente en las rutas que lo necesiten.

### Migraciones y datos iniciales

Con `AUTH_DATABASE_MIGRATIONSRUN=true`, TypeORM ejecuta las [migraciones pendientes](src/modules/auth-db/infrastructure/persistence/typeorm/migrations) al arrancar. Para trabajar con migraciones, mantén `AUTH_DATABASE_SYNCRONIZE=false`.

La migración de datos iniciales crea opciones de permisos, el perfil `admin` y el usuario `admin@base.com` con contraseña `password123`. Sustituye estas credenciales antes de exponer el servicio. No hay un endpoint de registro de usuarios; la implementación actual compara hashes SHA-256 de las contraseñas.

### Endpoints de autenticación

| Método | Ruta | Autenticación | Resultado |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | Cuerpo con `email` y `password` | 200; access token y refresh token. |
| POST | `/api/v1/auth/refresh` | Cuerpo con `token` (refresh token) | 200; nuevos tokens. |
| GET | `/api/v1/auth/me` | Bearer access token | 200; datos del usuario autenticado. |
| GET | `/api/v1/auth/sessions` | Bearer access token | 200; sesiones del usuario. |
| DELETE | `/api/v1/auth/sessions/:sessionId` | Bearer access token | 204; revoca la sesión indicada y su refresh token. |
| POST | `/api/v1/auth/logout` | Bearer access token | 204; cierra la sesión actual. |
| POST | `/api/v1/auth/logout-all` | Bearer access token | 204; cierra todas las sesiones del usuario. |

Ejemplo de cuerpo para `POST /api/v1/auth/login` con los datos iniciales locales:

```json
{
  "email": "admin@base.com",
  "password": "password123"
}
```

La respuesta incluye `data.accessToken` y `data.refreshToken`, además de `statusCode`, `logId` y `message`. Envía `Authorization: Bearer <accessToken>` en las rutas protegidas. Para renovar, envía `{ "token": "<refreshToken>" }` a `/api/v1/auth/refresh`.

## Endpoints operativos

| Método | Ruta            | Comportamiento                                                                                                                 |
| ------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/health/live`  | Comprueba que la aplicación responde, sin consultar dependencias externas.                                                     |
| GET    | `/health/ready` | En Log4js no consulta servicios externos. En Loki comprueba `${LOKI_URL}/ready` con timeout de 3000 ms; devuelve 503 si falla. |
| GET    | `/metrics`      | Devuelve métricas en texto compatible con Prometheus; responde 500 si falla su obtención.                                      |
| GET    | `/swagger`      | Interfaz de documentación de la API.                                                                                           |

Los endpoints operativos no aplican guards de autenticación. Las rutas protegidas de `auth-db` aplican `JwtAuthGuard`; Swagger permite introducir el access token mediante su esquema Bearer.

Los endpoints de salud omiten el cuerpo de respuesta en los logs, conservando ruta, estado y duración.

## Métricas Prometheus

[`MetricsService`](src/modules/metrics/metrics.service.ts) utiliza un registro propio de `@prometheus-io/client` y recolecta las métricas predeterminadas del proceso. El middleware añade:

| Métrica                               | Tipo       | Contenido                                |
| ------------------------------------- | ---------- | ---------------------------------------- |
| `<app>_http_requests_total`           | Contador   | Total de solicitudes registradas.        |
| `<app>_http_request_duration_seconds` | Histograma | Duración de las solicitudes en segundos. |

El prefijo `<app>` corresponde a `APP_NAME` adaptado a un nombre de métrica válido. Las etiquetas son `environment`, `method`, `route` y `status_code`.

- La ruta utiliza el patrón del router, por ejemplo `/users/:id`; si no está disponible, registra `unmatched`.
- Las solicitudes abortadas se registran con `status_code="aborted"`.
- Cada solicitud se registra una sola vez, aunque se reciban eventos de finalización y cierre.
- `GET /metrics` está excluido del middleware para que las consultas de Prometheus no incrementen sus propias métricas HTTP.

Configura tu instancia de Prometheus para consultar `/metrics` en el host y puerto de la aplicación. El repositorio no incluye un despliegue de Prometheus.

## Logging

**Log4js:** escribe en consola y en archivos con base `${LOG_DIR}/${APP_NAME}`, rotación por fecha, tamaño máximo configurado de 2 MiB y 30 respaldos.

**Loki:** filtra por `LOG_LEVEL` y envía cada mensaje a `/loki/api/v1/push`, con etiquetas `app`, `environment` y `level`, y timeout de 5000 ms. Al terminar cada envío escribe en consola `[loki ON]` o `[loki OFF]`. No implementa cola, agrupación ni reintentos; el cierre de la aplicación no espera explícitamente estos envíos.

El interceptor serializa el cuerpo de respuesta cuando `req.logData` está activo. Los identificadores generados tienen ocho dígitos y sirven para correlacionar logs, sin garantía de unicidad.

## Comandos

| Comando                                                                   | Función                                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `pnpm start:dev`                                                          | Iniciar en desarrollo con recompilación automática.           |
| `pnpm start:debug`                                                        | Iniciar con depurador y recompilación automática.             |
| `pnpm build`                                                              | Compilar el código a `dist`.                                  |
| `pnpm start:prod`                                                         | Ejecutar la compilación existente.                            |
| `pnpm test`                                                               | Ejecutar las pruebas unitarias.                               |
| `pnpm test:watch`                                                         | Ejecutar pruebas en modo observación.                         |
| `pnpm test:cov`                                                           | Ejecutar pruebas y generar cobertura.                         |
| `pnpm exec tsc --project tsconfig.spec.json --noEmit --incremental false` | Verificar tipos, incluidas las pruebas, sin generar archivos. |
| `pnpm lint`                                                               | Ejecutar ESLint con correcciones automáticas.                 |
| `pnpm format`                                                             | Aplicar Prettier al código y las pruebas.                     |

Puedes agregar `--runInBand` a los comandos de Jest para ejecutar las suites en un único proceso.

El script `test:e2e` apunta a `test/jest-e2e.json`, que no existe actualmente. El manifiesto incluye `prepare: husky`, pero no hay hooks de proyecto en `.husky` en el árbol actual.

## Ejecución en producción

Configura las variables del entorno de destino, incluido `ENVIRONMENT=PROD`, y ejecuta:

```bash
pnpm build
pnpm start:prod
```

Configura la conexión PostgreSQL y los secretos JWT del entorno de destino. Si seleccionas Loki, proporciona su URL y disponibilidad.

### Docker

El [Dockerfile](Dockerfile) compila en una etapa separada y ejecuta la aplicación con Node.js 26 como usuario `node`, con dependencias de producción. Utiliza pnpm 12.15.0 y el lockfile existente. No incorpora archivos `.env` a la imagen.

```bash
docker build -t base-nestjs-backend:local .
docker run --rm --name base-nestjs-backend --env-file .env -p 3210:3210 base-nestjs-backend:local
```

La imagen usa por defecto `PORT=3210`, `ENVIRONMENT=PROD`, `LOG_MODE=log4js`, `LOG_LEVEL=INFO` y `LOG_DIR=/app/logs`. Comprueba `/health/live` para determinar su estado de salud. Puedes sobrescribir variables con `-e` o `--env-file .env`; si cambias `PORT`, ajusta también el puerto interno de `-p`.

El archivo de entorno debe incluir las variables de PostgreSQL y JWT. Configura `AUTH_DATABASE_HOST` con una dirección accesible desde el contenedor. Para conservar los archivos de log, añade `--mount source=backend-logs,target=/app/logs` a `docker run`. Si utilizas Loki, configura también una URL accesible desde el contenedor: `127.0.0.1` identifica al propio contenedor. No se incluye Docker Compose.

## Pruebas y cobertura

Las pruebas `*.spec.ts` están junto al código que verifican. Utilizan Jest, `ts-jest` y mocks para aislar servicios externos: no requieren Loki, bases de datos ni un servidor HTTP real.

Verifican configuración, controladores, métricas, middleware, interceptor, loggers, utilidades, errores, selección de providers, arranque y cierre. Swagger y Terminus se simulan en las suites correspondientes; las pruebas no verifican su integración real.

En `auth-db` se verifican casos de uso, guards, estrategia JWT, DTO, repositorios, entidades, migraciones y tareas programadas mediante mocks, sin ejecutar migraciones contra PostgreSQL.

Última ejecución verificada el **18 de noviembre de 2026**, con `pnpm.cmd test --runInBand`: **457 pruebas exitosas en 62 suites, sin fallos**. Esa ejecución no generó un informe de cobertura.

Para ejecutar únicamente las pruebas del módulo:

```bash
pnpm test --runInBand --testPathPatterns="src/modules/auth-db/"
```

Jest exige un mínimo global del **80 %** en las cuatro métricas. La cobertura considera `src/**/*.ts` y excluye declaraciones `.d.ts` y enums `.enum.ts`. El informe HTML se genera en `coverage/lcov-report/index.html`.

El [informe de resultados](docs/unit-test-results.md) incluye el inventario de archivos, las ramas defensivas pendientes, los problemas encontrados y las recomendaciones.

## Estructura

```text
src/
├── @types/express/       # Extensiones de tipos de Express
├── modules/
│   ├── auth-db/
│   │   ├── application/    # Casos de uso y DTO de aplicación
│   │   ├── domain/         # Modelos e interfaces de repositorio
│   │   ├── infrastructure/ # TypeORM, migraciones, guards y estrategia JWT
│   │   ├── jobs/           # Limpieza de sesiones y refresh tokens
│   │   ├── presentation/   # Controladores HTTP y DTO de entrada/salida
│   │   ├── auth-db.config.ts
│   │   └── auth-db.module.ts
│   ├── health/             # Comprobaciones de vida y disponibilidad
│   ├── metrics/            # Servicio, controlador y middleware de métricas
│   └── shared/             # Controladores, DTO, errores, logs y utilidades
├── app.config.ts         # Configuración y esquema Joi
├── app.config.module.ts  # Carga y validación del entorno
├── app.module.ts         # Composición de módulos
└── main.ts               # Arranque y cierre
```

La [documentación técnica](docs/base.md), el [informe de pruebas](docs/unit-test-results.md) y la [auditoría](docs/unit-test-audit.md) contienen información de revisiones anteriores. Sus rutas, cifras y alcance pueden diferir de la integración actual de `auth-db` documentada en este README.
