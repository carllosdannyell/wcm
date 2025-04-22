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
  private fieldLocks: Map<string, string> = new Map();

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
    if (!this.fieldLocks.has(data.field)) {
      this.fieldLocks.set(data.field, data.user);
      this.logger.log(`Field locked: ${data.field} by ${data.user}`);
      this.server.emit('field-locked', data);
    }
  }

  @SubscribeMessage('unlock-field')
  handleUnlockField(@MessageBody() data: { field: string; user: string }) {
    const locker = this.fieldLocks.get(data.field);
    if (locker === data.user) {
      this.fieldLocks.delete(data.field);
      this.logger.log(`Field unlocked: ${data.field} by ${data.user}`);
      this.server.emit('field-unlocked', data);
    }
  }

  // @SubscribeMessage('patient-deleted')
  // handleRemove(@MessageBody() data: { id: string }) {
  //   this.server.emit('patient-deleted', data);
  // }

  @SubscribeMessage('update-patient')
  handleUpdateField(
    @MessageBody() data: { field: string; value: string; user: string },
  ) {
    this.server.emit('patient-updated', data);
  }
}
