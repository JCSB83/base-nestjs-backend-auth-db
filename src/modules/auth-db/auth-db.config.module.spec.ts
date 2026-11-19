import 'reflect-metadata';
import { AuthDbConfigModule } from './auth-db.config.module';
import { AuthDbConfig } from './auth-db.config';
describe('AuthConfigModule', () => {
  it('provee y exporta la configuracion de Auth', () => {
    expect(Reflect.getMetadata('providers', AuthDbConfigModule)).toEqual([
      AuthDbConfig,
    ]);
    expect(Reflect.getMetadata('exports', AuthDbConfigModule)).toEqual([
      AuthDbConfig,
    ]);
  });
});
