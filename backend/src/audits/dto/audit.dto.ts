import {
  IsString, IsNotEmpty, IsOptional, IsInt,
  IsArray, ValidateNested, IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AuditResponseDto {
  @IsInt() fieldId: number;
  @IsOptional() @IsString() value?: string;
  @IsOptional() @IsString() observation?: string;
  @IsOptional() @IsString() conformityResult?: string;
}

export class CreateAuditDto {
  @IsString() @IsNotEmpty() auditDate: string;        // YYYY-MM-DD
  @IsInt() formTemplateId: number;
  @IsInt() auditorId: number;
  @IsOptional() @IsInt() unidadEjecutoraId?: number;
  @IsOptional() @IsString() historiaClinicaNum?: string;
  @IsOptional() @IsString() patientHash?: string;
  @IsOptional() @IsString() diagnosisCie10?: string;
  @IsOptional() @IsString() diagnosisDescription?: string;
  @IsOptional() @IsString() generalObservations?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuditResponseDto)
  responses?: AuditResponseDto[];
}

export class CloseAuditDto {
  @IsOptional() @IsString() generalObservations?: string;
  @IsOptional() @IsString() auditorSignature?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuditResponseDto)
  responses?: AuditResponseDto[];
}
