import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Chat {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatUser {
  chatId: number;
  userId: number;
  joinedAt: string;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  sentAt: string;
  isRead: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /** 1) Lista todos os usuários */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  /** 2) Cria um chat vazio */
  createChat(): Observable<Chat> {
    return this.http.post<Chat>(`${this.apiUrl}/chats`, {});
  }

  /** 3) Associa usuário ao chat */
  addChatUser(chatId: number, userId: number): Observable<ChatUser> {
    return this.http.post<ChatUser>(`${this.apiUrl}/chat-users`, {
      chatId,
      userId,
    });
  }

  /** 4) Retorna todos os ChatUser de um usuário */
  private getChatUsersForUser(userId: number): Observable<ChatUser[]> {
    return this.http
      .get<ChatUser[]>(`${this.apiUrl}/chat-users`)
      .pipe(map((list) => list.filter((cu) => cu.userId === userId)));
  }

  /** 5) Checa se já existe chat 1-a-1 entre dois usuários */
  private checkChatExists(a: number, b: number): Observable<Chat | null> {
    return forkJoin([
      this.getChatUsersForUser(a),
      this.getChatUsersForUser(b),
    ]).pipe(
      map(
        ([la, lb]) =>
          la
            .map((cu) => cu.chatId)
            .find((id) => lb.some((cu) => cu.chatId === id)) ?? null
      ),
      switchMap((chatId) =>
        chatId
          ? this.http.get<Chat>(`${this.apiUrl}/chats/${chatId}`)
          : of(null)
      )
    );
  }

  /** 6) Pega o chat existente ou cria um novo (e associa ambos) */
  getOrCreateChat(a: number, b: number): Observable<Chat> {
    return this.checkChatExists(a, b).pipe(
      switchMap((chat) => {
        if (chat) return of(chat);
        return this.createChat().pipe(
          switchMap((newChat) =>
            forkJoin([
              of(newChat),
              this.addChatUser(newChat.id, a),
              this.addChatUser(newChat.id, b),
            ]).pipe(map(([c]) => c))
          )
        );
      })
    );
  }

  /** 7) Busca mensagens de um chat */
  getMessages(chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages?chatId=${chatId}`);
  }

  /** 8) Envia uma nova mensagem */
  sendMessage(
    chatId: number,
    senderId: number,
    content: string
  ): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages`, {
      chatId,
      senderId,
      content,
    });
  }
}
