import { Module } from '@nestjs/common';
import { PatientsGateway } from './patient.gateway';

@Module({
  providers: [PatientsGateway],
})
export class GatewayModule {}
