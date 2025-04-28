// src/chats/chats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatsRepository: Repository<Chat>,
  ) {}

  async create(createChatDto: CreateChatDto): Promise<Chat> {
    const chat = this.chatsRepository.create(createChatDto);
    return await this.chatsRepository.save(chat);
  }

  async findAll(): Promise<Chat[]> {
    return await this.chatsRepository.find({
      relations: ['chatUsers', 'messages'],
    });
  }

  async findOne(id: number): Promise<Chat> {
    const chat = await this.chatsRepository.findOne({
      where: { id },
      relations: ['chatUsers', 'messages'],
    });

    if (!chat) {
      throw new Error('Chat não encontrado');
    }

    return chat;
  }

  async update(id: number, updateChatDto: UpdateChatDto): Promise<Chat> {
    await this.chatsRepository.update(id, updateChatDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.chatsRepository.delete(id);
  }
}
