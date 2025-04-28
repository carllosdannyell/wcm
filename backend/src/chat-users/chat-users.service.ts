// src/chat-users/chat-users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatUser } from './entities/chat-user.entity';
import { CreateChatUserDto } from './dto/create-chat-user.dto';
import { UpdateChatUserDto } from './dto/update-chat-user.dto';

@Injectable()
export class ChatUsersService {
  constructor(
    @InjectRepository(ChatUser)
    private readonly chatUsersRepository: Repository<ChatUser>,
  ) {}

  async create(createChatUserDto: CreateChatUserDto): Promise<ChatUser> {
    const cu = this.chatUsersRepository.create(createChatUserDto);
    return await this.chatUsersRepository.save(cu);
  }

  async findAll(): Promise<ChatUser[]> {
    return await this.chatUsersRepository.find({ relations: ['chat', 'user'] });
  }

  async findOne(chatId: number, userId: number): Promise<ChatUser> {
    const chatUser = await this.chatUsersRepository.findOne({
      where: { chatId, userId },
      relations: ['chat', 'user'],
    });

    if (!chatUser) {
      throw new Error('chatUser não encontrado');
    }

    return chatUser;
  }

  async update(
    chatId: number,
    userId: number,
    updateChatUserDto: UpdateChatUserDto,
  ): Promise<ChatUser> {
    await this.chatUsersRepository.update(
      { chatId, userId },
      updateChatUserDto,
    );
    return this.findOne(chatId, userId);
  }

  async remove(chatId: number, userId: number): Promise<void> {
    await this.chatUsersRepository.delete({ chatId, userId });
  }
}
