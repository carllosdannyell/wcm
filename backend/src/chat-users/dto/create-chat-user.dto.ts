import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateChatUserDto {
  @IsInt()
  @IsNotEmpty()
  chatId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;
}
