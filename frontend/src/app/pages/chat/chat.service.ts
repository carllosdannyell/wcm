import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
