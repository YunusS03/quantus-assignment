import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

// ValidateIf instead of IsOptional: IsOptional would also let null through, which these columns can't store.
export class UpdateArticleDto {
  @ValidateIf((_, value) => value !== undefined)
  @Matches(/^(\d{2}\.)+$/, { message: 'code must look like 20. or 20.11.10.' })
  code?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  description?: string;

  // null moves the article to the top level; leaving it out keeps the current parent.
  @IsOptional()
  @IsInt()
  parentId?: number | null;
}
