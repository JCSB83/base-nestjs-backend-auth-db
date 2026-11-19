import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { AppConfigModule } from './app.config.module';
import { SharedModule } from './modules/shared/shared.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { HealthModule } from './modules/health/health.module';
import { AuthDbModule } from './modules/auth-db/auth-db.module';

@Module({
  imports: [
    AppConfigModule,
    HealthModule,
    MetricsModule,
    SharedModule,
    AuthDbModule
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    Logger.log('AppModule initialized');
  }
}
