import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { DatabaseModule, LoggerModule } from '@app/common';
import {
  ReservationDocument,
  ReservationSchema,
} from './models/reservation.schema';
import { ReservationsRepository } from './reservations.repository';
import Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/reservations/.env',
      validationSchema: Joi.object({
        RESERVATIONS_PORT: Joi.number().required(),
        NODE_ENV: Joi.string().required(),
        MONGODB_URI: Joi.string().required(),
      }),
    }),
    LoggerModule,
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: ReservationDocument.name, schema: ReservationSchema },
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository],
})
export class ReservationsModule {}
