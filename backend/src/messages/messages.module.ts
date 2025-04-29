// src/messages/messages.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { Chat } from '../chats/entities/chat.entity';
import { User } from '../users/entities/user.entity';
import { MessageGateway } from 'src/gateway/message.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Chat, User])],
  controllers: [MessagesController],
  providers: [MessagesService, MessageGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
