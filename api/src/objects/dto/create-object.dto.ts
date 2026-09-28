import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, IsUUID, Max, Min } from 'class-validator';
import { Unit } from '../../generated/prisma/client.js';

export class CreateObjectDto {
  // The UUID comes from the drawing, not from the database.
  @IsUUID('all')
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  // Free text, because Vectorworks decides the object types (Wall, Door, ...).
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsEnum(Unit)
  unit: Unit;

  // The limits match the database columns Decimal(12,2) and Decimal(12,3),
  // so a too-large value gets a 400 instead of a database error.
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  unitPrice: number;

  // Mocked: in Quantus this would be measured from the drawing.
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(999999999.999)
  quantity: number;

  @IsInt()
  articleId: number;
}
