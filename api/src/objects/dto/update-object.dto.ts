import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Max, Min, ValidateIf } from 'class-validator';
import { Unit } from '../../generated/prisma/client.js';

// Same fields as CreateObjectDto except id: the drawing's UUID never changes.
// ValidateIf skips the checks only when a field is missing; null is still rejected.
export class UpdateObjectDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  type?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(Unit)
  unit?: Unit;

  @ValidateIf((_, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  unitPrice?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(999999999.999)
  quantity?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  articleId?: number;
}
