import {
  IsString, IsNotEmpty, IsOptional, IsBoolean,
  IsNumber, IsInt, IsArray, ValidateNested, IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FieldOptionDto {
  @IsString() @IsNotEmpty() label: string;
  @IsString() @IsNotEmpty() value: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class FormFieldDto {
  @IsString() @IsNotEmpty() label: string;
  @IsString() @IsNotEmpty() fieldKey: string;

  @IsIn(['YES_NO', 'YES_NO_NA', 'TEXT', 'SCALE', 'NUMBER', 'DATE', 'SINGLE_SELECT', 'MULTI_SELECT', 'SIGNATURE', 'FILE'])
  fieldType: string;

  @IsOptional() @IsBoolean() required?: boolean;
  @IsOptional() @IsBoolean() hasObservation?: boolean;
  @IsOptional() @IsNumber() score?: number;
  @IsOptional() @IsInt() sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldOptionDto)
  options?: FieldOptionDto[];
}

export class FormSectionDto {
  @IsString() @IsNotEmpty() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() orderIndex?: number;
  @IsOptional() @IsNumber() weight?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields?: FormFieldDto[];
}

export class CreateFormDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() version?: string;
  @IsOptional() @IsString() formType?: string;
  @IsOptional() @IsIn(['DRAFT', 'PUBLISHED']) status?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormSectionDto)
  sections?: FormSectionDto[];
}

export class UpdateFormDto extends CreateFormDto {}
