// src/chat-users/chat-users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatUsersService } from './chat-users.service';
import { ChatUsersController } from './chatUsers.controller';
import { ChatUser } from './entities/chat-user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatUser, Chat, User])],
  controllers: [ChatUsersController],
  providers: [ChatUsersService],
  exports: [ChatUsersService],
})
export class ChatUsersModule {}
