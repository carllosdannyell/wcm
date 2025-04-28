import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateChatUserDto } from './dto/create-chat-user.dto';
import { UpdateChatUserDto } from './dto/update-chat-user.dto';
import { ChatUsersService } from './chat-users.service';

@Controller('chat-users')
export class ChatUsersController {
  constructor(private readonly chatUsersService: ChatUsersService) {}

  @Post()
  create(@Body() createChatUserDto: CreateChatUserDto) {
    return this.chatUsersService.create(createChatUserDto);
  }

  @Get()
  findAll() {
    return this.chatUsersService.findAll();
  }

  @Get('chats/:chatId/users/:userId')
  findOne(@Param('chatId') chatId: string, @Param('userId') userId: string) {
    return this.chatUsersService.findOne(+chatId, +userId);
  }

  @Patch('chats/:chatId/users/:userId')
  update(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
    @Body() updateChatUserDto: UpdateChatUserDto,
  ) {
    return this.chatUsersService.update(+chatId, +userId, updateChatUserDto);
  }

  @Delete('chats/:chatId/users/:userId')
  remove(@Param('chatId') chatId: string, @Param('userId') userId: string) {
    return this.chatUsersService.remove(+chatId, +userId);
  }
}
