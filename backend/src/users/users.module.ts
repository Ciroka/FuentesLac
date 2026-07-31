import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controller/users.controller';
import { UsersService } from './service/users.service';
import { User } from './entities/user.entity';
import { USERS_REPOSITORY } from './repository/users.repository.interface';
import { UserRepository } from './repository/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
