import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientsGateway } from '../gateway/patient.gateway'; //

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly patientsGateway: PatientsGateway,
  ) {}

  create(createPatientDto: CreatePatientDto) {
    const patient = this.patientRepository.create(createPatientDto);
    return this.patientRepository.save(patient);
  }

  findAll() {
    return this.patientRepository.find();
  }

  async findOne(id: number) {
    const patient = await this.patientRepository.findOneBy({ id });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async update(id: number, updatePatientDto: UpdatePatientDto) {
    const patient = await this.findOne(id);
    Object.assign(patient, updatePatientDto);
    return this.patientRepository.save(patient);
  }

  async remove(id: number) {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);

    this.patientsGateway.server.emit('patient-deleted', { id });

    return { message: `Paciente com ID ${id} foi removido.` };
  }
}
