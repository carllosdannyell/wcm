// src/app/chat/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  // ... getUsers(), createChat(), addChatUser() já existentes

  /** Busca todas as mensagens de um chat */
  getMessages(chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages?chatId=${chatId}`);
  }

  /** Envia uma mensagem num chat */
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
