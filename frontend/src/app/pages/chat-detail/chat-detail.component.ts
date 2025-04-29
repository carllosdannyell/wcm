import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Message } from './chat-detail.service';
import { jwtDecode } from 'jwt-decode';
import { User } from '../chat/chat.service';

interface JwtPayload {
  userId: number;
}

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.css'],
})
export class ChatDetailComponent implements OnInit {
  users: User[] = [];
  messages: Message[] = [];
  chatPartner?: User;
  newMessage = '';
  currentUserId = 0;
  chatId!: number;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.currentUserId = this.getCurrentUserId();
    if (!this.currentUserId) {
      console.error('Usuário não autenticado');
      return;
    }

    this.chatId = +this.route.snapshot.paramMap.get('id')!;

    this.chatService.getUsers().subscribe({
      next: (list) => {
        this.chatPartner = list.filter((u) => u.id !== this.currentUserId)[0];
      },
      error: (err) => console.error('Erro ao buscar usuários:', err),
    });

    this.chatService.getMessages(this.chatId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.identifyPartner();
      },
      error: (err) => console.error('Erro ao buscar mensagens:', err),
    });
  }

  sendMessage() {
    const content = this.newMessage.trim();
    if (!content) return;
    this.chatService
      .sendMessage(this.chatId, this.currentUserId, content)
      .subscribe((msg) => {
        this.messages.push(msg);
        this.newMessage = '';
      });

    console.log(this.chatPartner);
    console.log(this.messages);
  }

  private identifyPartner() {
    if (!this.users.length || !this.messages.length) return;

    const otherIds = Array.from(
      new Set(
        this.messages
          .map((m) => m.sender.id)
          .filter((id) => id !== this.currentUserId)
      )
    );

    if (otherIds.length === 1) {
      // usuário único no chat: definimos o interlocutor
      this.chatPartner = this.users.find((u) => u.id === otherIds[0]);
    } else {
      // fallback: sem outro, usamos o próprio usuário atual
      this.chatPartner = this.users.find((u) => u.id === this.currentUserId);
    }
  }

  private getCurrentUserId(): number {
    const token = sessionStorage.getItem('access_token');
    if (!token) return 0;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      return payload.userId || 0;
    } catch {
      return 0;
    }
  }
}
