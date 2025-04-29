// src/app/chat/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Message {
  id: number;
  chat: {
    id: number;
  };
  sender: {
    id: number;
  };
  content: string;
  sentAt: string;
  isRead: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatDetailService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /** Busca todas as mensagens de um chat */
  getMessages(chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages?chatId=${chatId}`);
  }

  /** 1) Lista todos os usuários */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  /** Envia uma mensagem num chat */
  sendMessage(
    chatId: number,
    senderId: number,
    content: string
  ): Observable<Message> {
    // keys batem agora com CreateMessageDto no Nest
    return this.http.post<Message>(`${this.apiUrl}/messages`, {
      chat: chatId,
      sender: senderId,
      content,
    });
  }
}
