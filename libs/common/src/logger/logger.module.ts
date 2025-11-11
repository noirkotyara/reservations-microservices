import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';

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
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
          validationSchema: Joi.object({
            NODE_ENV: Joi.string().required(),
          }),
        }),
      ],
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
