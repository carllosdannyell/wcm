/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  private fieldLocks: Map<string, Map<string, string>> = new Map([
    ['name', new Map()],
    ['email', new Map()],
    ['phone', new Map()],
    ['address', new Map()],
  ]);

  private logger: Logger = new Logger('PatientsGateway');

  private editingUsers: Map<string, Set<string>> = new Map();

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // limpa este usuário de todos os sets
    this.editingUsers.forEach((set, patientId) => {
      if (set.delete(client.id)) {
        this.emitCount(patientId);
      }
      if (set.size === 0) {
        this.editingUsers.delete(patientId);
      }
    });
    this.logger.log(`Client disconnected ${client.id}`);
  }

  private emitCount(patientId: string) {
    const set = this.editingUsers.get(patientId) || new Set();
    this.server.emit('editing-count', {
      patientId,
      count: set.size,
      users: Array.from(set),
    });
  }

  @SubscribeMessage('start-editing')
  handleStartEditing(@MessageBody() data: { patientId: string; user: string }) {
    let set = this.editingUsers.get(data.patientId);
    if (!set) {
      set = new Set();
      this.editingUsers.set(data.patientId, set);
    }
    set.add(data.user);
    this.emitCount(data.patientId);
    this.logger.log(`${data.user} started editing ${data.patientId}`);
  }

  @SubscribeMessage('stop-editing')
  handleStopEditing(@MessageBody() data: { patientId: string; user: string }) {
    const set = this.editingUsers.get(data.patientId);
    if (set && set.delete(data.user)) {
      this.emitCount(data.patientId);
      if (set.size === 0) this.editingUsers.delete(data.patientId);
      this.logger.log(`${data.user} stopped editing ${data.patientId}`);
    }
  }

  @SubscribeMessage('lock-field')
  handleLockField(
    @MessageBody()
    data: {
      field: string;
      user: string;
      context: 'create' | 'edit';
    },
  ) {
    const contextMap = this.fieldLocks.get(data.field);
    if (contextMap && !contextMap.has(data.context)) {
      contextMap.set(data.context, data.user);
      this.logger.log(
        `Field locked: ${data.field} (${data.context}) by ${data.user}`,
      );
      this.server.emit('field-locked', data);
    }
  }

  @SubscribeMessage('unlock-field')
  handleUnlockField(
    @MessageBody()
    data: {
      field: string;
      user: string;
      context: 'create' | 'edit';
    },
  ) {
    const contextMap = this.fieldLocks.get(data.field);
    if (contextMap && contextMap.get(data.context) === data.user) {
      contextMap.delete(data.context);
      this.logger.log(
        `Field unlocked: ${data.field} (${data.context}) by ${data.user}`,
      );
      this.server.emit('field-unlocked', data);
    }
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
    this.server.emit('field-updated', data);
  }

  @SubscribeMessage('patient-created')
  handlePatientCreated(@MessageBody() data: any) {
    this.logger.log(`Patient created: ${JSON.stringify(data)}`);
    this.server.emit('patient-created', data);
  }

  @SubscribeMessage('patient-updated')
  handlePatientUpdated(@MessageBody() data: any) {
    this.logger.log(`Patient updated: ${JSON.stringify(data)}`);
    this.server.emit('patient-updated', data);
  }

  @SubscribeMessage('patient-deleted')
  handlePatientDeleted(@MessageBody() data: { id: string }) {
    this.logger.log(`Patient deleted: ID ${data.id}`);
    this.server.emit('patient-deleted', data);
  }
}
