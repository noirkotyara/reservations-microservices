import { Controller, Res, UseGuards, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { Response as ExpressResponse } from 'express';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { UserDocument } from './users/models/users.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: UserDocument,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const userPayload = await this.authService.login(user, res);

    res.send(userPayload);
  }

  // @UseGuards(LocalAuthGuard)
  // @Post('auth/logout')
  // async logout(@Req() req) {
  //   return req.logout();
  // }
}
