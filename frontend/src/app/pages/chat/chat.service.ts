import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  sentAt: string;
  isRead: boolean;
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

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'http://localhost:3000'; // ajuste para seu backend

  constructor(private http: HttpClient) {}

  // 1) Lista de usuários
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  // 2) Cria um chat "em branco"
  createChat(): Observable<Chat> {
    return this.http.post<Chat>(`${this.apiUrl}/chats`, {});
  }

  // 3) Associa um usuário a um chat
  addChatUser(chatId: number, userId: number): Observable<ChatUser> {
    return this.http.post<ChatUser>(`${this.apiUrl}/chat-users`, {
      chatId,
      userId,
    });
  }

  /** Busca todos os chat-users e filtra pelos que pertençam ao userId */
  getChatUsersForUser(userId: number): Observable<ChatUser[]> {
    return this.http
      .get<ChatUser[]>(`${this.apiUrl}/chat-users`)
      .pipe(map((list) => list.filter((cu) => cu.userId === userId)));
  }

  chatUserExists(chatId: number, userId: number): Observable<boolean> {
    return this.http
      .get<ChatUser>(`${this.apiUrl}/chat-users/chats/${chatId}/users/${userId}`)
      .pipe(
        map(() => true),
        // se o 404 vier, retorna false em vez de erro
        // (você pode capturar com catchError, mas este é um exemplo simples)
      );
  }

  // checa se já existe chat compartilhado entre dois usuários
  checkChatExists(userA: number, userB: number): Observable<Chat | null> {
    return forkJoin([
      this.getChatUsersForUser(userA),
      this.getChatUsersForUser(userB),
    ]).pipe(
      map(([listA, listB]) => {
        const idsA = listA.map((cu) => cu.chatId);
        const idsB = listB.map((cu) => cu.chatId);
        return idsA.find((id) => idsB.includes(id)) ?? null;
      }),
      switchMap((chatId) => {
        if (chatId) {
          return this.http.get<Chat>(`${this.apiUrl}/chats/${chatId}`);
        }
        return of(null);
      })
    );
  }

  /**
   * ou cria um novo chat+vínculos, ou retorna o existente
   */
  getOrCreateChat(userA: number, userB: number): Observable<Chat> {
    return this.checkChatExists(userA, userB).pipe(
      switchMap((chat) => {
        if (chat) {
          return of(chat);
        }
        return this.createChat().pipe(
          switchMap((newChat) =>
            forkJoin([
              of(newChat),
              this.addChatUser(newChat.id, userA),
              this.addChatUser(newChat.id, userB),
            ]).pipe(map(([c]) => c))
          )
        );
      })
    );
  }

  getMessages(chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages?chatId=${chatId}`);
  }

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
