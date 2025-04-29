import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService, Message } from './chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  templateUrl: './chat.detail.component.html',
  styleUrls: ['./chat.detail.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class ChatDetailComponent implements OnInit {
  chatId!: number;
  messages: Message[] = [];
  newMessage = '';

  // você pode tirar do seu AuthService mais tarde
  currentUserId = 1;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    // lê o parâmetro :id da rota
    this.chatId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMessages();
  }

  loadMessages() {
    this.chatService
      .getMessages(this.chatId)
      .subscribe((msgs) => (this.messages = msgs));
  }

  sendMessage() {
    const text = this.newMessage.trim();
    if (!text) return;

    this.chatService
      .sendMessage(this.chatId, this.currentUserId, text)
      .subscribe((msg) => {
        this.messages.push(msg);
        this.newMessage = '';
      });
  }
}
