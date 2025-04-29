/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('PatientsGateway');

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`messagegateway:)`);
  }

  @SubscribeMessage('messagegateway')
  handleUnlockField(
    @MessageBody()
    data: {
      field: string;
      user: string;
      context: 'create' | 'edit';
    },
  ) {
    this.logger.log(
      `messagegateway: ${data.field} (${data.context}) by ${data.user}`,
    );
    this.server.emit('', data);
  }

  @SubscribeMessage('update-field')
  handleUpdateField(
    @MessageBody()
    data: {
      field: string;
      value: string;
      user: string;
      context: 'create' | 'edit';
    },
  ) {
    this.logger.log(
      `Field updated: ${data.field} (${data.context}) to "${data.value}" by ${data.user}`,
    );
    this.server.emit('send-message', data);
  }

  @SubscribeMessage('new-message')
  handleMessageCreated(@MessageBody() data: any) {
    this.logger.log(`Message created: ${JSON.stringify(data)}`);
    this.server.emit('new-message', data);
  }
}
