import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatDetailService, Message } from './chat-detail.service';
import { jwtDecode } from 'jwt-decode';
import { User } from '../chat/chat.service';
import { io, Socket } from 'socket.io-client';

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
export class ChatDetailComponent implements OnInit, OnDestroy {
  socket!: Socket;
  users: User[] = [];
  messages: Message[] = [];
  chatPartner?: User;
  newMessage = '';
  currentUserId = 0;
  chatId!: number;

  constructor(
    private route: ActivatedRoute,
    private chatDetailService: ChatDetailService
  ) {}

  ngOnInit() {
    this.currentUserId = this.getCurrentUserId();
    if (!this.currentUserId) {
      console.error('Usuário não autenticado');
      return;
    }

    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    

    this.chatId = +this.route.snapshot.paramMap.get('id')!;
    this.loadUsers();
    this.loadMessages();

    this.socket.on('new-message', (message) => {
      this.messages.push(message)
    })
  }

  loadUsers() {
    this.chatDetailService.getUsers().subscribe({
      next: (list) => {
        this.chatPartner = list.filter((u) => u.id !== this.currentUserId)[0];
      },
      error: (err) => console.error('Erro ao buscar usuários:', err),
    });
  }

  loadMessages() {
    this.chatDetailService.getMessages(this.chatId).subscribe((data) => {
      this.messages = data;
    });
  }

  sendMessage() {
    const content = this.newMessage.trim();
    if (!content) return;
    this.chatDetailService
      .sendMessage(this.chatId, this.currentUserId, content)
      .subscribe((msg) => {
        this.loadMessages();
        this.newMessage = '';
        this.socket.emit('new-message', msg);
      });

    console.log(this.chatPartner);
    console.log(this.messages);
  }

  ngOnDestroy(): void {
    console.log('aslçkcmask');
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
      this.chatPartner = this.users.find((u) => u.id === otherIds[0]);
    } else {
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
