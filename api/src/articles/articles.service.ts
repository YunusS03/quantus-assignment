import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { codeFitsParent } from './article-code.js';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { UpdateArticleDto } from './dto/update-article.dto.js';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.article.findMany({ orderBy: { code: 'asc' } });
  }

  async findOne(id: number) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article ${id} not found`);
    }
    return article;
  }

  async create(dto: CreateArticleDto) {
    const parentId = dto.parentId ?? null;
    await this.checkCodeFitsParent(dto.code, parentId);
    try {
      return await this.prisma.article.create({ data: { ...dto, parentId } });
    } catch (error) {
      throw this.conflictOnDuplicateCode(error);
    }
  }

  async update(id: number, dto: UpdateArticleDto) {
    const article = await this.findOne(id);
    const code = dto.code ?? article.code;
    const parentId = dto.parentId === undefined ? article.parentId : dto.parentId;

    if (code !== article.code) {
      const childCount = await this.prisma.article.count({ where: { parentId: id } });
      if (childCount > 0) {
        throw new ConflictException('Cannot change the code of an article that has children');
      }
    }
    await this.checkCodeFitsParent(code, parentId);

    try {
      return await this.prisma.article.update({ where: { id }, data: { ...dto, parentId } });
    } catch (error) {
      throw this.conflictOnDuplicateCode(error);
    }
  }

  // No cascade delete: removing an article must never silently remove its children or objects.
  async remove(id: number) {
    await this.findOne(id);
    const childCount = await this.prisma.article.count({ where: { parentId: id } });
    const objectCount = await this.prisma.drawingObject.count({ where: { articleId: id } });
    if (childCount > 0 || objectCount > 0) {
      throw new ConflictException('Cannot delete an article that has child articles or objects');
    }
    await this.prisma.article.delete({ where: { id } });
  }

  private async checkCodeFitsParent(code: string, parentId: number | null) {
    let parentCode: string | null = null;
    if (parentId !== null) {
      const parent = await this.prisma.article.findUnique({ where: { id: parentId } });
      if (!parent) {
        throw new BadRequestException(`Parent article ${parentId} does not exist`);
      }
      parentCode = parent.code;
    }
    // This rule also makes cycles impossible: a parent's code is always shorter than its child's.
    if (!codeFitsParent(code, parentCode)) {
      throw new BadRequestException(
        parentCode === null
          ? `A top-level code must be one group, like 20. (got ${code})`
          : `Code ${code} must be the parent code ${parentCode} plus one group`,
      );
    }
  }

  // P2002 is Prisma's error code for a unique constraint violation.
  private conflictOnDuplicateCode(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException('An article with this code already exists');
    }
    return error;
  }
}
