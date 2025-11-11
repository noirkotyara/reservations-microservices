import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingService } from './users/hashing.service';
import { UsersService } from './users/users.service';
import { UserDocument } from './users/models/users.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response as ExpressResponse } from 'express';
import { TokenPayload } from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async verifyUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);

    const isPasswordValid = await this.hashingService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: UserDocument, res: ExpressResponse) {
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
    };

    const expiresIn = new Date();
    const expiration = this.configService.get<number>('JWT_EXPIRATION_S') ?? 0;
    expiresIn.setSeconds(expiresIn.getSeconds() + expiration);

    const token = await this.jwtService.signAsync(tokenPayload);

    res.cookie('Authentication', token, { httpOnly: true, expires: expiresIn });

    return user;
  }
}
