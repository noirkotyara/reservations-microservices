import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '@nestjs/config';

const PINO_CONFIG = {
  production: {
    level: 'error',
    transport: undefined,
  },
  development: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: { singleLine: true, colorize: true },
    },
  },
};

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const configSettings =
          PINO_CONFIG[
            configService.get('NODE_ENV') as keyof typeof PINO_CONFIG
          ] || PINO_CONFIG.development;
        return {
          pinoHttp: {
            level: configSettings.level,
            transport: configSettings.transport,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
