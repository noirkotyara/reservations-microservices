import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationDocument } from './models/reservation.schema';
import { ReservationsRepository } from './reservations.repository';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
  ): Promise<ReservationDocument> {
    const reservation = await this.reservationsRepository.create({
      ...createReservationDto,
      timestamp: new Date(),
      placeId: '123',
    });
    return reservation;
  }

  async findAll(): Promise<ReservationDocument[]> {
    return this.reservationsRepository.find({});
  }

  async findOne(id: string): Promise<ReservationDocument> {
    return this.reservationsRepository.findOneById(id);
  }

  async update(
    id: string,
    updateReservationDto: UpdateReservationDto,
  ): Promise<ReservationDocument> {
    return this.reservationsRepository.findOneAndUpdate(
      { _id: id },
      updateReservationDto,
    );
  }

  async remove(id: string): Promise<ReservationDocument> {
    return this.reservationsRepository.findOneAndDelete({ _id: id });
  }
}
