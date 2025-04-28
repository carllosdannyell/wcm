import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  @IsNotEmpty()
  chatId: number;

  @IsInt()
  @IsNotEmpty()
  senderId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
