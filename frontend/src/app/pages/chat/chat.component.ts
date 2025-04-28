import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService, User, Chat, ChatUser } from './chat.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ChatComponent implements OnInit {
  users: User[] = [];
  loading = false;

  // TODO: obter do AuthService / token
  currentUserId = 1;

  constructor(private chatService: ChatService, private router: Router) {}

  ngOnInit(): void {
    this.chatService.getUsers().subscribe((list) => {
      // opcional: filtrar pra não mostrar o próprio currentUser
      this.users = list.filter((u) => u.id !== this.currentUserId);
    });
  }

  startConversation(user: User) {
    this.loading = true;

    // 1) Cria o chat
    this.chatService.createChat().subscribe({
      next: (chat: Chat) => {
        // 2) Adiciona currentUser
        this.chatService.addChatUser(chat.id, this.currentUserId).subscribe({
          next: () => {
            // 3) Adiciona o outro usuário
            this.chatService.addChatUser(chat.id, user.id).subscribe({
              next: () => {
                this.loading = false;
                // 4) Navega para a tela de chat, passando o ID do chat
                this.router.navigate(['/chat', chat.id]);
              },
              error: () => (this.loading = false),
            });
          },
          error: () => (this.loading = false),
        });
      },
      error: () => (this.loading = false),
    });
  }
}
