import { Module } from '@nestjs/common';
import { PatientsGateway } from './patient.gateway';
import { MessageGateway } from './message.gateway';

@Module({
  providers: [PatientsGateway, MessageGateway],
})
export class GatewayModule {}
