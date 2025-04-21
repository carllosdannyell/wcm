import { Module } from '@nestjs/common';
import { PatientsGateway } from './gateway.gateway';

@Module({
  providers: [PatientsGateway],
})
export class GatewayModule {}
