import { Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  login(@Param() login: string, @Param() password: string): string {
    return `logged in as ${login} ${password}`;
  }

  @Post('register')
  register(): boolean {
    return true;
  }
}
