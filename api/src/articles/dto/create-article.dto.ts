import { IsInt, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateArticleDto {
  // Two-digit groups keep text sorting in the real order ("20.02." before "20.11.").
  @Matches(/^(\d{2}\.)+$/, { message: 'code must look like 20. or 20.11.10.' })
  code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  // HTML text, standing in for rich text.
  @IsString()
  description: string;

  @IsOptional()
  @IsInt()
  parentId?: number | null;
}
