// src/app/chat/chat.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode'; // <— importa a lib
import { ChatService, User } from './chat.service';

interface JwtPayload {
  userId: number;
  // você pode adicionar outros campos do token, se precisar
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  users: User[] = [];
  loading = false;
  currentUserId = 0;

  constructor(private chatService: ChatService, private router: Router) {}

  ngOnInit(): void {
    this.currentUserId = this.getCurrentUserId();
    console.log('currentUserId:', this.currentUserId);

    if (!this.currentUserId) {
      console.error('Não foi possível determinar o usuário atual!');
      return;
    }

    this.chatService.getUsers().subscribe({
      next: (list) => {
        this.users = list.filter((u) => u.id !== this.currentUserId);
      },
      error: (err) => console.error('Erro ao buscar usuários:', err),
    });
  }

  startConversation(user: User): void {
    this.loading = true;
    this.chatService.getOrCreateChat(this.currentUserId, user.id).subscribe({
      next: (chat) => {
        this.loading = false;
        this.router.navigate(['dashboard/chat', chat.id]);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erro ao iniciar conversa:', err);
      },
    });
  }

  /**
   * Decodifica o JWT do localStorage usando jwt-decode e retorna o userId.
   * Em caso de falha, retorna 0.
   */
  private getCurrentUserId(): number {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      console.error('access_token não encontrado');
      return 0;
    }

    try {
      const payload = jwtDecode<JwtPayload>(token);
      console.log(payload);
      
      return payload.userId || 0;
    } catch (e) {
      console.error('Falha ao decodificar JWT:', e);
      return 0;
    }
  }
}
