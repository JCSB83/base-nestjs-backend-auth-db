import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './app.config.module';

jest.mock('@nestjs/config', () => ({
  ConfigModule: {
    forRoot: jest.fn().mockReturnValue(class MockConfigModule {}),
  },
  ConfigService: class {},
}));

describe('AppConfigModule', () => {
  const options = jest.mocked(ConfigModule).forRoot.mock.calls[0][0];
  const validate = options?.validate;
  const base = {
    PORT: '3000',
    ENVIRONMENT: 'QA',
    LOG_MODE: 'log4js',
    LOG_LEVEL: 'INFO',
    AUTH_DATABASE_HOST: 'localhost',
    AUTH_DATABASE_PORT: '5432',
    AUTH_DATABASE_USERNAME: 'user',
    AUTH_DATABASE_PASSWORD: 'secret',
    AUTH_DATABASE_NAME: 'auth',
    AUTH_DATABASE_SYNCRONIZE: 'false',
    AUTH_DATABASE_LOGGING: 'false',
    AUTH_DATABASE_MIGRATIONSRUN: 'true',
    AUTH_DATABASE_MAXEXECUTIONTIME: '1000',
    JWT_SECRET: 'secret',
    JWT_EXPIRESIN: '600',
    JWT_REFRESH_SECRET: 'refresh',
    JWT_REFRESH_EXPIRESIN: '3600',
  };

  afterEach(() => jest.restoreAllMocks());

  it('valida globalmente, convierte valores y conserva variables ajenas', () => {
    expect(options?.isGlobal).toBe(true);
    if (!validate) throw new Error('Missing validator');
    const result: unknown = validate({ ...base, EXTRA_VAR: 'preserved' });
    expect(result).toMatchObject({
      PORT: 3000,
      EXTRA_VAR: 'preserved',
      APP_NAME: 'base-nestjs-backend-auth-db',
    });
  });

  it('informa conjuntamente errores de configuración', () => {
    if (!validate) throw new Error('Missing validator');
    expect(() =>
      validate({ ...base, PORT: -1, ENVIRONMENT: 'invalid' }),
    ).toThrow(/Config validation error:.*PORT.*ENVIRONMENT/);
  });

  it('registra su inicialización', () => {
    jest.spyOn(Logger, 'log').mockImplementation(() => undefined);
    new AppConfigModule().onModuleInit();
    expect(jest.mocked(Logger).log).toHaveBeenCalledWith(
      'AppConfigModule initialized',
    );
  });
});
