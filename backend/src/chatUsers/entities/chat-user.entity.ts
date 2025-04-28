import { Chat } from '../../chats/entities/chat.entity';
import { User } from '../../users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class ChatUser {
  @PrimaryColumn({ type: 'int' })
  chatId: number;

  @PrimaryColumn({ type: 'int' })
  userId: number;

  @ManyToOne(() => Chat, (chat) => chat.chatUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.chatUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  joinedAt: Date;
}
