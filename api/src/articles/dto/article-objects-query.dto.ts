import { IsIn, IsOptional } from 'class-validator';

// Query values are always text, so the flag is checked as the text 'true' or 'false'.
export class ArticleObjectsQueryDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  includeSubArticles?: 'true' | 'false';
}
