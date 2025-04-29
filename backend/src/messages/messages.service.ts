import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, IsNull, Not, Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageGateway } from 'src/gateway/message.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly messageGateway: MessageGateway,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const msg = this.messagesRepository.create(createMessageDto);
    const saved = await this.messagesRepository.save(msg);
    return saved;
  }

  async findAll(chatId?: number): Promise<Message[]> {
    const options: FindManyOptions<Message> = {
      relations: ['chat', 'sender'],
      order: { sentAt: 'ASC' },
    };

    if (chatId !== undefined) {
      options.where = { chat: { id: chatId } };
    }

    if (chatId === undefined) {
      options.where = { chat: { id: Not(IsNull()) } };
    }

    return this.messagesRepository.find(options);
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id },
      relations: ['chat', 'sender'],
    });

    if (!message) {
      throw new Error('message não encontrada');
    }

    return message;
  }

  async update(
    id: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    await this.messagesRepository.update(id, updateMessageDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.messagesRepository.delete(id);
    this.messageGateway.server.emit('message-deleted', { id });
  }
}
