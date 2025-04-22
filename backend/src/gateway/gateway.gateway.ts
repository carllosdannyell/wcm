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
export class PatientsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('PatientsGateway');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('lock-field')
  handleLockField(@MessageBody() data: { field: string; user: string }) {
    this.logger.log(`Lock field: ${data.field} by ${data.user}`);
    this.server.emit('field-locked', data);
  }

  @SubscribeMessage('unlock-field')
  handleUnlockField(@MessageBody() data: { field: string }) {
    this.logger.log(`Unlock field: ${data.field}`);
    this.server.emit('field-unlocked', data);
  }

  @SubscribeMessage('update-field')
  handleUpdateField(
    @MessageBody() data: { field: string; value: string; user: string },
  ) {
    this.server.emit('field-updated', data);
  }
}
