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
    this.chatService
      .getOrCreateChat(this.currentUserId, user.id)
      .subscribe((chat) => {
        // se já existia, retorna o existente; senão, cria
        this.router.navigate(['dashboard/chat', chat.id]);
      });
  }
}
