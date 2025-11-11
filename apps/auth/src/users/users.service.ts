import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { UserDocument } from './models/users.schema';
import { HashingService } from './hashing.service';
import { GetUserDto } from './dto/get-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const hashedPassword = await this.hashingService.hash(
      createUserDto.password,
    );

    return this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      createdAt: new Date(),
    });
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.usersRepository.findOne({ email });
  }

  async getUser(getUserDto: GetUserDto): Promise<UserDocument> {
    return this.usersRepository.findOneById(getUserDto.id);
  }
}
